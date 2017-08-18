using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.OData;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Query;
using FileImageLibrary.Controllers.ODataV4;
using FileImageLibrary.Models;

namespace FileImageLibrary
{
	public static class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
		{
			// Web API configuration and services


			// Web API routes
			config.MapHttpAttributeRoutes();




			var builder = new ODataConventionModelBuilder();
			builder.EntitySet<ImageViewModel>("Images");
			builder.EntitySet<FileImage>("FileImages").EntityType.HasKey(p => p.intFIL_Seq_Num);

			//++Special section for the upload via token OData route.
			FunctionConfiguration functionUploadToken = builder.Function("upload").ReturnsFromEntitySet<FileImage>("Uploads");

			//++Special section for the image key list collection via token OData route.
			builder.Function("ByImageKeyList").ReturnsFromEntitySet<ImageViewModel>("ImageViewModels");


			config.MapODataServiceRoute("odata", null, builder.GetEdmModel());

			if (config.Filters != null)
				config.Filters.Add(new EnableQueryAttribute()
				{
					MaxExpansionDepth = 10,
					AllowedQueryOptions = AllowedQueryOptions.All
					// .. other settings
				});

			var cors = new EnableCorsAttribute(
			origins: "*",
			headers: "*",
			methods: "*");

			config.EnableCors(cors);

			config.Routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);
		}
	}
}
