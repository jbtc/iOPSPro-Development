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
    
    public partial class Asset
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Asset()
        {
            this.Tags = new HashSet<Tag>();
        }
    
        public long Id { get; set; }
        public string Name { get; set; }
        public Nullable<long> AssetTypeId { get; set; }
        public string Description { get; set; }
        public Nullable<long> ManufacturerCompanyId { get; set; }
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public Nullable<decimal> PurchasePrice { get; set; }
        public Nullable<long> ConditionId { get; set; }
        public Nullable<decimal> DowntimeCostPerMinute { get; set; }
        public Nullable<long> OwnerCompanyId { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<long> CompanyId { get; set; }
        public Nullable<long> BuildingId { get; set; }
        public Nullable<long> AreaId { get; set; }
        public Nullable<long> GateId { get; set; }
        public Nullable<System.DateTime> OrderDate { get; set; }
        public Nullable<System.DateTime> ReceiveDate { get; set; }
        public Nullable<System.DateTime> InServiceDate { get; set; }
        public Nullable<System.DateTime> RetireDate { get; set; }
        public Nullable<int> WarrantyMiles { get; set; }
        public Nullable<int> WarrantyHours { get; set; }
        public Nullable<System.DateTime> LastModifiedDate { get; set; }
        public Nullable<long> ParentSystemId { get; set; }
        public Nullable<long> ParentAssetId { get; set; }
        public Nullable<long> AssetModelId { get; set; }
    
        public virtual Company Company { get; set; }
        public virtual Site Site { get; set; }
        public virtual AssetType AssetType { get; set; }
        public virtual AssetCondition AssetCondition { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Tag> Tags { get; set; }
        public virtual SystemGroup System { get; set; }
        public virtual AssetModel AssetModel { get; set; }
    }
}
