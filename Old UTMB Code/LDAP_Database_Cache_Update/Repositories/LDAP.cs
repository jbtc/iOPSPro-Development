using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.DirectoryServices;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using LDAP_Database_Cache_Update.EF;
using Library.ExtensionMethods.Custom;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NLog.LayoutRenderers;

namespace Repositories
{
	public static class LDAP 
	{
		#region IPeopleRepository Members

		private static Lookup<int, HPRDData> hprdLookup;
		private static int ADGroupLookupsCount;
		private static int ADGroupMemberLookupsCount;
		private static int PersonsBuiltCount;
		private static int ConcurrentAPILookupCount;
		private static List<int> PrincipalInvestigatorMasterIds;
		private static List<int> InstructorMasterIds;
		private static ConcurrentDictionary<string, ADMemberCatche> ADMemberCachesConcurrentDictionary = new ConcurrentDictionary<string, ADMemberCatche>();
		public static ILookup<string, tblPRV_Provider> myUTMBProviderByEmailLookup;

		


 
		private static List<string> GetAdGroupsFromEISWebservice(string username)
		{
			ADGroupLookupsCount++;
				
			var retryCount = 0;

			for (;;)
			{
				try
				{
					ConcurrentAPILookupCount++;
					using (var client = new HttpClient())
					{
						client.BaseAddress = new Uri("https://www.utmb.edu/utmbtoolkit/api/users/ADGroups/");
						client.DefaultRequestHeaders.Accept.Clear();
						client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
						client.Timeout = TimeSpan.FromMinutes(5);

						HttpResponseMessage response = client.GetAsync(username).Result;
						var groups = "";
						if (response.IsSuccessStatusCode)
						{
							groups = response.Content.ReadAsStringAsync().Result;
						}

						if (groups == "")
						{
							return null;
						}
						if (ADGroupLookupsCount%100 == 0)
						{
							Console.WriteLine("{0} AD Lookups Performed - {1} Threads", ++ADGroupLookupsCount, ConcurrentAPILookupCount);
						}
						ConcurrentAPILookupCount--;
						return groups.Replace("[", "").Replace("]", "").Replace("\"", "").Split(new[] { ',' }).Where(g => g.Length > 0).OrderBy(g => g).ToList();
					}
				}
				catch (Exception)
				{
					retryCount++;
					if (retryCount == 1)
					{
						Console.WriteLine("Jim WebAPI retrying.....");
					}
					if (retryCount % 10 == 0)
					{
						Console.WriteLine("Retry Jim WebAPI retry count = {0}", retryCount);
					}
					Thread.Sleep(50);
					if (retryCount > 10000)
					{
						throw;
					}
				}
			}
		}


		public static List<long> GetAdGroupMembersFromEISWebservice(string groupName)
		{
			ADGroupMemberLookupsCount++;

			var retryCount = 0;

			for (; ; )
			{
				try
				{
					using (var client = new HttpClient())
					{
						client.BaseAddress = new Uri("https://sandbox.utmb.edu/utmbtoolkitapi/api/users/ADGroup/MemberUserDns/");
						//client.BaseAddress = new Uri("https://www.utmb.edu/utmbtoolkit/api/users/ADGroup/Members/MasterIds/");
						client.DefaultRequestHeaders.Accept.Clear();
						client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
						client.Timeout = TimeSpan.FromMinutes(5);


						//HttpResponseMessage response = client.GetAsync(groupName).Result;
						HttpResponseMessage response = client.GetAsync("001EpicTRNPLYHyperspaceUsers").Result;
						var members = "";
						if (response.IsSuccessStatusCode)
						{
							members = response.Content.ReadAsStringAsync().Result;
						}
						Console.WriteLine("{0} AD group Member Lookups Performed", ++ADGroupMemberLookupsCount);

						if (members == "")
						{
							return new List<long>();
						}

						members = members.Replace("\"", "|");
						var memberMasterIdList = members
													.Split(new[] {"}"}, StringSplitOptions.None)
													.Where(m => m.Contains("mid"))
													.Select(m => long.Parse(m.Split(new[] {':'})[1]))
													.ToList();
						return memberMasterIdList;
					}
				}
				catch (Exception)
				{
					retryCount++;
					if (retryCount == 1)
					{
						Console.WriteLine("Jim WebAPI retrying.....");
					}
					if (retryCount%10 == 0)
					{
						Console.WriteLine("Retry Jim WebAPI retry count = {0}", retryCount);
					}
					Thread.Sleep(50);
					if (retryCount > 10000)
					{
						throw;
					}
				}
			}
		}

