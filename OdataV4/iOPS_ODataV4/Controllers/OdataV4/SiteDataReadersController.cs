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
    builder.EntitySet<SiteDataReader>("SiteDataReaders");
    builder.EntitySet<Site>("Sites"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SiteDataReadersController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/SiteDataReaders
        [EnableQuery]
        public IQueryable<SiteDataReader> GetSiteDataReaders()
        {
            return db.SiteDataReaders;
        }

        // GET: odata/SiteDataReaders(5)
        [EnableQuery]
        public SingleResult<SiteDataReader> GetSiteDataReader([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteDataReaders.Where(siteDataReader => siteDataReader.Id == key));
        }

        
        // POST: odata/SiteDataReaders
       public async Task<IHttpActionResult> Post(SiteDataReader entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new SiteDataReader { Id = -entity.Id };
                db.SiteDataReaders.Attach(delEntity);
                db.SiteDataReaders.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.SiteDataReaders.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.SiteDataReaders.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.SiteDataReaders.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/SiteDataReaders(5)/Site
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteDataReaders.Where(m => m.Id == key).Select(m => m.Site));
        }

        // GET: odata/SiteDataReaders(5)/iOPSUser
        [EnableQuery]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteDataReaders.Where(m => m.Id == key).Select(m => m.iOPSUser));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SiteDataReaderExists(long key)
        {
            return db.SiteDataReaders.Count(e => e.Id == key) > 0;
        }
    }
}
