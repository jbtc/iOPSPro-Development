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
    
    public partial class BHSAlarmAreaCountDetails_Result
    {
        public string DeviceNameList { get; set; }
        public string Description { get; set; }
        public string BHSName { get; set; }
        public string Location { get; set; }
        public string Alarm { get; set; }
        public string DeviceTypeNameList { get; set; }
        public Nullable<decimal> iOPSAlarmUniqueId { get; set; }
        public Nullable<System.DateTime> ActiveDateTime { get; set; }
        public Nullable<int> duration { get; set; }
    }
}
