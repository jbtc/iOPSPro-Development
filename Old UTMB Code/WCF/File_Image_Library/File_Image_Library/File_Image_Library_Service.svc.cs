using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.IO;

namespace File_Image_Library
{
	// NOTE: You can use the "Rename" command on the "Refactor" menu to change the class name "Service1" in code, svc and config file together.
	// NOTE: In order to launch WCF Test Client for testing this service, please select Service1.svc or Service1.svc.cs at the Solution Explorer and start debugging.
	public class File_Image_Library_Service : IFile_Image_Library_Service
	{

		#region IFile_Image_Library_Service Members

		string IFile_Image_Library_Service.Store_ByteArray(byte[] bytes, string fileName)
		{

			var objFIL = new Library.File_Content_Objects.File_Image_Library_File_Content(bytes, fileName);
			return objFIL.MD5_Hex_Signature;
		}

		string IFile_Image_Library_Service.Store_Memorystream(System.IO.MemoryStream stream, string fileName)
		{
			var objFIL = new Library.File_Content_Objects.File_Image_Library_File_Content(stream, fileName);
			return objFIL.MD5_Hex_Signature;
		}

		byte[] IFile_Image_Library_Service.Retrieve_ByteArray(string MD5_Signature)
		{
			var objFIL = Library.File_Content_Objects.File_Image_Library_File_Content.Get_Entry_By_MD5_Signature(MD5_Signature);
			return objFIL.As_Byte_Array;
		}

		MemoryStream IFile_Image_Library_Service.Retrieve_Memorystream(string MD5_Signature)
		{
			var objFIL = Library.File_Content_Objects.File_Image_Library_File_Content.Get_Entry_By_MD5_Signature(MD5_Signature);
			return objFIL.As_MemoryStream;
		}

		FIL_Index IFile_Image_Library_Service.Get_Index_Entry(string MD5_Signature)
		{
			var objFIL = Library.File_Content_Objects.File_Image_Library_File_Content.Get_Entry_By_MD5_Signature(MD5_Signature);
			var index = new FIL_Index(objFIL);
			return index;
		}

		#endregion
	}
}
