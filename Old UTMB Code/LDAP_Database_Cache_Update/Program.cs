using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Diagnostics;
using System.DirectoryServices;
using System.Threading.Tasks;
using System.Linq;
using System.Net.NetworkInformation;
using LDAP_Database_Cache_Update.EF;
using Library.ExtensionMethods.Custom;
using Newtonsoft.Json;
using NLog;
using NLog.Config;
using NLog.LayoutRenderers.Wrappers;
using NLog.Targets;
using Repositories;

namespace LDAP_Database_Cache_Update
{
    public class MasterIdWithADGroups
    {
        public long MasterId { get; set; }
        public List<string> ADGroups { get; set; }
    }

    public class EISTimekeeperDepartmentDTO
    {
        public long MasterId { get; set; }
        public string PeopleSoftDepartmentID { get; set; }
        public long DepartmentId { get; set; }
    }

    static class Program
    {
        public static long ImportCount { get; set; }
        public static ILookup<string, string> dbHashLookup { get; set; }
        public static long LDAPCount { get; set; }
        public static long UnchangedCount { get; set; }
        public static long ChangedCount { get; set; }
        public static long NewCount { get; set; }

        public static string ODataModelConnectionStringName { get; set; }
        public static ILookup<long, MasterIdWithADGroups> UnChangedPersonADGroupsLookup;
        public static ConcurrentDictionary<string, ADMemberCatche> ADMemberCachesConcurrentDictionary = new ConcurrentDictionary<string, ADMemberCatche>();
        public static ILookup<long, EISTimekeeperDepartmentDTO> EISTimekeeperDepartmentLookup;
        public static ILookup<string, Department> DepartmentHRToDepartmentLookup;
        public static List<long> ShiftEligibleMasterIds;
        public static List<long> ExemptMasterIds;
        public static ILookup<long, EF.PostionNumber> PositionNumberLookup;
        static void Main(string[] args)
        {
            //IEnumerable<Models.Person> peopleToUpdate;
            ODataModelConnectionStringName = !args.Any() ? "OdataEntities" : args.First();

            (new EISTOOLSEntities())
                .ADMemberCatches
                .AsParallel()
                .ForAll(mc =>
                        {
                            ADMemberCachesConcurrentDictionary.TryAdd(mc.userdn, mc);
                        }
            );

            //UpdateADGroups();

            //+TimekeeperDepartments Lookup
            //Get the distinct listing of timekeeper departments.
            EISTimekeeperDepartmentLookup = (new EISTOOLSEntities()).EISTimekeeperDepartments.Select(tkd => new EISTimekeeperDepartmentDTO { MasterId = (long)tkd.MasterId, PeopleSoftDepartmentID = tkd.PeopleSoftDepartmentID }).ToLookup(g => g.MasterId);





            Console.WriteLine("{0} Started with ConnectionStringName = {1}", DateTime.Now, ODataModelConnectionStringName);
            Console.WriteLine("{0} Creating Hash Lookup of DB people....", DateTime.Now);
            var swAll = Stopwatch.StartNew();
            using (var db = new OdataEntities(ODataModelConnectionStringName))
            {
                db.Database.CommandTimeout = 180;
                dbHashLookup = db.People.Select(p => p.Hash).AsParallel().ToLookup(p => p);
            }
            Console.WriteLine("{0} Elapsed time to create hash lookup of DB People = {1}ms", DateTime.Now, swAll.HighResolutionElapsedMilliseconds());



            Console.WriteLine("Loading Histories...");
            swAll = Stopwatch.StartNew();
            var people = LDAP.GetHistoryPeople();
            var elapsed = swAll.HighResolutionElapsedMilliseconds();
            Console.WriteLine("{0} History Load Time = {1}", DateTime.Now, elapsed);
            LDAPCount = people.Count();
            ImportCount = 0;

            Program.ShiftEligibleMasterIds = (new EISTOOLSEntities()).SHIFTELIGIBLEs.Select(s => (long)s.MasterID).ToList();
            Program.ExemptMasterIds = (new EISTOOLSEntities()).EXEMPTs.Select(s => (long)s.MasterID).ToList();
            Program.PositionNumberLookup = (new EISTOOLSEntities()).PostionNumbers.ToLookup(p => (long)p.MasterID);

            Console.WriteLine("{0} Updating the OData Model....", DateTime.Now);

            //++ADGroups
            //Get the distinct listing of group names present in the people collection.
            //Add any group names not already in the ADGroups dbset. 
            //This HAS TO BE done prior to the parallel update below to prevent duplicate group name insertions into ADGroups.
            var distinctGroupNames =
                people
                    .Where(p => p.ADGroups != null)
                    .Select(p => p.ADGroups.Select(g => g))
                    .SelectMany(g => g)
                    .Distinct()
                    .Where(n => !n.IsNullOrEmpty())
                    .ToList();


            var existingGroupLookup = (new OdataEntities(ODataModelConnectionStringName)).ADGroups.ToLookup(g => g.Name);

            distinctGroupNames
                .Where(gn => gn != null)
                .AsParallel()
                .WithDegreeOfParallelism(80)
                .ForAll(gn =>
                {
                    using (var gdb = new OdataEntities(ODataModelConnectionStringName))
                    {
                        if (!existingGroupLookup[gn].Any())
                        {
                            gdb.ADGroups.Add(new ADGroup { Name = gn });
                            Console.WriteLine("Added new ADGroup Name = {0}", gn);
                            gdb.SaveChanges();
                        }
                    }
                });

            //++Departments
            //Get the distinct listing of department present in the people appointments collections.
            //Add any Departments not already in the Departments dbset. 
            //This HAS TO BE done prior to the parallel update below to prevent duplicate Department insertions into Departments.
            var distinctDepartments =
                people
                    .Where(p => p.Appointments != null)
                    .Select(p => p.Appointments.Select(a => a.DepartmentId.Trim() + "|" + a.DepartmentName.Trim()))
                    .SelectMany(d => d)
                    .Distinct()
                    .Select(d => new
                    {
                        HRDepartmentId = d.Split(new[] { '|' })[0],
                        DepartmentName = d.Split(new[] { '|' })[1]
                    })
                    .Where(d => !d.DepartmentName.IsNullOrEmpty())
                    .ToList();


            DepartmentHRToDepartmentLookup = (new OdataEntities(ODataModelConnectionStringName)).Departments.ToLookup(g => g.HRDepartmentId);

            distinctDepartments
                .AsParallel()
                .WithDegreeOfParallelism(80)
                .ForAll(d =>
                {
                    using (var deptDb = new OdataEntities(ODataModelConnectionStringName))
                    {
                        if (!DepartmentHRToDepartmentLookup[d.HRDepartmentId].Any())
                        {
                            deptDb.Departments.Add(new Department { Name = d.DepartmentName, HRDepartmentId = d.HRDepartmentId });
                            Console.WriteLine("Added new Department = {0}", d.DepartmentName);
                            deptDb.SaveChanges();
                        }
                    }
                });




            //foreach (var person in people)
            //{
            //	UpdatePerson(person);
            //}
            people.AsParallel().WithDegreeOfParallelism(6).ForAll(UpdatePerson);
            var elapsed2 = swAll.HighResolutionElapsedMilliseconds();
            Console.WriteLine("{0} Finished", DateTime.Now);

        }

