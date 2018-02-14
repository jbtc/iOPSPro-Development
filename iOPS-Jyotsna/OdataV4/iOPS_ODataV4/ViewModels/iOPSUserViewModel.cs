using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace iOPS_ODataV4.ViewModels
{
    public class iOPSUserViewModel
    {
        [Key]
        public long Id { get; set; }
        public CompanyViewModel Company { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
        public string MiddleName { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string CountryId { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string ODataAccessToken { get; set; }
        public string AuthenticationToken { get; set; }
        public string Username { get; set; }
        public string PasswordChangeLoginToken { get; set; }
        public List<string> AuthorizedActivities { get; set; }

        public List<String> ReaderOf { get; set; }
    }
}