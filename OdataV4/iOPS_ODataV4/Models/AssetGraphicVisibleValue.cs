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
    
    public partial class AssetGraphicVisibleValue
    {
        public long Id { get; set; }
        public Nullable<long> AssetGraphicId { get; set; }
        public Nullable<long> JBTStandardObservationId { get; set; }
        public string ValueWhenVisible { get; set; }
    
        public virtual AssetGraphic AssetGraphic { get; set; }
    }
}
