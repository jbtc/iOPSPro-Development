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
    
    public partial class Subscription
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Subscription()
        {
            this.SubscriptionModules = new HashSet<SubscriptionModule>();
            this.SubscriptionUsers = new HashSet<SubscriptionUser>();
        }
    
        public long Id { get; set; }
        public Nullable<long> CompanyId { get; set; }
        public Nullable<System.DateTime> InitiationDate { get; set; }
        public Nullable<long> ContactPersonId { get; set; }
        public Nullable<System.DateTime> TerminationDate { get; set; }
        public string Terms { get; set; }
    
        public virtual Company Company { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SubscriptionModule> SubscriptionModules { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SubscriptionUser> SubscriptionUsers { get; set; }
    }
}