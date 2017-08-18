using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using ceTe.DynamicPDF;
using ceTe.DynamicPDF.Merger;
using Library.Utilities.PDF;

namespace Library.Utilities.File_Content_Objects
{

	/// <summary>
	/// PDF File Handling object. Incorporates common processing tasks and properties. 
	/// Includes a PDF Data Harvester object that will be automatically instantiated upon use.
	/// </summary>
    public class PDF_File_Content : File_Content

	{


		#region Constructors


			/// <summary>
			/// Constructs an empty PDF_File_Content object.
			/// </summary>
			public PDF_File_Content()
			{ }

			/// <summary>
			/// Builds object using a MemoryStream for input.
			/// </summary>
			/// <param name="stmPDF_Contents"></param>
			public PDF_File_Content(MemoryStream stmPDF_Contents) : base(stmPDF_Contents) { }

			/// <summary>
			/// Builds object using a MemoryStream and the underlying filename for input.
			/// </summary>
			/// <param name="stmPDF_Contents">Contents of the file as a memoryStream reference.</param>
			/// <param name="Filename">The filename of the file data IF it was written to the filesystem.</param>
			public PDF_File_Content(MemoryStream stmPDF_Contents, string Filename) : base(stmPDF_Contents, Filename) { }

			/// <summary>
			/// Builds object using a byte array for input.
			/// </summary>
			/// <param name="arrPDF_Contents">PDF File contents as a byte array.</param>
			public PDF_File_Content(byte[] arrPDF_Contents) : base(arrPDF_Contents) { }

			/// <summary>
			/// Builds object using a byte array and name for input.
			/// </summary>
			/// <param name="arrPDF_Contents">PDF File contents as a byte array.</param>
			/// <param name="name">Filename.</param>
			public PDF_File_Content(byte[] arrPDF_Contents, string name) : base(arrPDF_Contents, name) { }

			/// <summary>
			/// Builds object using a FileInfo object for input.
			/// </summary>
			/// <param name="objPDF_Fileinfo"></param>
			public PDF_File_Content(FileInfo objPDF_Fileinfo) : base(objPDF_Fileinfo) { }

			/// <summary>
			/// 
			/// </summary>
			/// <param name="PDF_File_Content_Objects_To_Concatenate"></param>
			public PDF_File_Content(List<PDF_File_Content> PDF_File_Content_Objects_To_Concatenate)
			{
				As_MemoryStream = Get_Concatenated_PDF_MemoryStream(PDF_File_Content_Objects_To_Concatenate);
			}


		#endregion

		#region Properties

			#region PDF_Data_Harvester
				private PDF_Data_Harvester _PDF_Data_Harvester;
				/// <summary>
				/// Text data extractor for the pdf content automatically supplied as part of the PDF_File_Content object. See the methods of this object for more info.
				/// </summary>
				public PDF_Data_Harvester PDF_Data_Harvester
				{
					get
					{
						if (_PDF_Data_Harvester == null)
						{
							if (As_FileInfo != null)
							{
								_PDF_Data_Harvester = new PDF_Data_Harvester(As_FileInfo);
							}
							else if (As_MemoryStream != null)
							{
								_PDF_Data_Harvester = new PDF_Data_Harvester(As_MemoryStream);
							}
							else if (As_Byte_Array != null)
							{
								_PDF_Data_Harvester = new PDF_Data_Harvester(As_Byte_Array);
							}
						}
						return _PDF_Data_Harvester;

					}
				}
			#endregion

			#region PDF_File_Content_Pages - List of PDF_File_Content objects comprised of individual pages of the parent PDF_File_Content
				/// <summary>
				/// 
				/// </summary>
				public class PDF_File_Content_Page_Class
				{
					/// <summary>
					/// 
					/// </summary>
					public int Page_Number;
					/// <summary>
					/// 
					/// </summary>
					public bool Is_Blank_Page = false;
					/// <summary>
					/// 
					/// </summary>
					public PDF_File_Content PDF_File_Content_Reference;
				}
				private ConcurrentBag<PDF_File_Content_Page_Class> _PDF_File_Content_Pages = new ConcurrentBag<PDF_File_Content_Page_Class>();

				/// <summary>
				/// 
				/// </summary>
				public ConcurrentBag<PDF_File_Content_Page_Class> PDF_File_Content_Pages
				{
					get 
					{
						if (_PDF_File_Content_Pages.Count == 0)
						{
							//We need to build a list of the pages of the pdf content as individual pdf file content items. The end user process is asking for it.
							Split_PDF_Pages();
						}
						return _PDF_File_Content_Pages; 
					}
				}
			#endregion

				private PdfDocument _Dynamic_PDF_PdfDocument;

				/// <summary>
				/// 
				/// </summary>
				public PdfDocument Dynamic_PDF_PdfDocument
				{
					get
					{
						Document.AddLicense("MER70NEDLAABGFnBU2EiD4A3TbbDcIoA4BzhNaBw6fbw84w66qu6A3YztX0aQbp0EOnqak/ygft3+jem6wM418aykczVRn3ZHUeA");
						if (_Dynamic_PDF_PdfDocument == null)
						{
							if (As_MemoryStream != null)
							{
								_Dynamic_PDF_PdfDocument = new PdfDocument(As_MemoryStream);
							}
							else if (As_Byte_Array != null)
							{
								_Dynamic_PDF_PdfDocument = new PdfDocument(As_Byte_Array);
							}
							else if (As_FileInfo != null)
							{
								_Dynamic_PDF_PdfDocument = new PdfDocument(As_FileInfo.FullName);
							}
						}
						return _Dynamic_PDF_PdfDocument;
					}
				}
				private MergeDocument _Dynamic_PDF_MergeDocument;

				/// <summary>
				/// 
				/// </summary>
				public MergeDocument Dynamic_PDF_MergeDocument
				{
					get
					{
						Document.AddLicense("MER70NEDLAABGFnBU2EiD4A3TbbDcIoA4BzhNaBw6fbw84w66qu6A3YztX0aQbp0EOnqak/ygft3+jem6wM418aykczVRn3ZHUeA");
						if (_Dynamic_PDF_MergeDocument == null)
						{
							_Dynamic_PDF_MergeDocument = new MergeDocument(Dynamic_PDF_PdfDocument);
						}
						return _Dynamic_PDF_MergeDocument;
					}
					set {
						_Dynamic_PDF_MergeDocument = value;
					}
				}

		#endregion

		#region Methods


			private void Split_PDF_Pages()
			{
				//Create a PdfDocument object to load the PDF.
				PdfDocument pdfToSplit = new PdfDocument(As_MemoryStream);

				//Loop through the page count and create an individual PDF for each page.
				for (int i = 1; i <= pdfToSplit.Pages.Count; i++)
				{
					MemoryStream msPage = new MemoryStream();
					MergeDocument doc = new MergeDocument(pdfToSplit, i, 1);
					doc.Draw(msPage);
					PDF_File_Content_Page_Class page = new PDF_File_Content_Page_Class
					{
						Page_Number = i,
						PDF_File_Content_Reference = new PDF_File_Content(msPage)
					};
					_PDF_File_Content_Pages.Add(page);
				}



			}

			private MemoryStream Get_Concatenated_PDF_MemoryStream(List<PDF_File_Content> PDF_File_Content_Objects_To_Concatenate)
			{
				if (PDF_File_Content_Objects_To_Concatenate == null)
				{
					throw new ArgumentNullException("PDF_File_Content_Objects_To_Concatenate");
				}
				throw new NotImplementedException();
			}

		#endregion


	}
}
