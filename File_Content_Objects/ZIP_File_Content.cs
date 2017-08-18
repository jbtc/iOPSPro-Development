using System;
using System.Collections.Concurrent;
using System.IO;
using Ionic.Zip;

namespace Library.Utilities.File_Content_Objects
{
	public class ZIP_File_Content : File_Content
	{


		/// <summary>
		/// Constructor for MemoryStream input
		/// </summary>
		/// <param name="input">MemoryStream filled with content.</param>
		public ZIP_File_Content(MemoryStream input) : base(input) { }
		/// <summary>
		/// Constructor for MemoryStream and Filename.
		/// </summary>
		/// <param name="input">MemoryStream filled with content.</param>
		/// <param name="Filename">Filename</param>
		public ZIP_File_Content(MemoryStream input, string Filename) : base(input, Filename) { }
		public ZIP_File_Content(FileInfo input) : base(input) { }
		public ZIP_File_Content(byte[] input) : base(input) {  }
		public ZIP_File_Content()
		{ }

		private ConcurrentBag<File_Content> _File_Contents_List = new ConcurrentBag<File_Content>();

		public ConcurrentBag<File_Content> File_Contents_List
		{
			get 
			{
				if (_File_Contents_List.Count == 0)
				{
					if (!Unzip_All())
					{
						throw new ApplicationException("Could not decompress zip content!");
					}
				}
				return _File_Contents_List; 
			}
			set { _File_Contents_List = value; }
		}





		private bool Unzip_All()
		{
			using (ZipFile zip = ZipFile.Read(As_MemoryStream))
			{
				foreach (ZipEntry e in zip)
				{
					File_Content fc = new File_Content();
					fc.Filename = e.FileName;
					MemoryStream extractMS = new MemoryStream();
					e.Extract(extractMS);
					extractMS.Position = 0;
					fc.As_MemoryStream = extractMS;
					_File_Contents_List.Add(fc);
				}
			}
			return true;
		}


	}
}
