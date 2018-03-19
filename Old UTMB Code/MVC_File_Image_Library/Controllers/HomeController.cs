using System;
using System.Web.Mvc;
using Castle.Core.Logging;
using Library;
using Library.ExtensionMethods.Custom;
using Library.Utilities.File_Content_Objects;
using Library.Utilities.MemoryCache;

namespace MVC_File_Image_Library.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/
		// this is Castle.Core.Logging.ILogger, not log4net.Core.ILogger
		public ILogger Logger { get; set; }

        public ActionResult Index()
        {
			

            return View();
        }


		public ActionResult CookieLooker(string strToken)
		{
			ViewBag.strToken = strToken;
			return View();
		}

		public ActionResult CookieLookerWithMessage(string strToken, string message)
		{
			ViewBag.strToken = strToken;
			ViewBag.message = message;
			return View("CookieLooker");
		}

		public ActionResult SessionLooker(string strSession_message)
		{
			ViewBag.strSession_message = strSession_message;
			return View();

		}
		


		public ActionResult MD5_Image_Display(string md5)
		{
			File_Image_Library_File_Content fil = File_Image_Library_File_Content.Get_Entry_By_MD5_Signature(md5);
			Response.AddHeader("content-disposition", String.Format("inline;filename={0}", fil.Filename));
			return new FileContentResult(fil.As_Byte_Array, "application/octet-stream");
		}




	
		public ActionResult ID_Image_Display(string strToken, long Image_ID)
		{
			if (Library.UTMB.MyUTMBUser.User.Get_User_By_Token(strToken).Is_Logged_In || true)
			{
				MyCache objCache = new MyCache();
				string cacheKey = string.Format("FIL_{0}", Image_ID);
				File_Image_Library_File_Content fil = (File_Image_Library_File_Content)objCache.GetMyCachedItem(cacheKey);
				if (fil == null)
				{
					fil = File_Image_Library_File_Content.Get_Entry_By_Image_ID(Image_ID);
					objCache.AddToMySlidingCache(string.Format("FIL_{0}", Image_ID), fil, MyCache.MyCachePriority.Default, 3.Hours());
				}


				Response.AddHeader("content-disposition", String.Format("inline;filename={0}", fil.Filename));
				return new FileContentResult(fil.As_Byte_Array, "application/octet-stream");
			}
			else
			{
				return View("Unauthorized");

			}
		}
	}
}
