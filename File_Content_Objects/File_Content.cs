using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Win32;

namespace Library.Utilities.File_Content_Objects
{
	/// <summary>
	/// A base class that can contain the contents of a file in memory only or on the file system. 
	/// The contents are accessible in FileInfo, byte array, and MemoryStream format. 
	/// In addition, the Mime Type is automatically retrieved from the registry for the specific extension as well as the extension itself without 
	/// having to calculate it. This class is inherited by meny of the other more specific types.
	/// </summary>
	public class File_Content
	{
		#region Properties
		#region MD5_Signature

		private string _MD5_Hash = "";
		/// <summary>
		/// Read only property. MD5 Signature for the image.
		/// </summary>
		public string MD5_Signature
		{
			get 
			{
				if (_MD5_Hash != "") return _MD5_Hash;
				using (MD5 md5Hash = MD5.Create())
				{
					byte[] hash = md5Hash.ComputeHash(As_Byte_Array);
					StringBuilder sb = new StringBuilder();
					for (int i = 0; i < hash.Length; i++)
					{
						sb.Append(hash[i].ToString("x2"));
					}
					_MD5_Hash = sb.ToString().ToUpper();

				}
				return _MD5_Hash; 
			
			}
		}
		#endregion
		#region MimeType
		private string _MimeType;
		/// <summary>
		/// Read only property. If the filename property is filled in for the File_Content object, the windows mime type will automatically be retrieved from the registry and filled in.
		/// </summary>
		public string MimeType
		{
			get { return _MimeType; }
		}
		#endregion
			
			#region Type
				private string _Type;
				/// <summary>
				/// File extension.
				/// </summary>
				public string Type
				{
					get
					{
						_Type = Path.GetExtension(Filename).ToLower().Substring(1);
						return _Type;
					}

				}
			#endregion
			#region As_FileInfo
				private FileInfo _Contents_FileInfo;

				/// <summary>
				/// Fileinfo object describing the physical file on disk, IF there is a file on disk that represents this file content.
				/// </summary>
				public FileInfo As_FileInfo
				{
					get 
					{
						if (_Contents_FileInfo == null)
						{
							if (_Filename != null)
							{
								File.Create(_Filename);
								_Contents_FileInfo =  Write_To_FileInfo(new FileInfo(_Filename));

							}
						}
						return _Contents_FileInfo; 
					}
					set
					{
						if (value == null)
						{
							_Contents_FileInfo = null;
						}
						else
						{
							_Contents_FileInfo = value;
							_Filename = _Contents_FileInfo.Name;
							_MimeType = GetMimeType(_Filename);
							_Type = Path.GetExtension(Filename).ToLower().Substring(1);
						}
					}
				}
			#endregion
			#region As_MemoryStream
				private MemoryStream _Contents_MemoryStream;
				/// <summary>
				/// Contents of the file as a MemoryStream object.
				/// </summary>
				public virtual MemoryStream As_MemoryStream
				{
					get
					{
						if (_Contents_MemoryStream == null)
						{
							if (_Contents_Byte_Array != null)
							{
								_Contents_MemoryStream = new MemoryStream(_Contents_Byte_Array) {Position = 0};
							}
							else if (_Contents_FileInfo != null)
							{
								_Contents_MemoryStream = new MemoryStream(File.ReadAllBytes(_Contents_FileInfo.FullName)) {Position = 0};
							}
						}
						if (_Contents_MemoryStream != null)
						{
							_Contents_MemoryStream.Position = 0;
						}
						return _Contents_MemoryStream;

					}
					set
					{
						_Contents_MemoryStream = value;
						_Contents_MemoryStream.Position = 0;
					}
				}
			#endregion
			#region Filename
				private string _Filename;

				/// <summary>
				/// Filename corresponding to the File_Content object. Not required if you work strictly in memory. Good for creating a placeholder object.
				/// </summary>
				public string Filename
				{
					get { return _Filename; }
					set
					{
						_Filename = value;
						_MimeType = GetMimeType(_Filename);
					}
				}
			#endregion
			#region Creation_Date

		/// <summary>
				/// 
				/// </summary>
				public DateTime Creation_Date { get; set; }

		#endregion
			#region As_Byte_Array
				private byte[] _Contents_Byte_Array;
				/// <summary>
				/// Contents of the file as a byte array.
				/// </summary>
				public virtual byte[] As_Byte_Array
				{
					get
					{
						if (_Contents_Byte_Array == null)
						{
							if (_Contents_MemoryStream != null)
							{
								_Contents_Byte_Array = _Contents_MemoryStream.ToArray();
							}
							else if (_Contents_FileInfo != null)
							{
								_Contents_Byte_Array = File.ReadAllBytes(_Contents_FileInfo.FullName);
							}

						}
						return _Contents_Byte_Array;

					}
					set
					{
						_Contents_Byte_Array = value;
					}

				}
			#endregion
			#region As_String

