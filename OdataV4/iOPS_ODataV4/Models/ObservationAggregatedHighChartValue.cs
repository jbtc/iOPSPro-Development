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
    
    public partial class ObservationAggregatedHighChartValue
    {
        public long Id { get; set; }
        public Nullable<long> TagId { get; set; }
        public Nullable<System.DateTime> Day { get; set; }
        public string TagValues { get; set; }
    
        public virtual Tag Tag { get; set; }
    }
}
