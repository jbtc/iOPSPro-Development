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
	// NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IService1" in both code and config file together.
	[ServiceContract]
	public interface IFile_Image_Library_Service
	{

		[OperationContract]
		string Store_ByteArray(byte[] bytes, string fileName);

		[OperationContract]
		string Store_Memorystream(MemoryStream stream, string fileName);

		[OperationContract]
		byte[] Retrieve_ByteArray(string MD5_Signature);

		[OperationContract]
		MemoryStream Retrieve_Memorystream(string MD5_Signature);

		[OperationContract]
		FIL_Index Get_Index_Entry(string MD5_Signature);

		// TODO: Add your service operations here
	}


	// Use a data contract as illustrated in the sample below to add composite types to service operations.
	[DataContract]
	public class FIL_Index
	{

		public FIL_Index(Library.File_Content_Objects.File_Image_Library_File_Content objFIL)
		{
			_objFIL = objFIL;
		}

		Library.File_Content_Objects.File_Image_Library_File_Content _objFIL;



		[DataMember]
		public long Image_ID
		{
			get { return _objFIL.Image_ID; }
			set { }
		}

		[DataMember]
		public string FileName
		{
			get { return _objFIL.Filename; }
			set { }
		}

		[DataMember]
		public string MD5_Signature
		{
			get { return _objFIL.MD5_Hex_Signature; }
			set { }
		}

		[DataMember]
		public DateTime Created
		{
			get { return _objFIL.Creation_Date; }
			set { }
		}

		[DataMember]
		public string MimeType
		{
			get { return _objFIL.MimeType; }
			set { }
		}

		[DataMember]
		public long Size
		{
			get { return _objFIL.Uncompressed_Size; }
			set { }
		}

		[DataMember]
		public long CompressedSize
		{
			get { return _objFIL.Compressed_Size; }
			set { }
		}



	}
}