				private string _Contents_String;
				/// <summary>
				/// 
				/// </summary>
				public virtual string As_String
				{
					get
					{
						return _Contents_String;
					}
					set
					{
						_Contents_String = value;
						_Contents_MemoryStream = new MemoryStream(Encoding.UTF8.GetBytes(value));
					}
				}

			#endregion
			#region As_String_Array_Of_Lines

				/// <summary>
				/// 
				/// </summary>
				public virtual string[] As_String_Array_Of_Lines
				{
					get
					{
						return Regex.Split(_Contents_String, "\r\n|\r|\n");
					}
				}

				#endregion

		#endregion
		#region Constructors
				//------------------------------------------------------
			/// <summary>
			/// Constructs a blank File_Content object.
			/// </summary>
			public File_Content()
			{
				Creation_Date = DateTime.Now;
			}

			

			//------------------------------------------------------
			/// <summary>
			/// Builds object using a MemoryStream for input.
			/// </summary>
			/// <param name="stmContents">File contents as a MemoryStream reference.</param>
			public File_Content(MemoryStream stmContents)
			{
				_Contents_MemoryStream = stmContents;
				Creation_Date = DateTime.Now;
			}

			/// <summary>
			/// 
			/// </summary>
			/// <param name="stmContents"></param>
			/// <param name="Filename"></param>
			public File_Content(MemoryStream stmContents, string Filename)
			{
				_Contents_MemoryStream = stmContents;
				Creation_Date = DateTime.Now;
				_Filename = Filename;
			}
	

			//------------------------------------------------------
			/// <summary>
			/// Builds object using a byte array for input.
			/// </summary>
			/// <param name="arrContents">File contents as a byte array.</param>
			public File_Content(byte[] arrContents)
			{
				_Contents_Byte_Array = arrContents;
				Creation_Date = DateTime.Now;
			}

			/// <summary>
			/// Builds object using a byte array and an associated file name for input.
			/// </summary>
			/// <param name="arrContents">File contents as a byte array.</param>
			/// <param name="name">File name.</param>
			public File_Content(byte[] arrContents, string name)
			{
				_Contents_Byte_Array = arrContents;
				Creation_Date = DateTime.Now;
				_Filename = name;
			}

			//------------------------------------------------------
			/// <summary>
			/// Builds object using a FileInfo object for input.
			/// </summary>
			/// <param name="objFileinfo">File as a FileInfo object.</param>
			public File_Content(FileInfo objFileinfo)
			{
				As_FileInfo = objFileinfo;
				Creation_Date = objFileinfo.CreationTime;
			}
		#endregion
		#region Private Methods
			/// <summary>
			/// 
			/// </summary>
			/// <param name="fileName"></param>
			/// <returns></returns>
			protected string GetMimeType(string fileName)
			{
				string mimeType = "application/unknown";
				string ext = Path.GetExtension(fileName).ToLower();
				RegistryKey regKey = Registry.ClassesRoot.OpenSubKey(ext);
				if (regKey != null && regKey.GetValue("Content Type") != null)
					mimeType = regKey.GetValue("Content Type").ToString();
				return mimeType;
			}
		#endregion
		#region Public Methods






			/// <summary>
			/// Writes the content of the file into the fileinfo reference specified.
			/// </summary>
			/// <param name="FileInfo_Reference">A new or existing FileInfo reference.</param>
			/// <returns>FileInfo reference pointing to the newly written file.</returns>
			public FileInfo Write_To_FileInfo(FileInfo FileInfo_Reference)
			{
				File.WriteAllBytes(FileInfo_Reference.FullName, As_Byte_Array);
				Filename = FileInfo_Reference.Name;
				return FileInfo_Reference;

			}


			/// <summary>
			/// Writes the content of the file to the folder specified, using the Filename property as the name of the file.
			/// </summary>
			/// <param name="DirectoryInfo_Reference">DirectoryInfo for the folder.</param>
			/// <returns>FileInfo object pointing to the written file.</returns>
			public FileInfo Write_To_Folder(DirectoryInfo DirectoryInfo_Reference)
			{
				string Full_Filename_Path = Path.Combine(DirectoryInfo_Reference.FullName,  Filename);
				return Write_To_Full_Filename(Full_Filename_Path);
			}


			/// <summary>
			/// Writes the content of the file to the path specified.
			/// </summary>
			/// <param name="Path">Path name to which to write the file.</param>
			/// <returns>FileInfo object pointing to the written file.</returns>
			public FileInfo Write_To_Full_Filename(string Path)
			{
				File.WriteAllBytes(Path, As_Byte_Array);
				_Contents_FileInfo = new FileInfo(Path);
				return _Contents_FileInfo;
			}

			/// <summary>
			/// 
			/// </summary>
			public void Release_All_Memory_Resources()
			{
				_Contents_Byte_Array = null;
				_Contents_FileInfo = null;
				_Contents_MemoryStream = null;
				_Contents_String = null;
				_Filename = "";
				_MimeType = "";
				_Type = "";
			}

		#endregion

	}



}
