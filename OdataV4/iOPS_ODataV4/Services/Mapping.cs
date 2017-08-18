using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using iOPS_ODataV4.Models;
using iOPS_ODataV4.ViewModels;

namespace iOPS_ODataV4.Services
{
    public static class Mapping
    {

        public static iOPSUserViewModel UserEntityToUserViewModel(Models.iOPSUser userEntity)
        {

            var userViewModel = new iOPSUserViewModel();


            using (var db = new iOPS_NormalizedEntities())
            {


                userViewModel.ODataAccessToken = userEntity.AccessToken;

                userViewModel.Company = new CompanyViewModel
                {
                    Id = userEntity.Person.CompanyContacts.FirstOrDefault()?.Company.Id,
                    Name = userEntity.Person.CompanyContacts.FirstOrDefault()?.Company.Name
                };
                userViewModel.Email = userEntity.Person.Email;
                userViewModel.FamilyName = userEntity.Person.FamilyName;
                userViewModel.GivenName = userEntity.Person.GivenName;
                userViewModel.Id = userEntity.Id;
                userViewModel.PasswordChangeLoginToken = userEntity.PasswordChangeLoginToken;
                userViewModel.Username = userEntity.Username;
                userViewModel.AuthorizedActivities = userEntity.UserAuthorizedActivities.Select(a => "AuthorizedActivity." + a.AuthorizableActivity.Activity).ToList();
                userViewModel.ReaderOf =
                    userEntity.CompanyDataReaders.Select(cr => "Company." + cr.Company.Name)
                    .Concat(userEntity.SiteDataReaders.Select(sr => "Site." + sr.Site.Name))
                    .ToList();
            }
            return userViewModel;
        }







    }


}