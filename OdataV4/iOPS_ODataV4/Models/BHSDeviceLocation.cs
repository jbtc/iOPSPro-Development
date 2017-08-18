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
    
    public partial class BHSDeviceLocation
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public BHSDeviceLocation()
        {
            this.BHSDeviceLocationCarrierMaps = new HashSet<BHSDeviceLocationCarrierMap>();
        }
    
        public long Id { get; set; }
        public Nullable<long> SiteId { get; set; }
        public string DeviceName { get; set; }
        public string MemberName { get; set; }
        public string BHSName { get; set; }
        public Nullable<int> IsConveyor { get; set; }
        public Nullable<int> IsInTerminal { get; set; }
        public Nullable<int> IsMakeUp { get; set; }
        public Nullable<int> IsEDSMatrix { get; set; }
        public Nullable<int> IsDiverter { get; set; }
        public string IsATR { get; set; }
        public Nullable<int> IsCBRA { get; set; }
        public Nullable<int> IsTrackingPE { get; set; }
        public string Location { get; set; }
        public Nullable<long> SystemId { get; set; }
        public Nullable<int> IsDimentioner { get; set; }
        public Nullable<int> IsSelectedForCount { get; set; }
    
        public virtual Site Site { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSDeviceLocationCarrierMap> BHSDeviceLocationCarrierMaps { get; set; }
    }
}
