using System;
using System.Collections.Generic;
using System.IO;
using FtpLib;

namespace Library.Utilities.File_Content_Objects
{
	/// <summary>
	/// 
	/// </summary>
	public class FTP_File_Content : File_Content
	{


		#region Constructors

			/// <summary>
			/// File Content object that connects to the given host, with the given username, password, and initial path and filename.
			/// </summary>
			/// <param name="Host"></param>
			/// <param name="Username"></param>
			/// <param name="Password"></param>
			/// <param name="Path"></param>
			/// <param name="Filename"></param>
			public FTP_File_Content(string Host, string Username, string Password, string Path, string Filename)
			{
				_Host = Host;
				_Username = Username;
				_Password = Password;
				_Path = Path;
				this.Filename = Filename;
			}
		#endregion


		#region Private Fields
				private readonly string _Host;
		private string _Username, _Password, _Path;

		#endregion


		#region Properties

			/// <summary>
			/// 
			/// </summary>
			public DateTime Download_Start_Time, Download_Complete_Time;

		
			private bool _Remote_Source_Has_Been_Deleted;
			/// <summary>
			/// 
			/// </summary>
			public bool Remote_Source_Has_Been_Deleted
			{
				get { return _Remote_Source_Has_Been_Deleted; }
			}


			private bool _Remote_Source_Has_Been_Downloaded;
			/// <summary>
			/// 
			/// </summary>
			public bool Remote_Source_Has_Been_Downloaded
			{
				get { return _Remote_Source_Has_Been_Downloaded; }
			}

			/// <summary>
			/// 
			/// </summary>
			public List<Exception> Exceptions = new List<Exception>();

			#region Contents_MemoryStream override
			/// <summary>
			/// Returns a reference to the file contents as a MemoryStream reference. Automatically downloads the data if necessary first.
			/// </summary>
			public override MemoryStream As_MemoryStream
			{
				get
				{
					if (base.As_MemoryStream.Length == 0)
					{
						Download_Contents_MemoryStream();
						_Remote_Source_Has_Been_Downloaded = true;
					}
					return base.As_MemoryStream;
				}
				set
				{
					base.As_MemoryStream = value;
				}
			}

			#endregion

			#region Contents_Byte_Array override
			/// <summary>
			/// Returns a reference to the file contents as a byte[] reference. Automatically downloads the data if necessary first.
			/// </summary>
			public override byte[] As_Byte_Array
			{
				get 
				{
					MemoryStream local = As_MemoryStream;
					return local.ToArray();
				}
				set 
				{
					base.As_Byte_Array = value;
				}

			}
			#endregion

		#endregion


		#region Private Methods


			private FtpConnection Get_Logged_In_And_Pathed_FTP_Object(string Host, string Username, string Password, string Path)
			{

				try
				{
					FtpConnection localFTP = new FtpConnection(Host, Username, Password);

					localFTP.Login();
					foreach (string subPath in Path.Split('/'))
					{
						localFTP.SetCurrentDirectory(subPath);
					}
					return localFTP;
				}
				catch(Exception e)
				{	
					Exceptions.Add(e);
				}
				return null;
			}

			private void Download_Contents_MemoryStream()
			{
				try
				{

					using (FtpConnection localFTP = Get_Logged_In_And_Pathed_FTP_Object(_Host, _Username, _Password, _Path))
					{
						Download_Start_Time = DateTime.Now;
						localFTP.GetFile(Filename, Filename, false);
						As_MemoryStream = new MemoryStream(File.ReadAllBytes(Filename));
						File.Delete(Filename);
						As_MemoryStream.Position = 0;
						Download_Complete_Time = DateTime.Now;

						_Remote_Source_Has_Been_Downloaded = true;
					}
				}
				catch(Exception e)
				{
					Exceptions.Add(e);
					_Remote_Source_Has_Been_Downloaded = false;
				}
			}

		#endregion


		#region Public Methods

			/// <summary>
			/// 
			/// </summary>
			/// <exception cref="ApplicationException"></exception>
			public void Delete_Remote_Source_File()
			{
				if(Exceptions.Count > 0)
				{
					throw new ApplicationException("There are exceptions present before an attempt to delete the source ftp file. Filename = " + Filename);
				}

				try
				{
					if (!_Remote_Source_Has_Been_Downloaded)
					{
						throw new ApplicationException("Cannot delete remote source prior to download.");
					}
					using (FtpConnection localFTP = Get_Logged_In_And_Pathed_FTP_Object(_Host, _Username, _Password, _Path))
					{
						localFTP.RemoveFile(Filename);
						_Remote_Source_Has_Been_Deleted = true;
					}
				}
				catch(Exception e)
				{
					Exceptions.Add(e);
					_Remote_Source_Has_Been_Deleted = false;
				}
			}

		#endregion
	}
}
