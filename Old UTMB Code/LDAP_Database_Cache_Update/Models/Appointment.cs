using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
	public class Appointment
	{
		public int AppointmentSequence { get; set; }
		public string BusinessUnit { get; set; }
		public string DepartmentName { get; set; }
		public string DepartmentId { get; set; }
		public string Title { get; set; }
		public string JobCode { get; set; }
		public string AppointmentId { get; set; }
		public string PositionNumber { get; set; }
		public DateTime? BeginDate { get; set; }
		public DateTime? TerminationDate { get; set; }
		public float PercentTime { get; set; }
		public bool IsPrimaryJob { get; set; }
	}
}
