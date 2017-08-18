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
    builder.EntitySet<SiteCompany>("SiteCompanies");
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SiteCompaniesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/SiteCompanies
        [EnableQuery]
        public IQueryable<SiteCompany> GetSiteCompanies()
        {
            return db.SiteCompanies;
        }

        // GET: odata/SiteCompanies(5)
        [EnableQuery]
        public SingleResult<SiteCompany> GetSiteCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteCompanies.Where(siteCompany => siteCompany.Id == key));
        }

       
        // POST: odata/SiteCompanies
        public async Task<IHttpActionResult> Post(SiteCompany entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new SiteCompany { Id = -entity.Id };
                db.SiteCompanies.Attach(delEntity);
                db.SiteCompanies.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.SiteCompanies.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.SiteCompanies.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.SiteCompanies.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/SiteCompanies(5)/Company
        [EnableQuery]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteCompanies.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/SiteCompanies(5)/Site
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteCompanies.Where(m => m.Id == key).Select(m => m.Site));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SiteCompanyExists(long key)
        {
            return db.SiteCompanies.Count(e => e.Id == key) > 0;
        }
    }
}
