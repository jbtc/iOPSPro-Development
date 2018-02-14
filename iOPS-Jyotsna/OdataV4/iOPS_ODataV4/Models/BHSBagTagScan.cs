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
    
    public partial class BHSBagTagScan
    {
        public long Id { get; set; }
        public Nullable<long> SiteId { get; set; }
        public int DeviceId { get; set; }
        public Nullable<System.DateTime> Timestamp { get; set; }
        public Nullable<int> Token { get; set; }
        public string ItemData { get; set; }
        public Nullable<int> ResponseTime { get; set; }
        public string Name { get; set; }
        public int BagSeen { get; set; }
        public int NoRead { get; set; }
        public int Conflict { get; set; }
        public int Fallback { get; set; }
        public int Pier { get; set; }
        public int Flight { get; set; }
        public int Late { get; set; }
        public int Carrier { get; set; }
        public int Unknown { get; set; }
        public int Head1 { get; set; }
        public int Head2 { get; set; }
        public int Head3 { get; set; }
        public int Head4 { get; set; }
        public int Head5 { get; set; }
        public int Head6 { get; set; }
        public int Head7 { get; set; }
        public int Head8 { get; set; }
        public int Head9 { get; set; }
        public int Head10 { get; set; }
        public int Head11 { get; set; }
        public int Head12 { get; set; }
    
        public virtual Site Site { get; set; }
    }
}