		public class DeserializedJimOutputList
		{
			public List<DeserializedJimOutput> DeserializedJimOutputs { get; set; }
		}
		public class DeserializedJimOutput
		{
			public string mid { get; set; }
			public string uid { get; set; }
		}

		public static IEnumerable<Models.Person> GetHistoryPeople()
		{
			using (var eisDB = new EISTOOLSEntities())
			{
				Console.WriteLine("Getting HPRDData to lookup....");
				hprdLookup = (Lookup<int, HPRDData>)eisDB.HPRDDatas.ToLookup(h => h.E1_MASTER_ID);
				Console.WriteLine("Getting username histories....");
				var usernameHistoryLookup = eisDB.EISUsernameHistories.ToLookup(h => Int64.Parse(h.MASTERID));

				Console.WriteLine("Getting Principal Investigator statuses to a list....");
				PrincipalInvestigatorMasterIds = eisDB.PrincipalInvestigators.Select(pi => pi.MasterID).ToList();

				Console.WriteLine("Getting Instructor MasterIds to a list....");
				InstructorMasterIds = eisDB.Instructors.Select(i => i.MasterID).ToList();


				Console.WriteLine("Getting Supervisor Master Ids to a lookup....");
				var supervisorMasterIdLookup = eisDB.ReportsToes
													.Select(r => new { SubordinateMasterId = (long)r.MasterID, SupervisorMasterId = (long)r.ReportsToMasterID})
													.ToLookup(r => r.SubordinateMasterId);

				Console.WriteLine("Getting Subordinate Master Ids to a lookup....");
				var subordinatesMasterIdsLookup = eisDB.ReportsToes
													.Select(r => new { SubordinateMasterId = (long)r.MasterID, SupervisorMasterId = (long)r.ReportsToMasterID })
													.ToLookup(r => r.SupervisorMasterId);

				Console.WriteLine("Getting myUTMB Providers to a lookup....");
				myUTMBProviderByEmailLookup = (new ProviderClinrepEntities()).tblPRV_Providers.Where(p => p.strEmail != null).ToLookup(p => p.strEmail.ToUpper());


				Console.WriteLine("Getting EIS Everybody ....");
				var rawList = (new EISTOOLSEntities())
					.Everybodies
					//.Take(2000)
					.AsParallel()
					.Where(p => p.utmbuuid < 800000)
					.ToList();

				



			Console.WriteLine("Constructing Person Graphs.....");
			var People = rawList
						.AsParallel()
						.WithDegreeOfParallelism(40)
						.Select(p => new 
						{
							History = p,
							//Need to use the constructed appointment list twice below, create it once here
							Appointments = Build_Appointments_From_History(p),
							PersonsBuilt = ++PersonsBuiltCount
						})
						.Select(p => new Models.Person
						 {
							 MasterId = p.History.utmbuuid,
							 GivenName = p.History.givenname,
							 Title = p.History.title,
							 EmployeeID = p.History.employeeNumber.ToString().PadLeft(7, '0'),
							 Username = p.History.uid,
							 SSNLast4 = (p.History.utmb4Digits ?? 0).ToString(),
							 DateOfBirth = p.History.utmbDOB,
							 DisplayNameLFM = p.History.displayName ?? "",
							 ActiveDirectoryPath = "",
							 DoctorNumber = p.History.utmbdrno ?? "",
							 StudentStanding = p.History.utmbStudStanding,
							 StudentPID = p.History.utmbPNUM ?? "",
							 IsPrincipalInvestigator = PrincipalInvestigatorMasterIds.Any(pi => pi == p.History.utmbuuid),
							 IsInstructor = InstructorMasterIds.Any(pi => pi == p.History.utmbuuid),
							 SupervisorMasterId = supervisorMasterIdLookup[p.History.utmbuuid].Any() ? supervisorMasterIdLookup[p.History.utmbuuid].FirstOrDefault().SupervisorMasterId : 0,
							 SubordinateMasterIds = subordinatesMasterIdsLookup[p.History.utmbuuid].Select(s => s.SubordinateMasterId).ToList(),
							 EducationAffiliation = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(p.History.eduPersonPrimaryAffiliation ?? ""),
							 Email = p.History.mail ?? "",

                            Providers = p.History.mail == null ? null : myUTMBProviderByEmailLookup[p.History.mail.ToUpper()].Select(prv => new Models.Provider
							 {
								MasterId = p.History.utmbuuid,
								ActiveDate = prv.dtmActive,
								Address = prv.strAddress_Line_1 + "\n" + prv.strCity + "," + prv.strState + " " + prv.strZip,
								DateLastUpdated = prv.dtmLast_Updated,
								HospitalDepartment = prv.strDepartment,
								SpecialtyCode = prv.strSpecialty_Code,
								InactiveDate = prv.dtmInactive,
								LicenseNumber = prv.strLicense_Number,
								NPI = prv.strNPI_Number,
								ProviderNumber = prv.strProvider_Number,
								ResidentDEANumber = prv.strResident_DEA_Number,
								Type = prv.strProvider_Type == "S" ? "Staff" :
										prv.strProvider_Type == "F" ? "Faculty" :
										prv.strProvider_Type == "R" ? "Resident" : "",
							 }),

							 FamilyName = p.History.sn,
							 FullName = p.History.cn,
							 Initials = p.History.initials ?? "",
							 Appointments = p.Appointments,

                            UsernameHistories = usernameHistoryLookup[p.History.utmbuuid].Any() ?
												   usernameHistoryLookup[p.History.utmbuuid]
												   .Select(h => new Models.UsernameHistory
												   {
													   Username = h.OLDUSERNAME,
													   InactiveDate = h.DATERETIRED
												   } ).ToList() : null,

                            PhoneNumbers = new Models.PhoneNumbers
							 {
									UTMB = new Models.PhoneNumber
								{
									Number = p.History.telephonenumber,
									IsViewable = p.History.utmbvPhone == "1"
								},
								Home = new Models.PhoneNumber
								{
									Number = p.History.homePhone,
									IsViewable = false
								},
								Mobile = new Models.PhoneNumber
								{
									Number = p.History.Mobile ?? "",
									IsViewable = p.History.utmbvmobile == "1"
								},
								FAX = new Models.PhoneNumber
								{
									Number = p.History.facimileTelephoneNumber ?? "",
									IsViewable = p.History.utmbvFax == "1"
								}
							 },

							 BuildingLocation = new Models.BuildingLocation
							 {
								Code = p.History.utmbBldgCode ?? "",
								Name = p.History.utmbBldgName ?? "",
								RoomNumber = p.History.roomNumber ?? "",
							 },
							 PeopleSoftDepartmentName = p.History.utmbPSDeptName ?? "",
							 MailDeliveryRoute = p.History.utmbDeliveryRoute ?? "",
							 LastModifiedDate = p.History.utmblastmodified ?? DateTime.Parse("1/1/2500"),
							 IsActive = (p.History.utmbemployeestatus ?? 0) == 1 ||
										   (p.History.utmbstudentstatus ?? 0) == 1 ||
										   (p.History.utmbnonustatus ?? 0) == 1,
							// Will beSuperceded by individual group updates
							 ADGroups = ((p.History.utmbemployeestatus ?? 0) == 1 ||
										  (p.History.utmbstudentstatus ?? 0) == 1 ||
										  (p.History.utmbnonustatus ?? 0) == 1) ? GetAdGroupsFromEISWebservice(p.History.uid) : null,

								Status = new Models.Status
							 {
								IsUTMBEmployee = p.History.utmbemployeestatus == 1,
								IsUTMBStudent = false,
								IsNonUTMB = p.History.utmbnonustatus == 1,
								IsContractor = p.Appointments
												   .Any(a => (a.DepartmentName ?? "") == "UTMBHCS Clinical Staffing" 
															   || 
															   (new string[] {"Contractor","Vendor","Consultant","UTMB External" }).Any(s => (a.Title ?? "").Contains(s)) 
															   ||
															   GetHPRD_NonUTMB_Type(p.History.utmbuuid) == "CON"),
								IsVolunteer = GetHPRD_NonUTMB_Type(p.History.utmbuuid) == "VOL",
								IsActive = (p.History.utmbemployeestatus ?? 0) == 1 ||
										   (p.History.utmbstudentstatus ?? 0) == 1 ||
										   (p.History.utmbnonustatus ?? 0) == 1,
								HasExternalEmployeeNumber = p.History.utmbExtEmployeeNumber != 0

							 },
							 ExternalEmployeeID = p.History.utmbExtEmployeeNumber == 0 ? "" : p.History.utmbExtEmployeeNumber.ToString(),
							 Student = new Models.Student
							 {
								Status = p.History.utmbstudentstatus.ToString(),
								IsMDPHD = p.History.utmbMdPhd == "1",
								HasSignedFRPA = p.History.utmbFERPAPub == "1"
							 },
							 NonDisclosureAgreement = new Models.NonDisclosureAgreement
							 {
								SignatureDate = GetHPRDSignatureDate(p.History.utmbuuid),
								ExpirationDate = GetHPRDExpirationDate(p.History.utmbuuid)
							 }
						 })
						 .ToList();

				return People;
			}



		}
		private static IEnumerable<Models.Appointment> Build_Appointments_From_History(Everybody historyPerson)
		{
			//+Appointment Ids
			//Find the PropertyStructure for utmbapptid property
			//Sample:	 72383;1;1~ 72456;2;1~ 74704;2;1~-2;2;1
			var apptids = (historyPerson.utmbapptid ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new [] {";"}, StringSplitOptions.None))
							.Select(a1 => new
											{
												Sequence = Convert.ToInt32(a1.Skip(1).FirstOrDefault()),
												AppointmentId = a1.FirstOrDefault()
											}
									)
							;

