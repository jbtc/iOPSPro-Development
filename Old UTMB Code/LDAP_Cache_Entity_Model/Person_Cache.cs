//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Library.Models.LDAP_Cache
{
    using System;
    using System.Collections.Generic;
    
    public partial class Person_Cache
    {
        public int UTMBMasterID { get; set; }
        public string Username { get; set; }
        public string FamilyName { get; set; }
        public string GivenName { get; set; }
        public string StudentPID { get; set; }
        public Nullable<System.DateTime> LastModifiedDate { get; set; }
        public string PeopleSoftDepartmentID { get; set; }
        public Nullable<byte> ReloadOnNextSync { get; set; }
        public byte[] SerializedZippedPersonObject { get; set; }
    
        public virtual HPRDData HPRDData { get; set; }
    }
}
