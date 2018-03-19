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
    
    public partial class SubscriptionSiteUser
    {
        public long Id { get; set; }
        public Nullable<long> SubscriptionId { get; set; }
        public Nullable<long> UserId { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<bool> IsAdmin { get; set; }
        public Nullable<System.DateTime> LastModifiedDate { get; set; }
        public Nullable<long> LastModifiedUserId { get; set; }
        public Nullable<System.DateTime> CreationDate { get; set; }
        public Nullable<long> CreatorUserId { get; set; }
    
        public virtual Site Site { get; set; }
        public virtual iOPSUser User { get; set; }
        public virtual iOPSUser LastModifiedUser { get; set; }
        public virtual iOPSUser CreatorUser { get; set; }
    }
}
