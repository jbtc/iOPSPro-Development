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
    
    public partial class BHSTop5JamDeviceswithCount_Result
    {
        public string DeviceName { get; set; }
        public Nullable<int> AlarmCount { get; set; }
        public Nullable<System.DateTime> MinActiveDateTime { get; set; }
        public Nullable<System.DateTime> MaxActiveDateTime { get; set; }
        public Nullable<int> MaxDurationSec { get; set; }
        public Nullable<int> MinDurationSec { get; set; }
        public Nullable<int> AverageDuration { get; set; }
        public string DeviceTypeNameList { get; set; }
    }
}