        private static void UpdateADGroups()
        {
            using (var eisDB = new EISTOOLSEntities())
            {
                Console.WriteLine("Updating ADGroups changes in the last 24 hours");
                var changeDate = DateTime.Now - TimeSpan.FromDays(1);

                //Find all groups who have changed and retreive the member list from the EIS WebAPI
                var ChangedADGroupsFromEIS = eisDB.ADMemberCatches
                    .Where(c => c.objectcategory == "CN=Group")
                    .Where(c => c.whenchanged > changeDate)
                    .ToList()
                    //.AsParallel()
                    //.WithDegreeOfParallelism(40)
                    .Select(c => new { GroupName = c.cn, CurrentMemberMasterIds = LDAP.GetAdGroupMembersFromEISWebservice(c.cn) })
                    .ToList();



                //For each changed group, update the person members in the database
                ChangedADGroupsFromEIS
                    .AsParallel()
                    .WithDegreeOfParallelism(60)
                    .ForAll(changedADGroupFromEIS =>
                    {
                        using (var odataDB = new OdataEntities(ODataModelConnectionStringName))
                        {
                            var ChangedADGroupEntitiesFromDB = odataDB.ADGroups
                                .Include(g => g.People)
                                .FirstOrDefault(adg => adg.Name == changedADGroupFromEIS.GroupName);


                            if (ChangedADGroupEntitiesFromDB != null)
                            {
                                Console.WriteLine("Checking membership for {0}", ChangedADGroupEntitiesFromDB.Name);
                                var masterIdsInTheDatabaseForChangedGroup = ChangedADGroupEntitiesFromDB.People.Select(p => p.MasterId).ToList();

                                //Find the members that have been added to the group and add them in the database
                                changedADGroupFromEIS.CurrentMemberMasterIds
                                    .Except(masterIdsInTheDatabaseForChangedGroup)
                                    .ToList()
                                    .ForEach(changedGroupMemberMasterIdToAdd =>
                                    {
                                        Console.WriteLine("Adding MasterId {0} to ADGroup {1}", changedGroupMemberMasterIdToAdd, ChangedADGroupEntitiesFromDB.Name);
                                        ChangedADGroupEntitiesFromDB.People.Add(odataDB.People.FirstOrDefault(p => p.MasterId == changedGroupMemberMasterIdToAdd));
                                    });

                                odataDB.SaveChanges();



                                //Find the members that have been removed from the group and remove them from the database
                                masterIdsInTheDatabaseForChangedGroup
                                    .Except(changedADGroupFromEIS.CurrentMemberMasterIds)
                                    .ToList()
                                    .ForEach(dbGroupMemberMasterIdToDelete =>
                                    {
                                        Console.WriteLine("Removing MasterId {0} from ADGroup {1}", dbGroupMemberMasterIdToDelete, ChangedADGroupEntitiesFromDB.Name);
                                        ChangedADGroupEntitiesFromDB.People.Remove(ChangedADGroupEntitiesFromDB.People.First(p => p.MasterId == dbGroupMemberMasterIdToDelete));
                                    });

                                odataDB.SaveChanges();

                            }
                        }
                    });


            }

        }
        private static void UpdatePerson(Models.Person person)
        {
            if (++ImportCount % 500 == 0)
            {
                Console.WriteLine("Importing {0} of {1}", ImportCount, LDAPCount);
            }

            person.TimekeeperDepartmentIds = EISTimekeeperDepartmentLookup[person.MasterId].Select(lu =>
            {
                var department = DepartmentHRToDepartmentLookup[lu.PeopleSoftDepartmentID].FirstOrDefault();
                if (department != null)
                {
                    return department.Id;
                }
                else
                {
                    return 0;
                }
            }).Where(i => i > 0);

            if (!person.TimekeeperDepartmentIds.Any())
            {
                person.TimekeeperDepartmentIds = null;
            }

            person.IsExempt = ExemptMasterIds.Any(e => e == person.MasterId);
            person.IsShiftEligible = ShiftEligibleMasterIds.Any(e => e == person.MasterId);

            var pnum = PositionNumberLookup[person.MasterId].FirstOrDefault();
            person.PositionNumber = pnum != null ? pnum.PostionNumber1 : null;

            var hash = JsonConvert.SerializeObject(person).GetSHA256AsHexString();

            if (!dbHashLookup[hash].Any())
            {
                //Hash not found - either the person has changed or they are new
                using (var db = new OdataEntities(ODataModelConnectionStringName))
                {
                    var personEntity = db.People.FirstOrDefault(p => p.MasterId == person.MasterId) ?? db.People.Add(new Person { MasterId = person.MasterId });


                    personEntity.LastModifiedDate = DateTime.Now;
                    personEntity.Hash = hash;
                    personEntity.Username = person.Username;
                    personEntity.ActiveDirectoryPath = person.ActiveDirectoryPath;
                    personEntity.DateOfBirth = person.DateOfBirth;
                    personEntity.DisplayNameLFM = person.DisplayNameLFM;
                    personEntity.DoctorNumber = person.DoctorNumber;
                    personEntity.EducationAffiliation = person.EducationAffiliation;
                    personEntity.Email = person.Email;
                    personEntity.EmployeeID = person.EmployeeID;
                    personEntity.ExternalEmployeeID = person.ExternalEmployeeID;
                    personEntity.FamilyName = person.FamilyName;
                    personEntity.FullName = person.FullName;
                    personEntity.GivenName = person.GivenName;
                    personEntity.Initials = person.Initials;
                    personEntity.MailDeliveryRoute = person.MailDeliveryRoute;
                    personEntity.StudentPID = person.StudentPID;
                    personEntity.StudentStanding = person.StudentStanding;
                    personEntity.IsActive = person.IsActive;
                    personEntity.IsPrincipalInvestigator = person.IsPrincipalInvestigator;
                    personEntity.IsInstructor = person.IsInstructor;
                    personEntity.SupervisorMasterId = person.SupervisorMasterId == 0 ? (long?)null : person.SupervisorMasterId;
                    personEntity.IsShiftEligible = person.IsShiftEligible;
                    personEntity.IsExempt = person.IsExempt;
                    personEntity.PositionNumber = person.PositionNumber;
                    //++Subordinates

                    foreach (var subordinate in personEntity.Subordinates.ToList())
                    {
                        personEntity.Subordinates.Remove(subordinate);
                    }
                    if (person.SubordinateMasterIds != null)
                    {

                        foreach (var subordinateMasterId in person.SubordinateMasterIds.OrderBy(g => g))
                        {
                            personEntity.Subordinates.Add(db.People.FirstOrDefault(g => g.MasterId == subordinateMasterId));
                        }
                    }
                    //db.SaveChanges();

                    //++ADGroups - will be superceded by individual updates
                    foreach (var adGroup in personEntity.ADGroups.ToList())
                    {
                        personEntity.ADGroups.Remove(adGroup);
                    }
                    if (person.ADGroups != null)
                    {

                        foreach (var group in person.ADGroups.OrderBy(g => g))
                        {
                            personEntity.ADGroups.Add(db.ADGroups.FirstOrDefault(g => g.Name == group));
                        }
                    }

                    //db.SaveChanges();

                    //++Appointments
                    foreach (var appointment in personEntity.Appointments.ToList())
                    {
                        db.Appointments.Remove(appointment);
                    }
                    foreach (var appointment in person.Appointments)
                    {

                        personEntity.Appointments.Add(new Appointment
                        {
                            MasterId = person.MasterId,
                            AppointmentSequence = (byte)appointment.AppointmentSequence,
                            BeginDate = appointment.BeginDate,
                            BusinessUnit = appointment.BusinessUnit,
                            IsPrimaryJob = appointment.IsPrimaryJob,
                            JobCode = appointment.JobCode,
                            PercentTime = appointment.PercentTime,
                            PositionNumber = appointment.PositionNumber,
                            TerminationDate = appointment.TerminationDate,
                            Title = appointment.Title,
                            Department = db.Departments.FirstOrDefault(d => d.HRDepartmentId == appointment.DepartmentId)
                        }
                                                );
                    }


                    //++Provider Records
                    foreach (var provider in personEntity.Providers.ToList())
                    {
                        db.Providers.Remove(provider);
                    }

                    if (person.Providers != null)
                    {
                        foreach (var provider in person.Providers.ToList())
                        {

                            personEntity.Providers.Add(new Provider
                            {
                                MasterId = person.MasterId,
                                SpecialtyCode = provider.SpecialtyCode,
                                ResidentDEANumber = provider.ResidentDEANumber,
                                LicenseNumber = provider.LicenseNumber,
                                HospitalDepartment = provider.HospitalDepartment,
                                InactiveDate = provider.InactiveDate,
                                NPI = provider.NPI,
                                ProviderNumber = provider.ProviderNumber,
                                Type = provider.Type,
                                ActiveDate = provider.ActiveDate,
                                DateLastUpdated = provider.DateLastUpdated,
                                Address = provider.Address
                            });
                        }

                    }


                    //++UsernameHistories
                    foreach (var usernameHistory in personEntity.UsernameHistories.ToList())
                    {
                        db.UsernameHistories.Remove(usernameHistory);
                    }
                    if (person.UsernameHistories != null)
                    {
                        foreach (var usernameHistory in person.UsernameHistories)
                        {
                            personEntity.UsernameHistories.Add(new UsernameHistory
                            {

                                Username = usernameHistory.Username,
                                InactiveDate = usernameHistory.InactiveDate
                            });
                        }
                    }
                    //db.SaveChanges();

                    //++TimekeeperDepartments
                    if (personEntity.TimekeeperDepartments.Any())
                    {
                        foreach (var dept in personEntity.TimekeeperDepartments.ToList())
                        {
                            db.TimekeeperDepartments.Remove(dept);
                        }

                    }

                    if (person.TimekeeperDepartmentIds != null)
                    {
                        if (person.TimekeeperDepartmentIds.Any())
                        {
                            foreach (var tkdId in person.TimekeeperDepartmentIds)
                            {
                                personEntity.TimekeeperDepartments.Add(new LDAP_Database_Cache_Update.EF.TimekeeperDepartment
                                {
                                    DepartmentId = tkdId
                                });
                            }
                        }
                    }
                    db.SaveChanges();



                    //++Building Location
                    if (personEntity.BuildingLocation == null)
                    {
                        personEntity.BuildingLocation = new BuildingLocation();
                    }
                    personEntity.BuildingLocation.MasterId = person.MasterId;
                    personEntity.BuildingLocation.Code = person.BuildingLocation.Code;
                    personEntity.BuildingLocation.Name = person.BuildingLocation.Name;
                    personEntity.BuildingLocation.RoomNumber = person.BuildingLocation.RoomNumber;
                    //db.SaveChanges();



                    //++Phone Numbers
                    foreach (var phoneNumber in personEntity.PhoneNumbers.ToList())
                    {
                        db.PhoneNumbers.Remove(phoneNumber);
                    }
                    if (person.PhoneNumbers.UTMB != null)
                    {
                        personEntity.PhoneNumbers.Add(new PhoneNumber
                        {
                            MasterId = person.MasterId,
                            IsViewable = person.PhoneNumbers.UTMB.IsViewable,
                            Number = person.PhoneNumbers.UTMB.Number,
                            Type = "UTMB"
                        });
                    }
                    //db.SaveChanges();

                    //++Status
                    if (personEntity.Status == null)
                    {
                        personEntity.Status = new Status();
                    }

                    personEntity.Status.HasExternalEmployeeNumber = person.Status.HasExternalEmployeeNumber;
                    personEntity.Status.IsActive = person.Status.IsActive;
                    personEntity.Status.IsContractor = person.Status.IsContractor;
                    personEntity.Status.IsNonUTMB = person.Status.IsNonUTMB;
                    personEntity.Status.IsNonUTMBStudent = person.Status.IsNonUTMBStudent;
                    personEntity.Status.IsUTMBEmployee = person.Status.IsUTMBEmployee;
                    personEntity.Status.IsUTMBStudent = person.Status.IsNonUTMBStudent;
                    personEntity.Status.IsVolunteer = person.Status.IsVolunteer;
                    //db.SaveChanges();


                    //++Student
                    if (personEntity.Student == null)
                    {
                        personEntity.Student = new Student();
                    }
                    personEntity.Student.Status = person.Student.Status;
                    personEntity.Student.HasSignedFRPA = person.Student.HasSignedFRPA;
                    personEntity.Student.IsMDPHD = person.Student.IsMDPHD;



                    db.SaveChanges();
                }

            }


        }








    }
}
