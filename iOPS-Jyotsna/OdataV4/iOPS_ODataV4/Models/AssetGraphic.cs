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
    
    public partial class AssetGraphic
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public AssetGraphic()
        {
            this.AssetGraphicVisibleValues = new HashSet<AssetGraphicVisibleValue>();
        }
    
        public long Id { get; set; }
        public Nullable<long> AssetId { get; set; }
        public string ImageURL { get; set; }
        public Nullable<System.DateTime> LastModifiedDate { get; set; }
    
        public virtual Asset Asset { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AssetGraphicVisibleValue> AssetGraphicVisibleValues { get; set; }
    }
}