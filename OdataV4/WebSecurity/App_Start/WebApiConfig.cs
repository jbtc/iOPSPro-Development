using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.OData;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Query;
using WebSecurityToken.Models;
using WebSecurityToken.ViewModels;


namespace WebSecurityToken
{
	public static class WebApiConfig
	{
		public static void Register(HttpConfiguration config)
		{
			// Web API configuration and services

			// Web API routes
			config.MapHttpAttributeRoutes();

			ODataConventionModelBuilder builder = new ODataConventionModelBuilder();

            builder.EntitySet<Application>("Applications");
			builder.EntitySet<ActivityLog>("ActivityLogs");
			builder.EntitySet<Role>("Roles");
			builder.EntitySet<User>("Users").EntityType.HasKey(p => p.UserMasterId);
			builder.EntitySet<ExternalUser>("ExternalUsers").EntityType.HasKey(p => p.UserMasterId);
			builder.EntitySet<Activity>("Activities");
			builder.EntitySet<ExternalUser>("ExternalUsers").EntityType.HasKey(p => p.UserMasterId);
			builder.EntitySet<ActivityLog>("ActivityLogs");
			builder.EntitySet<UserRole>("UserRoles");
			builder.EntitySet<ApplicationFileAttachment>("ApplicationFileAttachments");
			builder.EntitySet<SiteSourceCodeAttachment>("SiteSourceCodeAttachments");

			

			//Mapper.CreateMap<User, UserViewModel>();

			//+Special section for the login OData route.
			FunctionConfiguration function = builder.Function("login").ReturnsFromEntitySet<UserViewModel>("users");



            //+Special section for the login via token OData route.
            FunctionConfiguration functiontoken = builder.Function("loginaccesstoken")
                .ReturnsFromEntitySet<UserViewModel>("users");

            //-NOTE:WebAPI OData bound functions will not let you send strings as parameters unless they are wrapped in single quotes. 
            //-The single quotes will follow the parameter all the way into the function.
            //-You must strip the single quotes off of the values in the method to get the real values.
            functiontoken.Parameter<string>("accesstoken");

            //+Special section for the username check OData route.
            FunctionConfiguration functionUsernameCheck = builder.Function("usernamecheck")
                .Returns<bool>();
            functionUsernameCheck.Parameter<string>("username");

            //+Special section for the register OData route.
            FunctionConfiguration registerUserFunction = builder.Function("registration")
				.ReturnsFromEntitySet<UserViewModel>("users");
			registerUserFunction.Parameter<string>("username");
			registerUserFunction.Parameter<string>("password");

			config.MapODataServiceRoute("odata", null, builder.GetEdmModel());

			var cors = new EnableCorsAttribute(
			origins: "*",
			headers: "*",
			methods: "*");
			config.EnableCors(cors);

			
			//Globally places an [EnableQuery] attribute on each method in the entire api.
			config.Filters.Add(new EnableQueryAttribute()
			{
				MaxExpansionDepth = 10,
				AllowedQueryOptions = AllowedQueryOptions.All
				// .. other settings
			});


			config.Routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);
		}
	}


	
}
