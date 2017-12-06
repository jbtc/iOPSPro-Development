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
    
    public partial class ObservationException
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public ObservationException()
        {
            this.ObservationExceptionComments = new HashSet<ObservationExceptionComment>();
        }
    
        public long Id { get; set; }
        public Nullable<long> TagId { get; set; }
        public Nullable<long> InitiatingObservationId { get; set; }
        public Nullable<long> TerminatingObservationId { get; set; }
        public Nullable<long> DurationMS { get; set; }
        public Nullable<System.DateTime> ExceptionStartDate { get; set; }
        public Nullable<System.DateTime> ExceptionEndDate { get; set; }
        public Nullable<long> AssetId { get; set; }
    
        public virtual Observation InitiatingObservation { get; set; }
        public virtual Observation TerminatingObservation { get; set; }
        public virtual Tag Tag { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ObservationExceptionComment> ObservationExceptionComments { get; set; }
    }
}
