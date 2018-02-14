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
    builder.EntitySet<BHSBagTagScan>("BHSBagTagScans");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class BHSBagTagScansController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/BagTagScans
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<BHSBagTagScan> GetBHSBagTagScans()
        {
            return db.BHSBagTagScans;
        }

        // GET: odata/BagTagScans(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<BHSBagTagScan> GetBHSBagTagScan([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSBagTagScans.Where(BHSbagTagScan => BHSbagTagScan.Id == key));
        }

        

        // GET: odata/BHSBagTagScans(5)/Site
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSBagTagScans.Where(m => m.Id == key).Select(m => m.Site));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BHSBagTagScanExists(long key)
        {
            return db.BHSBagTagScans.Count(e => e.Id == key) > 0;
        }
    }
}
