using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FileImageLibrary.Models
{
	public class ImageViewModel
	{
		[Key]
		public string ImageKey { get; set; }

		public string Description { get; set; }
		public DateTime CreationDate { get; set; }
		public string FileName { get; set; }
		public long Size { get; set; }
		public long Ordinal { get; set; }
		public long? CreatorUserMasterId { get; set; }
		public long? ModifierUserMasterId { get; set; }
	}



}