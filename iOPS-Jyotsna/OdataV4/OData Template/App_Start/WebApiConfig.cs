using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.OData;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Query;

namespace OData_Template
{
	public static class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
		{
			// Web API configuration and services

			// Web API routes
			config.MapHttpAttributeRoutes();

			var builder = new ODataConventionModelBuilder();


			//Samples
			//builder.EntitySet<WaitTime>("WaitTimes");
			//builder.EntitySet<EventWaitTimeGroup>("EventWaitTimeGroups");
			//builder.EntitySet<SampleInstance>("SampleInstances");
			//builder.EntitySet<EpicEvent>("EpicEvents");



			config.MapODataServiceRoute("odata", null, builder.GetEdmModel());

		    config.Filters?.Add(new EnableQueryAttribute()
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
