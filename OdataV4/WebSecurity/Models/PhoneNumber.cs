//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WebSecurityToken.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class PhoneNumber
    {
        public long Id { get; set; }
        public long MasterId { get; set; }
        public string Type { get; set; }
        public string Number { get; set; }
        public bool IsViewable { get; set; }
    
        public virtual Person Person { get; set; }
    }
}