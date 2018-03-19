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
    
    public partial class Cache_Statistic
    {
        public string SearchString { get; set; }
        public string LastResultSource { get; set; }
        public Nullable<int> PersonCount { get; set; }
        public Nullable<System.DateTime> LastSearchDate { get; set; }
        public Nullable<long> LocalStaticCopyHits { get; set; }
        public Nullable<double> LocalStaticCopyAverageDeliveryMilliseconds { get; set; }
        public Nullable<long> MemoryCacheHits { get; set; }
        public Nullable<double> MemoryCacheAverageDeliveryMilliseconds { get; set; }
        public Nullable<long> DatabaseHits { get; set; }
        public Nullable<double> DatabaseAverageDeliveryMilliseconds { get; set; }
        public Nullable<long> LDAPHits { get; set; }
        public Nullable<double> LDAPAverageDeliveryMilliseconds { get; set; }
    }
}
