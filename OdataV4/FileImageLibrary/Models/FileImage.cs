//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace FileImageLibrary.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class FileImage
    {
        public long intFIL_Seq_Num { get; set; }
        public decimal numFile_Image_ID { get; set; }
        public Nullable<int> intFIL_Segment_ID { get; set; }
        public Nullable<long> intFIL_Segment_Clustered_ID { get; set; }
        public System.DateTime dtmCreated { get; set; }
        public int intSource { get; set; }
        public int intApplication_Code { get; set; }
        public string strFilename { get; set; }
        public Nullable<bool> bitCompressed { get; set; }
        public Nullable<long> intOriginal_Size { get; set; }
        public Nullable<long> intCompressed_Size { get; set; }
        public Nullable<decimal> numCreator_User_ID { get; set; }
        public int intGeneration { get; set; }
        public Nullable<long> intFIL_Prior_Seq_Num { get; set; }
        public Nullable<long> intFIL_Later_Seq_Num { get; set; }
        public string strMD5_Hex_Signature { get; set; }
        public string strHierarchy { get; set; }
        public string ImageKey { get; set; }
        public string Description { get; set; }
        public Nullable<long> Ordinal { get; set; }
        public Nullable<long> ModifierUserMasterId { get; set; }
        public Nullable<long> CreatorUserMasterId { get; set; }
    }
}
