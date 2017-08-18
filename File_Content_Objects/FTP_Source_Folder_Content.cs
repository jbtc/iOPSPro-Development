using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using FtpLib;

namespace Library.Utilities.File_Content_Objects
{
	/// <summary>
	/// 
	/// </summary>
	public class FTP_Source_Folder
	{

		#region Constructors
			public FTP_Source_Folder(string Host, string Username, string Password, string Path)
			{
				_Host = Host;
				_Username = Username;
				_Password = Password;
				_Path = Path;
				_ftp = Get_Logged_In_And_Pathed_FTP_Object(Host, Username, Password, Path);
				//_ftp.OnDirList += DirListEventHandler;
				//_ftp.OnEndTransfer += End_Directory_Listing_Event_Handler;
				try
				{
					//_ftp.ListDirectory();
				}
				catch (Exception e)
				{
					Exceptions.Add(e);
				}


				//Wait for the directroy listing to finish via a flag.
				for (; ; )
				{
					Thread.Sleep(50);
					if (Directory_Has_Finished_Listing)
					{
						break;
					}
				}

			}
		#endregion

		#region Private Fields
			private FtpConnection _ftp;
			private bool Directory_Has_Finished_Listing = false;
			private string _Host, _Username, _Password, _Path;
			private ConcurrentBag<FTP_File_Content> _FTP_Folder_Files_Content_List = new ConcurrentBag<FTP_File_Content>();
		#endregion

		#region Public Properties
			public ConcurrentBag<FTP_File_Content> FTP_Folder_Files_Content_List
			{
				get { return _FTP_Folder_Files_Content_List; }
			}

			public List<Exception> Exceptions = new List<Exception>();

		#endregion

		#region Private Methods
			//private void DirListEventHandler(object ftp, FtpDirListEventArgs e)
			//{
			//	_FTP_Folder_Files_Content_List.Add(new FTP_File_Content(_Host, _Username, _Password, _Path, e.FileName));
			//}

			//private void End_Directory_Listing_Event_Handler(object ftp, FtpEndTransferEventArgs e)
			//{
			//	ftp = null;
			//	_ftp = null;
			//	// Signal the method FTP_From_Lason_And_Process_Files() that the directory listing is finished and it can go on
			//	// and proces the files listed. It is in a timing loop waiting for this flag to be set.
			//	Directory_Has_Finished_Listing = true;
			//}




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
				catch (Exception e)
				{
					Exceptions.Add(e);
					return null;
				}
			}
		#endregion


	}
}
