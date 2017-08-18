using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Ionic.Zip;
using Library.Models.EMF.File_Image_Library;

namespace Library.Utilities.File_Content_Objects
{
	/// <summary>
	/// 
	/// </summary>
	public class File_Image_Library_File_Content : File_Content
	{
		#region Constructors

		/// <summary>
		/// Instantiate from the database with the given Image_ID. 
		/// If the image id does not exist in the file image library, an exception will be thrown.
		/// </summary>
		/// <param name="Image_ID"></param>
		public File_Image_Library_File_Content(long Image_ID)
		{
			_Image_ID = Image_ID;
			Populate_Properties_From_Image_ID(Image_ID);
		}

		/// <summary>
		/// Instantiate from the database with the given Image_ID. 
		/// If the image id does not exist in the file image library, an exception will be thrown.
		/// </summary>
		/// <param name="Image_ID"></param>
		public File_Image_Library_File_Content(Decimal? Image_ID)
		{
			_Image_ID = (long)Image_ID;
			Populate_Properties_From_Image_ID((long)Image_ID);
		}



		static Entities Get_Context()
		{
			return new Entities();
		}


		/// <summary>
		/// Instantiate from a fileinfo object. If 
		/// </summary>
		/// <param name="fileInfo">FileInfo object for the file</param>
		public File_Image_Library_File_Content(FileInfo fileInfo)
		{
			As_FileInfo = fileInfo;
			_Uncompressed_Size = fileInfo.Length;
			using (var ctx = Get_Context())
			{
				_Is_New_Entry = true;
				var q = (from MasterImageIndex idx in ctx.MasterImageIndexes
						 where idx.strMD5_Hex_Signature == MD5_Hex_Signature
						 select idx).FirstOrDefault() 
						 ??
						 (from MasterImageIndex idx in ctx.MasterImageIndexes
						  where idx.ImageKey == ImageKey
						  select idx).FirstOrDefault();

				
				if (q != null)
				{
					Populate_Properties_From_Index_Entity(q);
					_Is_New_Entry = false;
				}
				else
				{
					// ReSharper disable once UnusedVariable
					long imageID = Image_ID;
				}
			}
		}


		/// <summary>
		/// Instantiate from a filename string. 
		/// </summary>
		public File_Image_Library_File_Content(string filePath)
		{
			FileInfo fileInfo = new FileInfo(filePath);

			As_FileInfo = fileInfo;
			_Uncompressed_Size = fileInfo.Length;
			using (var ctx = Get_Context())
			{
				_Is_New_Entry = true;
				var q = (from MasterImageIndex idx in ctx.MasterImageIndexes
						 where idx.strMD5_Hex_Signature == MD5_Hex_Signature
						 select idx).FirstOrDefault();
				if (q != null)
				{
					Populate_Properties_From_Index_Entity(q);
					_Is_New_Entry = false;
				}
				else
				{
					// ReSharper disable once UnusedVariable
					long imageID = Image_ID;
				}

			}
		}



		/// <summary>
		/// Constructor for a MemoryStream instance of the file, with a given filename. 
		/// If the entry already exists in the file image library, it will be retrieved from the library as is, with the filename you have given replaced with the entry in the database.
		/// </summary>
		/// <param name="msImage"></param>
		/// <param name="fileName"></param>
		public File_Image_Library_File_Content(MemoryStream msImage, string fileName)
		{
			Construct_With_Memory_Stream(msImage, fileName);
		}

		/// <summary>
		/// Constructor for a stringbuilder instance with a given filename. 
		/// If the entry already exists in the file image library, it will be retrieved from the library as is, with the filename you have given replaced with the entry in the database.
		/// </summary>
		/// <param name="content_sb">String contetn as a stringbuilder object</param>
		/// <param name="fileName"></param>
		public File_Image_Library_File_Content(StringBuilder content_sb, string fileName)
		{

			MemoryStream msImage = new MemoryStream(Encoding.UTF8.GetBytes(content_sb.ToString()));
			Construct_With_Memory_Stream(msImage, fileName);
		}

		private void Construct_With_Memory_Stream(MemoryStream msImage, string fileName)
		{
			As_MemoryStream = msImage;
			_MD5_Hex_Signature = MD5_Signature;
			Filename = fileName;
			try
			{
				using (var ctx = Get_Context())
				{
					var q = (from MasterImageIndex idx in ctx.MasterImageIndexes
							 where idx.strMD5_Hex_Signature == MD5_Hex_Signature
							 select idx).FirstOrDefault();
					if (q != null)
					{
						Populate_Properties_From_Index_Entity(q);
					}
					else
					{
						_Is_New_Entry = true;
						long id = Image_ID;
						// ReSharper disable once RedundantAssignment
						id = id + 0;
					}
				}
			}
			catch (Exception e)
			{
				Exceptions.Add(e);
			}
		}

