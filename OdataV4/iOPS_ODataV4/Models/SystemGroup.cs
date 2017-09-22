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
    
    public partial class SystemGroup
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public SystemGroup()
        {
            this.Children = new HashSet<SystemGroup>();
            this.Assets = new HashSet<Asset>();
            this.SystemGraphics = new HashSet<SystemGraphic>();
        }
    
        public long Id { get; set; }
        public string Name { get; set; }
        public Nullable<long> TypeId { get; set; }
        public Nullable<long> CompanyId { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<long> ParentSystemId { get; set; }
        public Nullable<long> OriginalEntityId { get; set; }
        public Nullable<System.DateTime> DateLastModified { get; set; }
        public Nullable<System.DateTime> CreateDate { get; set; }
        public string BaseUnitImageURL { get; set; }
    
        public virtual Company Company { get; set; }
        public virtual Site Site { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SystemGroup> Children { get; set; }
        public virtual SystemGroup Parent { get; set; }
        public virtual SystemType SystemType { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Asset> Assets { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SystemGraphic> SystemGraphics { get; set; }
    }
}
