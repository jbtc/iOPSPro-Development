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
    
    public partial class GSTagsUpdatedInLastFiveMinutesByListOfAssetIds_Result
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public Nullable<long> SiteId { get; set; }
        public Nullable<System.DateTime> LastObservationCreationDate { get; set; }
        public Nullable<System.DateTime> LastObservationDate { get; set; }
        public Nullable<long> AssetId { get; set; }
        public Nullable<long> LastObservationId { get; set; }
        public Nullable<long> JBTStandardObservationId { get; set; }
        public Nullable<bool> MarkedForDelete { get; set; }
        public string LastObservationTextValue { get; set; }
        public Nullable<int> LastObservationQuality { get; set; }
        public Nullable<bool> IsAlarm { get; set; }
        public Nullable<bool> IsWarning { get; set; }
        public string ValueWhenActive { get; set; }
    }
}
