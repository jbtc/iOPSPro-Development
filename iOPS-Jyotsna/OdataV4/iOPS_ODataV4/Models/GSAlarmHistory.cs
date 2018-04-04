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
    
    public partial class GSAlarmHistory
    {
        public long Id { get; set; }
        public long SiteId { get; set; }
        public string Name { get; set; }
        public Nullable<System.DateTime> AlarmTime { get; set; }
        public Nullable<System.DateTime> CloseDate { get; set; }
        public Nullable<System.DateTime> NextAlarmDate { get; set; }
        public Nullable<int> AlarmDurationInMinutes { get; set; }
        public string JBTStandardObservationName { get; set; }
        public string JBTStandardObservationSynonymsName { get; set; }
        public Nullable<bool> BooleanValue { get; set; }
        public Nullable<long> TagId { get; set; }
        public string CompanyName { get; set; }
        public string BuildingName { get; set; }
        public string AreaName { get; set; }
        public string GateName { get; set; }
        public string AssetName { get; set; }
    
        public virtual Tag Tag { get; set; }
    }
}