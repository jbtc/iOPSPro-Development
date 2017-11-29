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
    
    public partial class Site
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Site()
        {
            this.SiteCompanies = new HashSet<SiteCompany>();
            this.SiteDataReaders = new HashSet<SiteDataReader>();
            this.Systems = new HashSet<SystemGroup>();
            this.BagTagScans = new HashSet<BHSBagTagScan>();
            this.BHSJamAlarms = new HashSet<BHSJamAlarm>();
            this.BHSDeviceLocations = new HashSet<BHSDeviceLocation>();
            this.BHSCurrentAlarms = new HashSet<BHSCurrentAlarm>();
            this.CBRAEntryStatus = new HashSet<BHSCBRAEntryStatu>();
            this.DeviceLocationThroughputs = new HashSet<BHSDeviceLocationThroughput>();
            this.TokenTrackers = new HashSet<BHSTokenTracker>();
            this.Tokens = new HashSet<BHSToken>();
            this.BHSAlarmHistories = new HashSet<BHSAlarmHistory>();
            this.Assets = new HashSet<Asset>();
        }
    
        public long Id { get; set; }
        public string Name { get; set; }
        public System.Data.Entity.Spatial.DbGeography GeographicalLocation { get; set; }
        public Nullable<int> UTCTimeOffset { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public Nullable<double> GoogleLatitude { get; set; }
        public Nullable<double> GoogleLongitude { get; set; }
        public Nullable<int> KepwareSQLTimeDifferenceMSFromCentral { get; set; }
        public Nullable<bool> HasBaggageHandling { get; set; }
        public Nullable<bool> HasGates { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SiteCompany> SiteCompanies { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SiteDataReader> SiteDataReaders { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SystemGroup> Systems { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSBagTagScan> BagTagScans { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSJamAlarm> BHSJamAlarms { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSDeviceLocation> BHSDeviceLocations { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSCurrentAlarm> BHSCurrentAlarms { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSCBRAEntryStatu> CBRAEntryStatus { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSDeviceLocationThroughput> DeviceLocationThroughputs { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSTokenTracker> TokenTrackers { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSToken> Tokens { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BHSAlarmHistory> BHSAlarmHistories { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Asset> Assets { get; set; }
    }
}
