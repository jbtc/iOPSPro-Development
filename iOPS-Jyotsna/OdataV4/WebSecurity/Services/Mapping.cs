using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using AutoMapper;
using WebSecurityToken.Models;
using WebSecurityToken.ViewModels;

namespace WebSecurityToken.Services
{
	public static class Mapping
	{

		public static UserViewModel UserEntityToUserViewModel(Models.User userEntity)
		{
	
			var userViewModel = new UserViewModel();


				using (var pdb = new PersonnelEntities())
				{
					using (var wsDB = new WebSecurityEntities())
					{
						var personnelPersonEntity = pdb.People.FirstOrDefault(p => p.MasterId == userEntity.UserMasterId);
						var webSecurityEntity = wsDB.Users.FirstOrDefault(u => u.UserMasterId == userEntity.UserMasterId);

						userViewModel.AccessToken = userEntity.AccessToken;
						userViewModel.EmployeeId = personnelPersonEntity.EmployeeID;
						userViewModel.CompanyName = userEntity.ExternalUser != null ? userEntity.ExternalUser.Organization : "UTMB";
						userViewModel.EmailAddress = userEntity.ExternalUser != null ? userEntity.ExternalUser.Email : personnelPersonEntity.Email;
						userViewModel.FamilyName = userEntity.ExternalUser != null ? userEntity.ExternalUser.LastName : personnelPersonEntity.FamilyName;
						userViewModel.GivenName = userEntity.ExternalUser != null ? userEntity.ExternalUser.FirstName : personnelPersonEntity.GivenName;
						userViewModel.UserMasterId = userEntity.UserMasterId;
						userViewModel.Username = userEntity.Username;
						userViewModel.Roles = personnelPersonEntity
							.ADGroups.Select(g => "ADGroup." + g.Name)
							.ToList()
							.Union(webSecurityEntity
										.UserRoles
										.Select(r => "WebSecurity." + r.Role.Application.Code + "." + r.Role.Name)
							).ToList();
						userViewModel.DepartmentName = personnelPersonEntity.Appointments.Any(a => a.IsPrimaryJob) ? personnelPersonEntity.Appointments.FirstOrDefault(a => a.IsPrimaryJob).Department.Name : null;
						userViewModel.DepartmentHRId = personnelPersonEntity.Appointments.Any(a => a.IsPrimaryJob) ? personnelPersonEntity.Appointments.FirstOrDefault(a => a.IsPrimaryJob).Department.HRDepartmentId : null;
						userViewModel.SupervisorMasterId = personnelPersonEntity.SupervisorMasterId ?? 0;
						userViewModel.SubordinateMasterIds = personnelPersonEntity.Subordinates.Select(s => s.MasterId).ToList();


					}
				}
			return userViewModel;
		}

		

	



	}

	
}