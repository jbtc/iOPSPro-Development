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
    
    public partial class BHSBagDimensionerPercentReadRateReportGroupedByDateRange_Result
    {
        public string Area { get; set; }
        public string Location { get; set; }
        public Nullable<int> TotalReads { get; set; }
        public Nullable<int> InGaugeReads { get; set; }
        public Nullable<int> OutOfGaugeReads { get; set; }
        public Nullable<decimal> PercentInGaugeReads { get; set; }
        public Nullable<decimal> PercentOutOfGaugeReads { get; set; }
    }
}