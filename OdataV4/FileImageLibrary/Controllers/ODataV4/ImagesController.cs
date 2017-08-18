using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.ModelBinding;
using System.Web.Mvc;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using FileImageLibrary.Models;
using Ionic.Zip;
using Microsoft.OData.Core;
using System.Data.Entity.Core.Objects;

namespace FileImageLibrary.Controllers.ODataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using FileImageLibrary.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Image>("Images");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ImagesController : ODataController
    {
        private static ODataValidationSettings _validationSettings = new ODataValidationSettings();

		[ODataRoute("ByImageKeyList")]
		[System.Web.Http.HttpPost, System.Web.Http.HttpOptions]
		public async Task<List<ImageViewModel>> ByImageKeyList()
		{
			var list = await Request.Content.ReadAsStringAsync();


			list = list.Replace("'", "");


			long testVariable;

			//Collect list of valid images
			var listArray = list
							.Split(new[] { ",", " ", "." }, StringSplitOptions.RemoveEmptyEntries)
							.Distinct();

			//Get them from the database
			IEnumerable<ImageViewModel> images = null;
			using (var db = new FileImageLibraryEntities())
			{
				if (listArray.Any())
				{
					images = db.FileImages
								.Where(l => listArray.Contains(l.ImageKey))
								.OrderBy(l => l.Ordinal)
								.Select(f => new ImageViewModel
								{
									ImageKey = f.ImageKey,
									CreationDate = f.dtmCreated,
									FileName = f.strFilename,
									Size = (long)f.intOriginal_Size,
									Description = f.Description,
									Ordinal = f.Ordinal ?? 0,
									CreatorUserMasterId = f.CreatorUserMasterId,
									ModifierUserMasterId = f.ModifierUserMasterId

								})
								.AsEnumerable();
				}

				if (images != null)
				{
					return images.OrderBy(i => i.Ordinal).ToList();


				}
			}



			return null;

		}



 

		//++Special for File Upload purposes.
		[EnableQuery]
		[ODataRoute("upload")]
		[System.Web.Http.HttpPost, System.Web.Http.HttpOptions]
		public async Task<IHttpActionResult> PostFormData()
		{
			// Check if the request contains multipart/form-data.
			if (!Request.Content.IsMimeMultipartContent())
			{
				throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
			}

			var provider = new MultipartMemoryStreamProvider();

			try
			{
				FileImage newEntity = null;
				// Read the form data.
				await Request.Content.ReadAsMultipartAsync(provider);

				// This illustrates how to get the file names.
				foreach (var item in provider.Contents)
				{
					var fileBytes = await item.ReadAsByteArrayAsync();
					MemoryStream msOutput = new MemoryStream(fileBytes);
					newEntity = SaveStreamInFileImageLibrary(msOutput, item.Headers.ContentDisposition.FileName);
				}
				return Ok(newEntity);

			}
			catch (System.Exception e)
			{
				return StatusCode(HttpStatusCode.BadRequest);
			}
		}


		private static FileImage SaveStreamInFileImageLibrary(MemoryStream objMemory_Stream, string strFilename)
		{

			strFilename = strFilename.Replace("\"","");
			StringBuilder sb = new StringBuilder();
			string md5HashOutput = "";
			var arrFile = objMemory_Stream.ToArray();
			using (MD5 md5Hash = MD5.Create())
			{
				byte[] hash = md5Hash.ComputeHash(arrFile);
				for (int i = 0; i < hash.Length; i++)
				{
					sb.Append(hash[i].ToString("x2"));
				}
				md5HashOutput = sb.ToString().ToUpper();

			}


			var ImageKey = GetSHA256AsHexString(arrFile);


			using (var ctx = new FileImageLibraryEntities())
			{
				var existingEntity = ctx.FileImages.FirstOrDefault(fi => fi.ImageKey == ImageKey);
				if (existingEntity != null)
				{
					return existingEntity;
				}

				var numFile_Image_ID = (decimal)ctx.SYS_Next_Sequence_Number().FirstOrDefault();
				//Compress and encrypt the image.
				MemoryStream msOutput = new MemoryStream();
				byte[] arrZipped;
				using (var zip1 = new ZipFile())
				{
					zip1.Password = FIL_Password(numFile_Image_ID);
					zip1.AddEntry(strFilename, objMemory_Stream);
					zip1.Save(msOutput);
					msOutput.Position = 0;
					arrZipped = msOutput.ToArray();
				}
				var image_store_entity = ctx.Save_Encrypted_File_Image(numFile_Image_ID, arrZipped).FirstOrDefault();
				var newFileImageEntity = ctx.FileImages.Add(new FileImage()
				{
					numFile_Image_ID = numFile_Image_ID,
					intFIL_Segment_ID = image_store_entity.intFIL_Segment_ID,
					intFIL_Segment_Clustered_ID = (long)image_store_entity.intFIL_Segment_Clustered_ID,
					bitCompressed = true,
					dtmCreated = DateTime.Now,
					intCompressed_Size = msOutput.Length,
					intOriginal_Size = objMemory_Stream.Length,
					strFilename = strFilename,
					strMD5_Hex_Signature = md5HashOutput,
					intSource = 100,
					ImageKey = ImageKey

				});
				ctx.SaveChanges();
				return newFileImageEntity;
			}
		}

		
		internal static string FIL_Password(decimal numFile_Image_ID)
		{
			string output = String.Format(@"834T9Q8*&&*^%*08(789(){0}87*&T876rb0n7:u76rc6e:", numFile_Image_ID);
			return output;
		}

		private static string GetSHA256AsHexString(byte[] input)
		{
			var hash = GetSHA256Binary(input);
			StringBuilder sb = new StringBuilder();
			foreach (byte t in hash)
			{
				sb.Append(t.ToString("x2"));
			}
			return sb.ToString().ToUpper();
		}
		private static byte[] GetSHA256Binary(byte[] input)
		{

			using (var Hash = SHA256.Create())
			{
				return Hash.ComputeHash(input);

			}

		}


    }

	public class UploadViewModel
	{
		[Key]
		public long Id { get; set; }
		public string FileName { get; set; }
		public long UncompressedSize { get; set; }
		public long CompressedSize { get; set; }
		public string MD5HexSignature { get; set; }
	}
}
