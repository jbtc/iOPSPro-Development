using System.Net;

namespace Library.Utilities.File_Content_Objects
{
	public class URL_File_Content : File_Content
	{
		public URL_File_Content(string url)
		{
			using (WebClient client = new WebClient())
			{
				string s = client.DownloadString(url);
				As_String = s;
			}

		}
	}
}
