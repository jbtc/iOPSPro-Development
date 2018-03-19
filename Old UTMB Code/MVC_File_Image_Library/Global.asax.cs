using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;
using Castle.Windsor;
using Castle.MicroKernel.Registration;
using Castle.Core;
using Castle.Windsor.Configuration;
using Castle.Windsor.Installer;
using System.Globalization;

namespace MVC_File_Image_Library
{
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801
	public class MvcApplication : System.Web.HttpApplication
	{
		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();

			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			ValueProviderFactories.Factories.Add(new CookieValueProviderFactory());
			ValueProviderFactories.Factories.Add(new ServerVariableValueProviderFactory());
			ValueProviderFactories.Factories.Add(new SessionValueProviderFactory());

		}

		protected void Application_End()
		{
		}

		
		
		
		void Session_Start(object sender, EventArgs e)
		{

	
			
			// your code here, it will be executed upon session start
		}

		
	
	}

	internal class CookieValueProviderFactory : ValueProviderFactory
	{
		public override IValueProvider GetValueProvider(ControllerContext controllerContext)
		{
			return new CookieValueProvider(controllerContext.HttpContext.Request.Cookies);
		}

		private class CookieValueProvider : IValueProvider
		{

			private readonly HttpCookieCollection _cookieCollection;

			public CookieValueProvider(HttpCookieCollection cookieCollection)
			{
				_cookieCollection = cookieCollection;
			}

			public bool ContainsPrefix(string prefix)
			{
				return _cookieCollection[prefix] != null;
			}

			public ValueProviderResult GetValue(string key)
			{
				HttpCookie cookie = _cookieCollection[key];
				return cookie != null ? new ValueProviderResult(cookie.Value, cookie.Value, CultureInfo.CurrentUICulture) : null;
			}
		}
	}

	internal class ServerVariableValueProviderFactory : ValueProviderFactory
	{
		public override IValueProvider GetValueProvider(ControllerContext controllerContext)
		{
			return new ServerVariableValueProvider(controllerContext.HttpContext.Request.ServerVariables);
		}

		private class ServerVariableValueProvider : IValueProvider
		{


			private readonly System.Collections.Specialized.NameValueCollection _serverVariableCollection;

			public ServerVariableValueProvider(System.Collections.Specialized.NameValueCollection serverVariableCollection)
			{
				_serverVariableCollection = serverVariableCollection;
			}

			public bool ContainsPrefix(string prefix)
			{
				return _serverVariableCollection[prefix] != null;
			}

			public ValueProviderResult GetValue(string key)
			{
				string value = _serverVariableCollection[key];
				return value != null ? new ValueProviderResult(value, value, CultureInfo.CurrentUICulture) : null;
			}
		}
	}

	internal class SessionValueProviderFactory : ValueProviderFactory
	{
		public override IValueProvider GetValueProvider
		(ControllerContext controllerContext)
		{
			return new SessionValueProvider();
		}

		private class SessionValueProvider : IValueProvider
		{
			public bool ContainsPrefix(string prefix)
			{
				return HttpContext.Current.Session[prefix] != null;
			}

			public ValueProviderResult GetValue(string key)
			{
				if (HttpContext.Current.Session[key] == null)
					return null;

				return new ValueProviderResult(HttpContext.Current.Session[key],
					HttpContext.Current.Session[key].ToString(), CultureInfo.CurrentCulture);
			}
		}
	}

}