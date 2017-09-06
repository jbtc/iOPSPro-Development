//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WebSecurityToken.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class User
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public User()
        {
            this.ActivityLogs = new HashSet<ActivityLog>();
            this.UserRoles = new HashSet<UserRole>();
        }
    
        public long UserMasterId { get; set; }
        public Nullable<decimal> MyUtmbUserId { get; set; }
        public string Username { get; set; }
        public string AccessToken { get; set; }
        public Nullable<System.DateTime> AccessTokenDate { get; set; }
        public Nullable<bool> IsSystemAdministrator { get; set; }
        public Nullable<bool> IsExternal { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ActivityLog> ActivityLogs { get; set; }
        public virtual ExternalUser ExternalUser { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<UserRole> UserRoles { get; set; }
    }
}