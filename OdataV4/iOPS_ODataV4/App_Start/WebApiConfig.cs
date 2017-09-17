using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.OData;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Query;
using iOPS_ODataV4.Filters;
using iOPS_ODataV4.Models;
using iOPS_ODataV4.ViewModels;

namespace iOPS_ODataV4
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
            builder.EntitySet<Asset>("Assets");
            builder.EntitySet<AssetCondition>("AssetConditions");
            builder.EntitySet<AssetType>("AssetTypes");
            builder.EntitySet<AssetGraphic>("AssetGraphics");
            builder.EntitySet<AssetGraphicVisibleValue>("AssetGraphicVisibleValues");
            builder.EntitySet<AuthorizableActivity>("AuthorizableActivities");
            builder.EntitySet<BHSBagTagScan>("BHSBagTagScans");
            builder.EntitySet<Company>("Companies");
            builder.EntitySet<CompanyType>("CompanyTypes");
            builder.EntitySet<CompanyContact>("CompanyContacts");
            builder.EntitySet<CompanyDataReader>("CompanyDataReaders");
            builder.EntitySet<Country>("Countries");
            builder.EntitySet<iOPSUser>("iOPSUsers");
            builder.EntitySet<Site>("Sites");
            builder.EntitySet<SystemGroup>("SystemGroups");
            builder.EntitySet<SystemType>("SystemTypes");
            builder.EntitySet<Tag>("Tags");
            builder.EntitySet<UserAuthorizedActivity>("UserAuthorizedActivities");
            builder.EntitySet<SiteCompany>("SiteCompanies");
            builder.EntitySet<CustomJBTStandardObservation>("CustomJBTStandardObservations");
            builder.EntitySet<Person>("People");
            builder.EntitySet<CompanyDataReader>("CompanyDataReaders");
            builder.EntitySet<Dashboard>("Dashboards");
            builder.EntitySet<SiteDataReader>("SiteDataReaders");
            builder.EntitySet<UserEventLog>("UserEventLogs");
            builder.EntitySet<Dashboard>("Dashboards");
            builder.EntitySet<SiteCompany>("SiteCompanies");
            builder.EntitySet<Observation>("Observations");
            builder.EntitySet<JBTStandardObservation>("JBTStandardObservations");
            builder.EntitySet<Unit>("Units");
            builder.EntitySet<BHSJamAlarm>("BHSJamAlarms");
            builder.EntitySet<StateAbbreviation>("StateAbbreviations");
            builder.EntitySet<DatabaseMailQueue>("DatabaseMailQueues");
            builder.EntitySet<Widget>("Widgets");
            builder.EntitySet<WidgetGraphTag>("WidgetGraphTags");
            builder.EntitySet<WidgetType>("WidgetTypes");
            builder.EntitySet<WidgetCustomTagDisplayOrder>("WidgetCustomTagDisplayOrders");
            builder.EntitySet<BHSDeviceLocation>("BHSDeviceLocations");
            builder.EntitySet<BHSCurrentAlarm>("BHSCurrentAlarms");
            builder.EntitySet<DashboardTimeScope>("DashboardTimeScopes");
            builder.EntitySet<BHSAlarmHistory>("BHSAlarmHistories");







            ////+Special section for the login OData route.
            FunctionConfiguration function = builder.Function("login").ReturnsFromEntitySet<iOPSUserViewModel>("users");



            ////+Special section for the username check OData route.
            FunctionConfiguration functionUsernameCheck = builder.Function("usernamecheck")
                .Returns<bool>();
            functionUsernameCheck.Parameter<string>("username");

            ////+Special section for the register OData route.
            FunctionConfiguration registerUserFunction = builder.Function("registration")
                .ReturnsFromEntitySet<iOPSUserViewModel>("users");
            registerUserFunction.Parameter<string>("username");
            registerUserFunction.Parameter<string>("password");


            config.MapODataServiceRoute("odata", null, builder.GetEdmModel());

            config.Filters?.Add(new EnableQueryAttribute()
            {
                MaxExpansionDepth = 100,
                AllowedQueryOptions = AllowedQueryOptions.All
                // .. other settings
            });

            //config.Filters.Add(new IOPSAuthorizeAttribute());

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
