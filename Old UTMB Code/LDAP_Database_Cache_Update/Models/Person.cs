using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using LDAP_Database_Cache_Update.EF;

namespace Models
{
	public class Person
	{
		[Key]
		public int MasterId { get; set; }			//utmbuuid

		public string Username { get; set; }			//uid
		public string EmployeeID { get; set; }
		public string GivenName { get; set; }
		public string Initials { get; set; }
		public string FamilyName { get; set; }
		public DateTime? DateOfBirth { get; set; }
		public string SSNLast4 { get; set; }
		public string Title { get; set; }
		public string DisplayNameLFM { get; set; }
		public string FullName { get; set; }
		public string StudentPID { get; set; }
		public string StudentStanding { get; set; }
		public string DoctorNumber { get; set; }
		public string Email { get; set; }
		public PhoneNumbers PhoneNumbers { get; set; }
		public string ActiveDirectoryPath { get; set; }
		public string EducationAffiliation { get; set; }
		public BuildingLocation BuildingLocation { get; set; }
		public string MailDeliveryRoute { get; set; }
		public Status Status { get; set; }
		public string PeopleSoftDepartmentName { get; set; }
		public NonDisclosureAgreement NonDisclosureAgreement { get; set; }
		public Student Student { get; set; }
		public DateTime LastModifiedDate { get; set; }
		public IEnumerable<Appointment> Appointments { get; set; }
		public string ExternalEmployeeID { get; set; }
		public string Hash { get; set; }
		public bool IsActive { get; set; }
        public IEnumerable<Models.UsernameHistory> UsernameHistories { get; set; }

        public IEnumerable<Models.Provider> Providers { get; set; }

        public IEnumerable<string> ADGroups { get; set; }

        public bool IsPrincipalInvestigator { get; set; }
		public bool IsInstructor { get; set; }
		public long SupervisorMasterId { get; set; }
		public IEnumerable<long> SubordinateMasterIds { get; set; }
		public IEnumerable<long> TimekeeperDepartmentIds { get; set; }

		public bool IsShiftEligible { get; set; }
		public bool IsExempt { get; set; }
		public string PositionNumber { get; set; }


	}
}
