using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;
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
    builder.EntitySet<Site>("Sites");
    builder.EntitySet<Asset>("Assets"); 
    builder.EntitySet<SiteCompany>("SiteCompanies"); 
    builder.EntitySet<SiteDataReader>("SiteDataReaders"); 
    builder.EntitySet<SystemGroup>("SystemGroups"); 
    builder.EntitySet<BHSAlarm>("BHSAlarms"); 
    builder.EntitySet<BagTagScan>("BagTagScans"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SitesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Sites
        [EnableQuery]
        public IQueryable<Site> GetSites()
        {
            return db.Sites;
        }

        // GET: odata/Sites(5)
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.Sites.Where(site => site.Id == key));
        }

        


        // POST: odata/Sites
        public async Task<IHttpActionResult> Post(Site entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Site {Id = -entity.Id};
                db.Sites.Attach(delEntity);
                db.Sites.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Sites.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Sites.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Sites.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

       

        // GET: odata/Sites(5)/Assets
        [EnableQuery]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        // GET: odata/Sites(5)/SiteCompanies
        [EnableQuery]
        public IQueryable<SiteCompany> GetSiteCompanies([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.SiteCompanies);
        }

        // GET: odata/Sites(5)/SiteDataReaders
        [EnableQuery]
        public IQueryable<SiteDataReader> GetSiteDataReaders([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.SiteDataReaders);
        }

        // GET: odata/Sites(5)/Systems
        [EnableQuery]
        public IQueryable<SystemGroup> GetSystems([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.Systems);
        }

        //// GET: odata/Sites(5)/BHSAlarms
        //[EnableQuery]
        //public IQueryable<BHSAlarm> GetBHSAlarms([FromODataUri] long key)
        //{
        //    return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BHSAlarms);
        //}

        // GET: odata/Sites(5)/BagTagScans
        [EnableQuery]
        public IQueryable<BHSBagTagScan> GetBagTagScans([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BagTagScans);
        }

        // GET: odata/Sites(5)/JamAlarms
        [EnableQuery]
        public IQueryable<BHSJamAlarm> GetBHSJamAlarms([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BHSJamAlarms);
        }

        // GET: odata/Sites(5)/BHSDeviceLocations
        [EnableQuery]
        public IQueryable<BHSDeviceLocation> GetBHSDeviceLocations([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BHSDeviceLocations);
        }


        // GET: odata/Sites(5)/BHSCurrentAlarms
        [EnableQuery]
        public IQueryable<BHSCurrentAlarm> GetBHSCurrentAlarms([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BHSCurrentAlarms);
        }

        // GET: odata/Sites(5)/BHSAlarmHistories
        [EnableQuery]
        public IQueryable<BHSAlarmHistory> GetBHSAlarmHistories([FromODataUri] long key)
        {
            return db.Sites.Where(m => m.Id == key).SelectMany(m => m.BHSAlarmHistories);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SiteExists(long key)
        {
            return db.Sites.Count(e => e.Id == key) > 0;
        }
    }
}
