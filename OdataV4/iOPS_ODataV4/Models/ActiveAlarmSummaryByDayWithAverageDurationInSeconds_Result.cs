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
    
    public partial class ActiveAlarmSummaryByDayWithAverageDurationInSeconds_Result
    {
        public Nullable<System.DateTime> AlarmDay { get; set; }
        public Nullable<double> DurationActiveToAcknowledgeSecondsSum { get; set; }
        public Nullable<double> DurationActiveToInactiveSecondsSum { get; set; }
        public Nullable<decimal> DurationActiveToAcknowledgeSecondsAverage { get; set; }
        public Nullable<decimal> DurationActiveToInactiveSecondsAverage { get; set; }
    }
}
