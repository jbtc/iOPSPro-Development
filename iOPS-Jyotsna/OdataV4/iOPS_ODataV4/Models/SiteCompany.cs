//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace iOPS_ODataV4.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class SiteCompany
    {
        public long Id { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<long> CompanyId { get; set; }
    
        public virtual Company Company { get; set; }
        public virtual Site Site { get; set; }
    }
}