		/// <summary>
		/// Constructor for a ByteArray instance of the file, with a given filename. 
		/// If the entry already exists in the file image library, it will be retrieved from the library as is, with the filename you have given replaced with the entry in the database.
		/// </summary>
		/// <param name="Image"></param>
		/// <param name="fileName"></param>
		public File_Image_Library_File_Content(byte[] Image, string fileName)
		{
			base.As_Byte_Array = Image;
			_MD5_Hex_Signature = MD5_Signature;
			Filename = fileName;
			using (var ctx = Get_Context())
			{
				var q = (from MasterImageIndex idx in ctx.MasterImageIndexes
						 where idx.strMD5_Hex_Signature == MD5_Hex_Signature
						 select idx).FirstOrDefault();
				if (q != null)
				{
					Populate_Properties_From_Index_Entity(q);
				}
				else
				{
					_Is_New_Entry = true;
					long id = Image_ID;
					// ReSharper disable once RedundantAssignment
					id = id + 0;
				}
			}

		}

		#endregion

		#region Properties

		#region Image_ID
		private long _Image_ID;
		private string _ImageKey = "";
		private static readonly object _locker = new object();


		/// <summary>
		/// Image_ID of the entry in the File Image Library. 
		/// If the file does not already exist in the file image library then 
		/// referencing this propery WILL CAUSE the file or the 
		/// binary content to be saved in the library, and an Image_ID 
		/// will be assigned as a result. This Image_ID is what
		/// is returned to you.
		/// If you never reference the Image_ID property then 
		/// the content IS NEVER SAVED to the library.
		/// </summary>
		public long Image_ID
		{
			get
			{
				if (_Image_ID == 0)
				{
					StoreImageInDatabase();
				}
				return _Image_ID;
			}
		}
		/// <summary>
		/// 
		/// </summary>
		public string ImageKey
		{
			get
			{
				if (_ImageKey == "")
				{
					StoreImageInDatabase();
				}
				return _ImageKey;
			}
		}

		private void StoreImageInDatabase()
		{
			MasterImageIndex masterIndex;


			using (var ctx = Get_Context())
			{
				decimal numFile_Image_ID;
				lock (_locker)
				{
					numFile_Image_ID = (decimal) ctx.SYS_Next_Sequence_Number().FirstOrDefault();
				}
				//Compress and encrypt the image.
				_ImageKey = GetSHA256AsHexString(As_Byte_Array);
				MemoryStream msOutput = new MemoryStream();
				byte[] arrZipped;
				using (var zip1 = new ZipFile())
				{
					zip1.Password = FIL_Password(numFile_Image_ID);
					zip1.AddEntry(Filename, As_MemoryStream);
					zip1.Save(msOutput);
					msOutput.Position = 0;
					arrZipped = msOutput.ToArray();
				}
				Save_Encrypted_File_Image_Result image_store_entity = ctx.Save_Encrypted_File_Image(numFile_Image_ID, arrZipped).FirstOrDefault();
				masterIndex = ctx.MasterImageIndexes.Add(new MasterImageIndex
				{
					numFile_Image_ID = numFile_Image_ID,
					intFIL_Segment_ID = image_store_entity.intFIL_Segment_ID,
					intFIL_Segment_Clustered_ID = (long) image_store_entity.intFIL_Segment_Clustered_ID,
					bitCompressed = true,
					dtmCreated = DateTime.Now,
					intCompressed_Size = msOutput.Length,
					intOriginal_Size = As_MemoryStream.Length,
					strFilename = Filename,
					strMD5_Hex_Signature = MD5_Signature,
					intSource = 100
				});
				ctx.SaveChanges();
			}
			Populate_Properties_From_Index_Entity(masterIndex);
			_Image_ID = (long) masterIndex.numFile_Image_ID;

			_Image_Has_Been_Loaded_From_Database = true;
		}

		#endregion

		#region Uncompressed_Size
		/// <summary>
		/// Size of the file image library entry before compression into the library.
		/// </summary>
		private long _Uncompressed_Size;

		/// <summary>
		/// 
		/// </summary>
		public long Uncompressed_Size
		{
			get
			{
				return _Uncompressed_Size;
			}
		}
		#endregion

		#region Compressed_Size
		/// <summary>
		/// Size of the file image library as it resides compressed in the database.
		/// </summary>
		private long _Compressed_Size;

		/// <summary>
		/// 
		/// </summary>
		public long Compressed_Size
		{
			get
			{
				long size;
				if (_Image_Has_Been_Loaded_From_Database)
				{
					size = _Compressed_Size;
				}
				else if (As_MemoryStream != null)
				{
					_Image_ID = Image_ID;
					size = _Compressed_Size;
				}
				else
				{
					size = 0;
				}
				return size;
			}
		}
		#endregion

