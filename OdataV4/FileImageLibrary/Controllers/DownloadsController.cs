using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Mvc;
using FileImageLibrary.Models;
using Ionic.Zip;
using Microsoft.Win32;

namespace FileImageLibrary.Controllers
{
	public class DownloadsController : Controller
	{

		[System.Web.Http.HttpGet, System.Web.Http.HttpOptions]
		public FileStreamResult ImageKey(string imageKey)
		{
			if (imageKey.Length > 60)
			{

				using (var db = new FileImageLibraryEntities())
				{
					var entity = db.FileImages.FirstOrDefault(f => f.ImageKey == imageKey);
					var zippedImage = db.Get_Encrypted_File_Image((long)entity.numFile_Image_ID).FirstOrDefault();
					MemoryStream msOutput = new MemoryStream();
					if (zippedImage != null)
					{
						try
						{
							using (ZipFile zip1 = ZipFile.Read(new MemoryStream(zippedImage)))
							{
								ZipEntry e = zip1.FirstOrDefault();
								if (e != null)
								{
									try
									{
										e.ExtractWithPassword(msOutput, FIL_Password(entity.numFile_Image_ID));
									}
									// ReSharper disable once EmptyGeneralCatchClause
									catch
									{
									}
								}
							}
						}
						// ReSharper disable once EmptyGeneralCatchClause
						catch { }
					}
					msOutput.Position = 0;

					string mimeType = "application/unknown";
					var fileName = entity.strFilename.Replace("\"", "");
					string ext = Path.GetExtension(fileName).ToLower();
					RegistryKey regKey = Registry.ClassesRoot.OpenSubKey(ext);
					if (regKey != null && regKey.GetValue("Content Type") != null)
					{
						mimeType = regKey.GetValue("Content Type").ToString();
					}
					HttpContext.Response.AddHeader("Content-Disposition", "inline; filename=\"" + fileName + "\"");

					return File(msOutput, mimeType);
				}
			}
			return null;
		}

		[System.Web.Http.HttpPut, System.Web.Http.HttpPost, System.Web.Http.HttpOptions]
		public JsonResult SaveDescription([FromBody] DescriptionViewModel vm)
		{
			Response.AppendHeader("Access-Control-Allow-Origin", "*");
			Response.AppendHeader("Access-Control-Allow-Methods", "PUT");
			Response.AppendHeader("Access-Control-Allow-Headers", "X-Requested-With, Accept, Access-Control-Allow-Origin, Content-Type, authorization");
			var x = Request;
			if (vm.ImageKey != null)
			{
				using (var db = new FileImageLibraryEntities())
				{
					var entity = db.FileImages.FirstOrDefault(f => f.ImageKey == vm.ImageKey);
					if (entity != null)
					{
						entity.Description = vm.Description ?? "";
						entity.Ordinal = vm.Ordinal;
						entity.ModifierUserMasterId = entity.ModifierUserMasterId ?? vm.ModifierUserMasterId;
						entity.CreatorUserMasterId = entity.CreatorUserMasterId ?? vm.CreatorUserMasterId;
						db.SaveChanges();
						return Json(vm);
					}

				}
				
			}
			return null;
		}



		internal static string FIL_Password(decimal numFile_Image_ID)
		{
			string output = String.Format(@"834T9Q8*&&*^%*08(789(){0}87*&T876rb0n7:u76rc6e:", numFile_Image_ID);
			return output;
		}

		public class DescriptionViewModel
		{
			public string ImageKey { get; set; }
			public string Description { get; set; }
			public long Ordinal { get; set; }
			public long? CreatorUserMasterId { get; set; }
			public long? ModifierUserMasterId { get; set; }
		}

	}
}
