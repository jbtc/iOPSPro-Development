using System.Web;
using System.Web.Mvc;
using iOPS_ODataV4.Filters;

namespace iOPS_ODataV4
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