		#region MD5_Hex_Signature
		/// <summary>
		/// A string of hexadecimal characters representing the 128 bit MD5 hash value of the file content.
		/// This functions as the unique signature for the file content.
		/// </summary>
		private string _MD5_Hex_Signature;

		/// <summary>
		/// 
		/// </summary>
		public string MD5_Hex_Signature
		{
			get
			{
				if (!_Image_Has_Been_Loaded_From_Database)
				{
					StoreImageInDatabase();
				}
				if (_MD5_Hex_Signature == null)
				{
					if (As_MemoryStream != null)
					{
						_MD5_Hex_Signature = MD5_Signature;
					}
				}
				return _MD5_Hex_Signature;
			}
		}
		#endregion


		#region Is_New_Entry - Read Only
		/// <summary>
		/// When a new entry is created, the library will be checked to see if any of the existing entries already match an existing one. If there was not already an existing entry, a new one will be saved to the database, and this flag will be set to true.
		/// </summary>
		private bool _Is_New_Entry = true;

		/// <summary>
		/// If the MD5 signature of the file image content is already present in the file image library, this will be true after object instantiation.
		/// </summary>
		public bool Is_New_Entry
		{
			get { return _Is_New_Entry; }
		}
		#endregion

		#region Exceptions - List<Exception>

		private List<Exception> _Exceptions = new List<Exception>();

		/// <summary>
		/// 
		/// </summary>
		public List<Exception> Exceptions
		{
			get { return _Exceptions; }
			set { _Exceptions = value; }
		}

		#endregion

		#region As_MemoryStream Override

