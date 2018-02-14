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
    
    public partial class BHSAlarmHistory
    {
        public long Id { get; set; }
        public Nullable<decimal> iOPSAlarmUniqueId { get; set; }
        public Nullable<long> BHSId { get; set; }
        public Nullable<long> SiteId { get; set; }
        public string Alarm { get; set; }
        public string Description { get; set; }
        public string BHSName { get; set; }
        public int InstanceId { get; set; }
        public int ChildId { get; set; }
        public Nullable<System.DateTime> ActiveDateTime { get; set; }
        public System.DateTime TimeStamp { get; set; }
        public string ActiveColor { get; set; }
        public Nullable<System.DateTime> AcknowledgeTime { get; set; }
        public string AcknowledColor { get; set; }
        public string Location { get; set; }
        public Nullable<System.DateTime> ReturnToNormalTime { get; set; }
        public string NormalColor { get; set; }
        public string TransactionType { get; set; }
        public string DeviceTypeNameList { get; set; }
        public string DeviceNameList { get; set; }
        public string InstanceNameList { get; set; }
    
        public virtual Site Site { get; set; }
    }
}
