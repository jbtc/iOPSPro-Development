using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.ModelBinding;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.OdataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using iOPS_ODataV4.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<GSAlarmHistory>("GSAlarmHistories");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class GSAlarmHistoriesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/GSAlarmHistories
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<GSAlarmHistory> GetGSAlarmHistories()
        {
            return db.GSAlarmHistories;
        }

        // GET: odata/GSAlarmHistories(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<GSAlarmHistory> GetGSAlarmHistory([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSAlarmHistories.Where(bHSAlarmHistory => bHSAlarmHistory.Id == key));
        }

       

        // GET: odata/GSAlarmHistories(5)/Site
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSAlarmHistories.Where(m => m.Id == key).Select(m => m.Site));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GSAlarmHistoryExists(long key)
        {
            return db.GSAlarmHistories.Count(e => e.Id == key) > 0;
        }
    }
}
