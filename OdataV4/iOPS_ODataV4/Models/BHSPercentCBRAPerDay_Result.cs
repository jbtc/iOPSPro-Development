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
    
    public partial class BHSPercentCBRAPerDay_Result
    {
        public Nullable<long> SiteId { get; set; }
        public string BHSName { get; set; }
        public Nullable<int> TokenCount { get; set; }
        public Nullable<int> TotalCBRABags { get; set; }
        public Nullable<decimal> CBRAPercentOfTotal { get; set; }
        public Nullable<System.DateTime> MinTimeStamp { get; set; }
        public Nullable<System.DateTime> MaxTimeStamp { get; set; }
        public Nullable<System.DateTime> Day { get; set; }
    }
}
