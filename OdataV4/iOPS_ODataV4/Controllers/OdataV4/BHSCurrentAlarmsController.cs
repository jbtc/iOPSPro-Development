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
    builder.EntitySet<BHSCurrentAlarm>("BHSCurrentAlarms");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class BHSCurrentAlarmsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/BHSCurrentAlarms
        [EnableQuery]
        public IQueryable<BHSCurrentAlarm> GetBHSCurrentAlarms()
        {
            return db.BHSCurrentAlarms;
        }

        // GET: odata/BHSCurrentAlarms(5)
        [EnableQuery]
        public SingleResult<BHSCurrentAlarm> GetBHSCurrentAlarm([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSCurrentAlarms.Where(bHSCurrentAlarm => bHSCurrentAlarm.Id == key));
        }

       
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BHSCurrentAlarmExists(long key)
        {
            return db.BHSCurrentAlarms.Count(e => e.Id == key) > 0;
        }
    }
}
