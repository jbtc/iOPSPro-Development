using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class Provider
    {

        public long Id { get; set; }
        public Nullable<long> MasterId { get; set; }
        public string ProviderNumber { get; set; }
        public string HospitalDepartment { get; set; }
        public string SpecialtyCode { get; set; }
        public string Type { get; set; }
        public string LicenseNumber { get; set; }
        public Nullable<System.DateTime> ActiveDate { get; set; }
        public Nullable<System.DateTime> InactiveDate { get; set; }
        public string Address { get; set; }
        public string ResidentDEANumber { get; set; }
        public string NPI { get; set; }
        public Nullable<System.DateTime> DateLastUpdated { get; set; }

    }
}
