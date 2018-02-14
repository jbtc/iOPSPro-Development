using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace iOPS_ODataV4.ViewModels
{

    public class UserRegistrationViewModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
        public string MiddleName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string CompanyName { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
    }
}