			//+Job Codes
			//Sample:	 72383;1025~ 72456;0248~ 74704;1025~-2;-1370
			var job_codes = (historyPerson.utmbapptjobcode ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new [] {";"}, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												JobCode = a1.Skip(1).FirstOrDefault()
												
											}
									)
							;
			//+Job Titles
			//Sample:	 72383;Nurse Practitioner~ 72456;Family Medicine Specialist~ 74704;Nurse Practitioner~-2;Alumni
			var job_titles = (historyPerson.utmbapptjobtitle ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
										{
											AppointmentId = a1.FirstOrDefault(),
											JobTitle = a1.Skip(1).FirstOrDefault()
										}
									)
							;

			//+Department Ids
			//Sample:	 72383;141150~ 72456;143500~ 74704;141166~-2;SON99999
			var dept_ids = (historyPerson.utmbapptpsdeptid ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												DepartmentId = (a1.Skip(1).FirstOrDefault() ?? "").Trim()
											}
									)
							;

			//+Department Names
			//Sample:	 72383;SOM-CBC~ 72456;Family Medicine~ 74704;Urgent Care~-2;School of Nursing
			var dept_names = (historyPerson.utmbapptdepartmentname ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												DepartmentName = (a1.Skip(1).FirstOrDefault() ?? "").Trim()
											}
									)
							;

			//+Position Numbers
			//Sample:	  72383;00072383~ 72456;00072456~ 74704;00074704~-2;-2
			var position_numbers = (historyPerson.utmbapptpositionnumber ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												PositionNumber = a1.Skip(1).FirstOrDefault()
											}
									)
							;


			//+Begin Dates
			//Sample:	   72383;06/06/2005~ 72456;~ 74704;02/15/2006~-2; 1/1/1900                                                                                              
			var begin_dates = (historyPerson.utmbapptbegindate ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												BeginDate = GetValidDate(a1.Skip(1).FirstOrDefault())
											}
									)
							;


			//+Termination Dates
			//Sample:	   72383;06/06/2005~ 72456;~ 74704;02/15/2006~-2; 1/1/1900                                                                                              
			var termination_dates = (historyPerson.utmbapptterminationdate ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												TerminationDate = GetValidDate(a1.Skip(1).FirstOrDefault())
											}
									)
							;


			//+Job Classes
			//Sample:	    72383;C~ 72456;F~ 74704;C~-2;S
			var job_classes = (historyPerson.utmbapptjobclass ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												JobClass = a1.Skip(1).FirstOrDefault()
											}
									)
							;


			//+Percent Times
			//Sample:	    72383;1.000000~ 72456;0.000000~ 74704;0.000000~-2;0.000000
			var percent_times = (historyPerson.utmbapptpercenttime ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
										{
											AppointmentId = a1.FirstOrDefault(),
											PercentTime = Convert.ToSingle(a1.Skip(1).FirstOrDefault()) * 100
										}
									)
							;


			//+Primary Jobs
			//Sample:	    72383;P~ 72456;S~ 74704;S~-2;S
			var primary_jobs = (historyPerson.utmbapptprimaryjobindicator ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												IsPrimaryJob = a1.Skip(1).FirstOrDefault() == "P"
											}
									)
							;


			//+Business Unit
			//Sample:	    72383;P~ 72456;S~ 74704;S~-2;S
			var business_units = (historyPerson.utmbapptbusinessunit ?? "")
							.Split(new[] { "~" }, StringSplitOptions.None)
							.Select(a => a.Split(new[] { ";" }, StringSplitOptions.None))
							.Select(a1 => new
											{
												AppointmentId = a1.FirstOrDefault(),
												BusinessUnit = a1.Skip(1).FirstOrDefault()
											}
									)
							;




			var appt = from id in apptids
					   join jobcode in job_codes on id.AppointmentId equals jobcode.AppointmentId into jobcode_j
					   join jobtitle in job_titles on id.AppointmentId equals jobtitle.AppointmentId into jobtitle_j
					   join deptid in dept_ids on id.AppointmentId equals deptid.AppointmentId into deptid_j
					   join deptname in dept_names on id.AppointmentId equals deptname.AppointmentId into deptname_j
					   join posnumber in position_numbers on id.AppointmentId equals posnumber.AppointmentId into posnumber_j
					   join begindate in begin_dates on id.AppointmentId equals begindate.AppointmentId into begindate_j
					   join termdate in termination_dates on id.AppointmentId equals termdate.AppointmentId into termdate_j
					   join jobclass in job_classes on id.AppointmentId equals jobclass.AppointmentId into jobclass_j
					   join percenttime in percent_times on id.AppointmentId equals percenttime.AppointmentId into percenttime_j
					   join primaryjob in primary_jobs on id.AppointmentId equals primaryjob.AppointmentId into primaryjob_j
					   join busunit in business_units on id.AppointmentId equals busunit.AppointmentId into busunit_j
					   from jobcode in jobcode_j.DefaultIfEmpty()
					   from jobtitle in jobtitle_j.DefaultIfEmpty()
					   from deptid in deptid_j.DefaultIfEmpty()
					   from deptname in deptname_j.DefaultIfEmpty()
					   from posnumber in posnumber_j.DefaultIfEmpty()
					   from begindate in begindate_j.DefaultIfEmpty()
					   from termdate in termdate_j.DefaultIfEmpty()
					   from jobclass in jobclass_j.DefaultIfEmpty()
					   from percenttime in percenttime_j.DefaultIfEmpty()
					   from primaryjob in primaryjob_j.DefaultIfEmpty()
					   from busunit in busunit_j.DefaultIfEmpty()



					   select new Models.Appointment
					   {
						   AppointmentId = id.AppointmentId,
						   AppointmentSequence = (byte)id.Sequence,
						   BeginDate = begindate != null ? begindate.BeginDate : null,
						   BusinessUnit = busunit != null ? busunit.BusinessUnit : "",
						   DepartmentName = deptname != null ? deptname.DepartmentName : "",
						   DepartmentId = deptid != null ? deptid.DepartmentId : "",
						   IsPrimaryJob = primaryjob != null && primaryjob.IsPrimaryJob,
						   JobCode = jobcode != null ? jobcode.JobCode : "",
						   PercentTime = percenttime != null ? percenttime.PercentTime : (float)0.0,
						   PositionNumber = posnumber != null ? posnumber.PositionNumber : "",
						   TerminationDate = termdate != null ? termdate.TerminationDate : null,
						   Title = jobtitle != null ? jobtitle.JobTitle : ""
					   };


			return appt.OrderByDescending(a => a.IsPrimaryJob).ThenBy(a => a.BeginDate).ToList();



		}



		#endregion




		private static DateTime? GetValidDate(string input)
		{
			DateTime output;
			DateTime? nullable_output = null;
			if (DateTime.TryParse(input, out output))
			{
				nullable_output = output;
			}
			return nullable_output;

		}

		private static DateTime GetLastModifiedDateFromString(string input)
		{
			var parseableDate = string.Format("{0}/{1}/{2} {3}:{4}", input.Substring(4, 2), input.Substring(6, 2), input.Substring(0, 4), input.Substring(8, 2), input.Substring(10, 2));
			DateTime output;
			if (DateTime.TryParse(parseableDate, out output))
			{
				return output;
			}
			else
			{
				return DateTime.Parse("1/1/2500").Date;
			};
		}


		private static DateTime? GetHPRDExpirationDate(int masterId)
		{
			var HPRD_Entity = hprdLookup[masterId].FirstOrDefault();
			return HPRD_Entity == null ? null : HPRD_Entity.E1_EXPIRE_DT;
		}
		private static DateTime? GetHPRDSignatureDate(int masterId)
		{
			var HPRD_Entity = hprdLookup[masterId].FirstOrDefault();
			return HPRD_Entity == null ? null : HPRD_Entity.E1_SIGN_DT;
		}
		private static string GetHPRD_NonUTMB_Type(int masterId)
		{
			var HPRD_Entity = hprdLookup[masterId].FirstOrDefault();
			return HPRD_Entity == null ? "" : HPRD_Entity.E1_NON_U_TYPE;
		}
		
	}
}
