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
    
    public partial class BHSPercentOfFailSafePerHour_Result1
    {
        public Nullable<System.DateTime> Hour { get; set; }
        public string BHSName { get; set; }
        public Nullable<int> PEBagCount { get; set; }
        public Nullable<int> AlarmCount { get; set; }
        public Nullable<decimal> Percent { get; set; }
        public string Description { get; set; }
        public Nullable<System.DateTime> MinActiveDateTime { get; set; }
        public Nullable<System.DateTime> MaxActiveDateTime { get; set; }
        public Nullable<int> MaxDurationSec { get; set; }
        public Nullable<int> MinDurationSec { get; set; }
        public Nullable<int> AverageDuration { get; set; }
    }
}
