﻿using System.Web;
using System.Web.Mvc;

namespace MVC_File_Image_Library
{
	public class FilterConfig
	{
		public static void RegisterGlobalFilters(GlobalFilterCollection filters)
		{
			filters.Add(new HandleErrorAttribute());
		}
	}
}