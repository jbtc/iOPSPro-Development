using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebSecurityToken.ViewModels
{
	public class UserViewModel
	{
		[Key]
		public long		UserMasterId	{ get; set; }
		public string	GivenName		{ get; set; }
		public string	FamilyName		{ get; set; }
		public string	MiddleName		{ get; set; }
		public string	AddressLine1	{ get; set; }
		public string	AddressLine2	{ get; set; }
		public string	Country			{ get; set; }
		public string	City			{ get; set; }
		public string	ZipCode			{ get; set; }
		public string	HomePhone		{ get; set; }
		public string	MobilePhone		{ get; set; }
		public string	EmailAddress	{ get; set; }
		public string	AccessToken		{ get; set; }
		public string	Username		{ get; set; }
		public string	CompanyName		{ get; set; }
		public IEnumerable<string> Roles { get; set; }
		public string DepartmentName { get; set; }
		public string DepartmentHRId { get; set; }
		public long SupervisorMasterId { get; set; }
		public IEnumerable<long> SubordinateMasterIds { get; set; }


		public string EmployeeId { get; set; }
	}
}