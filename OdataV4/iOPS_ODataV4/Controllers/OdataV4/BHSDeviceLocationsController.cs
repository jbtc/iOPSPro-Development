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
    builder.EntitySet<BHSDeviceLocation>("BHSDeviceLocations");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class BHSDeviceLocationsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/BHSDeviceLocations
        [EnableQuery]
        public IQueryable<BHSDeviceLocation> GetBHSDeviceLocations()
        {
            return db.BHSDeviceLocations;
        }

        // GET: odata/BHSDeviceLocations(5)
        [EnableQuery]
        public SingleResult<BHSDeviceLocation> GetBHSDeviceLocation([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSDeviceLocations.Where(bHSDeviceLocation => bHSDeviceLocation.Id == key));
        }

       
        // GET: odata/BHSDeviceLocations(5)/Site
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.BHSDeviceLocations.Where(m => m.Id == key).Select(m => m.Site));
        }

        //// GET: odata/BHSDeviceLocations(5)/Observations
        //[EnableQuery]
        //public IQueryable<Observation> GetObservations([FromODataUri] long key)
        //{
        //    return db.Tags.Where(m => m.Id == key).SelectMany(m => m.Observations);
        //}



        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BHSDeviceLocationExists(long key)
        {
            return db.BHSDeviceLocations.Count(e => e.Id == key) > 0;
        }
    }
}
