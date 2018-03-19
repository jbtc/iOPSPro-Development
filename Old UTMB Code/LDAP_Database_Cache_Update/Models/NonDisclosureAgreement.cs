using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
	public class NonDisclosureAgreement
	{
		public DateTime? SignatureDate { get; set; }
		public DateTime? ExpirationDate { get; set; }
	}
}
