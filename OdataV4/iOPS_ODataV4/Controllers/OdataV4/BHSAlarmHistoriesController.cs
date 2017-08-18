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
    builder.EntitySet<BHSAlarmHistory>("BHSAlarmHistories");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class BHSAlarmHistoriesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/BHSAlarmHistories
        [EnableQuery]
        public IQueryable<BHSAlarmHistory> GetBHSAlarmHistories()
        {
            return db.BHSAlarmHistories;
        }

        // GET: odata/BHSAlarmHistories(5)
        [EnableQuery]
        public SingleResult<BHSAlarmHistory> GetBHSAlarmHistory([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSAlarmHistories.Where(bHSAlarmHistory => bHSAlarmHistory.Id == key));
        }

       

        // GET: odata/BHSAlarmHistories(5)/Site
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSAlarmHistories.Where(m => m.Id == key).Select(m => m.Site));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BHSAlarmHistoryExists(long key)
        {
            return db.BHSAlarmHistories.Count(e => e.Id == key) > 0;
        }
    }
}
