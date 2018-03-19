//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace LDAP_Database_Cache_Update.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class Provider
    {
        public long Id { get; set; }
        public Nullable<long> MasterId { get; set; }
        public string ProviderNumber { get; set; }
        public string HospitalDepartment { get; set; }
        public string SpecialtyCode { get; set; }
        public string Type { get; set; }
        public string LicenseNumber { get; set; }
        public Nullable<System.DateTime> ActiveDate { get; set; }
        public Nullable<System.DateTime> InactiveDate { get; set; }
        public string Address { get; set; }
        public string ResidentDEANumber { get; set; }
        public string NPI { get; set; }
        public Nullable<System.DateTime> DateLastUpdated { get; set; }
    
        public virtual Person Person { get; set; }
    }
}