		//Need to override the base property in order to get the MemoryStream content from the File Image Library database.
		/// <summary>
		/// Contents of the File Image Library Entry as a MemoryStream reference. 
		/// The actual binary content of the image will not be retrieved until the first reference to this or the As_Byte_Array properties.
		/// </summary>
		public override MemoryStream As_MemoryStream
		{

			get
			{
				if (base.As_MemoryStream == null && Image_ID > 0)
				{
					byte[] arrImage;
					using (var ctx = Get_Context())
					{
						arrImage = ctx.Get_Encrypted_File_Image(Image_ID).FirstOrDefault();
					}


					MemoryStream msOutput = new MemoryStream();
					if (arrImage != null)
					{
						try
						{
							using (ZipFile zip1 = ZipFile.Read(new MemoryStream(arrImage)))
							{
								ZipEntry e = zip1.FirstOrDefault();
								if (e != null)
								{
									try
									{
										e.ExtractWithPassword(msOutput, FIL_Password(Image_ID));
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
					base.As_MemoryStream = msOutput;
					return msOutput;


				}
				base.As_MemoryStream.Position = 0;
				return base.As_MemoryStream;

			}
			set
			{
				value.Position = 0;
				base.As_MemoryStream = value;
			}
		}

		#endregion

		#region As_Byte_Array Override

		//Need to override the base property in order to get the Byte Array content from the File Image Library database.
		/// <summary>
		/// Contents of the File Image Library Entry as a Byte Array reference.
		/// The actual binary content of the image will not be retrieved until the first reference to this or the As_MemoryStream properties.
		/// </summary>
		public override byte[] As_Byte_Array
		{

			get
			{
				if (base.As_MemoryStream == null && Image_ID > 0)
				{
					base.As_MemoryStream = As_MemoryStream;
					return base.As_Byte_Array;
				}
				return base.As_Byte_Array;
			}
			set { base.As_Byte_Array = value; }
		}

		#endregion

		#endregion

		#region Private Fields
		private bool _Image_Has_Been_Loaded_From_Database;




		#endregion

		#region Public Methods

		/// <summary>
		/// Returns true of the Image_ID specified is already present in the File Image Library
		/// </summary>
		/// <param name="Image_ID"></param>
		/// <returns></returns>
		public static Boolean Is_Image_Present_In_File_Image_Library(long Image_ID)
		{

			using (var ctx = Get_Context())
			{
				return ctx.MasterImageIndexes.Any(idx => idx.numFile_Image_ID == (decimal)Image_ID);
			}
		}

		/// Returns true of the MD5_Signature specified is already present in the File Image Library
		public static Boolean Is_Image_Present_In_File_Image_Library(string MD5_Signature)
		{
			using (var ctx = Get_Context())
			{
				return ctx.MasterImageIndexes.Any(idx => idx.strMD5_Hex_Signature == MD5_Signature);
			}
		}

		/// <summary>
		/// Returns a Library.File_Content_Objects.File_Image_Library_File_Content instance given the MD5 signature for the entry. This looks up the MD5 signature in the database.
		/// </summary>
		/// <param name="md5">MD5 Signature for a file that exists in the file image library.</param>
		/// <returns></returns>
		public static File_Image_Library_File_Content Get_Entry_By_MD5_Signature(string md5)
		{
			long id;
			using (var ctx = Get_Context())
			{
				id = (long)ctx.MasterImageIndexes.FirstOrDefault(idx => idx.strMD5_Hex_Signature == md5).numFile_Image_ID;

			}

			return new File_Image_Library_File_Content(id);

		}
		/// <summary>
		/// Returns a Library.File_Content_Objects.File_Image_Library_File_Content instance given the MD5 signature for the entry. This looks up the MD5 signature in the database.
		/// </summary>
		/// <param name="id">File Image ID for a file that exists in the file image library.</param>
		/// <returns></returns>
		public static File_Image_Library_File_Content Get_Entry_By_Image_ID(long id)
		{
			return new File_Image_Library_File_Content(id);
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



		/// <summary>
		/// 
		/// </summary>
		/// <param name="numFile_Image_ID"></param>
		/// <param name="objMemory_Stream"></param>
		/// <param name="strExtension"></param>
		/// <param name="strFilename"></param>
		public static void Save_Stream_In_File_Image_Library(decimal numFile_Image_ID, MemoryStream objMemory_Stream, string strExtension,
			string strFilename = "")
		{
			if (strFilename == "")
			{
				strFilename = "temp";
			}

			if (strExtension != "")
			{
				strFilename += "." + strExtension.Replace(".", "");
			}




			StringBuilder sb = new StringBuilder();
			string md5HashOutput = "";
			var fileAsByteArray = objMemory_Stream.ToArray();
			var ImageKey = GetSHA256AsHexString(fileAsByteArray);

			using (MD5 md5Hash = MD5.Create())
			{
				byte[] hash = md5Hash.ComputeHash(fileAsByteArray);
				for (int i = 0; i < hash.Length; i++)
				{
					sb.Append(hash[i].ToString("x2"));
				}
				md5HashOutput = sb.ToString().ToUpper();

			}


			using (var ctx = Get_Context())
			{
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
				Save_Encrypted_File_Image_Result image_store_entity = ctx.Save_Encrypted_File_Image(numFile_Image_ID, arrZipped).FirstOrDefault();
				ctx.MasterImageIndexes.Add(new MasterImageIndex
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


			}
		}



		/// <summary>
		/// Returns a Library.File_Content_Objects.File_Image_Library_File_Content instance given the MD5 signature for the entry. This looks up the MD5 signature in the database.
		/// </summary>
		/// <param name="id">File Image ID for a file that exists in the file image library.</param>
		/// <returns></returns>
		public static File_Image_Library_File_Content Get_Entry_By_Image_ID(decimal? id)
		{
			return new File_Image_Library_File_Content(id);
		}


		#endregion

		#region Private Methods


		MasterImageIndex Get_FIL_Entity(decimal decImage_ID)
		{
			using (var ctx = Get_Context())
			{

				MasterImageIndex idx_entity = (from MasterImageIndex idx in ctx.MasterImageIndexes
											   where idx.numFile_Image_ID == decImage_ID
											   select idx).FirstOrDefault();

				if (idx_entity == null)
				{
					throw new ApplicationException("Image_ID does not exist in the file image library");
				}
				return idx_entity;
			}
		}


		internal static string FIL_Password(decimal numFile_Image_ID)
		{
			string output = String.Format(@"834T9Q8*&&*^%*08(789(){0}87*&T876rb0n7:u76rc6e:", numFile_Image_ID);
			return output;
		}




		/// <summary>
		/// Used to lok up and fill out the File_Image_Library_Entry object properties from the database, given the Image_ID value. 
		/// This method assumes that the presence of the entry in the database has already been verified from the Image_ID.
		/// </summary>
		/// <param name="decImage_ID"></param>
		private void Populate_Properties_From_Image_ID(decimal decImage_ID)
		{
			Populate_Properties_From_Index_Entity(Get_FIL_Entity(decImage_ID));
		}





		private void Populate_Properties_From_Index_Entity(MasterImageIndex idx_entity)
		{
			Filename = idx_entity.strFilename;
			Creation_Date = idx_entity.dtmCreated;
			_Uncompressed_Size = (idx_entity.intOriginal_Size ?? 0);
			_Compressed_Size = idx_entity.intCompressed_Size ?? 0;
			_MD5_Hex_Signature = idx_entity.strMD5_Hex_Signature ?? "";
			_Image_ID = (long)idx_entity.numFile_Image_ID;
		}


		#endregion

	}
}
