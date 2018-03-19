using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
	public class Status
	{
		public bool IsUTMBEmployee { get; set; }
		public bool IsUTMBStudent { get; set; }
		public bool IsNonUTMB { get; set; }
		public bool IsNonUTMBStudent { get; set; }
		public bool IsContractor { get; set; }
		public bool IsVolunteer { get; set; }
		public bool IsActive { get; set; }
		public bool HasExternalEmployeeNumber { get; set; }
	}
}
