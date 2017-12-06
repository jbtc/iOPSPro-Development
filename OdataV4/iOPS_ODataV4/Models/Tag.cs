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
    
    public partial class Tag
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Tag()
        {
            this.Observations = new HashSet<Observation>();
            this.WidgetGraphTags = new HashSet<WidgetGraphTag>();
            this.ObservationAggregatedHighChartValues = new HashSet<ObservationAggregatedHighChartValue>();
            this.GSAlarmHistories = new HashSet<GSAlarmHistory>();
            this.ObservationExceptions = new HashSet<ObservationException>();
        }
    
        public long Id { get; set; }
        public string Name { get; set; }
        public Nullable<long> JBTStandardObservationId { get; set; }
        public Nullable<long> JBTStandardObservationSynonymsId { get; set; }
        public Nullable<long> AssetId { get; set; }
        public string Description { get; set; }
        public string DataType { get; set; }
        public Nullable<long> PLCId { get; set; }
        public Nullable<System.DateTime> CreationDate { get; set; }
        public Nullable<long> CreatorPersonId { get; set; }
        public Nullable<double> MinimumObservableDelta { get; set; }
        public Nullable<bool> IsMovingAverage { get; set; }
        public Nullable<int> MovingAverageInstanceCount { get; set; }
        public Nullable<double> ClientOverrideMinimumObservableDelta { get; set; }
        public Nullable<bool> ClientOverrideIsMovingAverage { get; set; }
        public Nullable<int> ClientOverrideMovingAverageInstanceCount { get; set; }
        public Nullable<System.DateTime> ClientOverrideBeginDate { get; set; }
        public Nullable<System.DateTime> ClientOverrideEndDate { get; set; }
        public Nullable<long> LastObservationId { get; set; }
        public Nullable<bool> IsAlarm { get; set; }
        public Nullable<bool> IsWarning { get; set; }
        public Nullable<long> AlarmSeverityId { get; set; }
        public Nullable<System.DateTime> LastModifiedDate { get; set; }
        public string CompanyName { get; set; }
        public string BuildingName { get; set; }
        public string AreaName { get; set; }
        public string GateName { get; set; }
        public string AssetName { get; set; }
        public string JBTStandardObservationName { get; set; }
        public string JBTStandardObservationSynonymsName { get; set; }
        public Nullable<int> Offset { get; set; }
        public Nullable<System.DateTime> LastObservationDate { get; set; }
        public string LastObservationTextValue { get; set; }
        public Nullable<bool> IsValidated { get; set; }
        public Nullable<bool> IsNotified { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<System.DateTime> LastReportedDate { get; set; }
        public Nullable<double> ScalingFactor { get; set; }
        public Nullable<bool> IsCritical { get; set; }
        public Nullable<bool> IsInformational { get; set; }
        public Nullable<long> NotificationLevelId { get; set; }
        public Nullable<double> YIntercept { get; set; }
        public string ValueWhenActive { get; set; }
        public Nullable<bool> MarkedForDelete { get; set; }
        public Nullable<long> MergeToTagId { get; set; }
        public Nullable<long> PreviousObservationId { get; set; }
        public Nullable<System.DateTime> PreviousObservationDate { get; set; }
        public string PreviousObservationTextValue { get; set; }
        public Nullable<int> LastObservationQuality { get; set; }
        public Nullable<System.DateTime> LastObservationCreationDate { get; set; }
        public Nullable<int> PreviousObservationQuality { get; set; }
        public Nullable<System.DateTime> PreviousObservationCreationDate { get; set; }
        public Nullable<System.DateTime> PreviousReportedDate { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Observation> Observations { get; set; }
        public virtual JBTStandardObservation JBTStandardObservation { get; set; }
        public virtual Asset Asset { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<WidgetGraphTag> WidgetGraphTags { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ObservationAggregatedHighChartValue> ObservationAggregatedHighChartValues { get; set; }
        public virtual Observation LastObservation { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<GSAlarmHistory> GSAlarmHistories { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ObservationException> ObservationExceptions { get; set; }
    }
}
