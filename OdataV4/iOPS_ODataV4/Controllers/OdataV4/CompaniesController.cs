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
    builder.EntitySet<Company>("Companies");
    builder.EntitySet<Asset>("Assets"); 
    builder.EntitySet<CompanyContact>("CompanyContacts"); 
    builder.EntitySet<CompanyDataReader>("CompanyDataReaders"); 
    builder.EntitySet<SiteCompany>("SiteCompanies"); 
    builder.EntitySet<CompanyType>("CompanyTypes"); 
    builder.EntitySet<SystemGroup>("SystemGroups"); 
    builder.EntitySet<CustomJBTStandardObservation>("CustomJBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CompaniesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Companies
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Company> GetCompanies()
        {
            return db.Companies;
        }

        // GET: odata/Companies(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.Companies.Where(company => company.Id == key));
        }

       

        // POST: odata/Companies
       public async Task<IHttpActionResult> Post(Company entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Company { Id = -entity.Id };
                db.Companies.Attach(delEntity);
                db.Companies.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Companies.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Companies.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Companies.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/Companies(5)/Assets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        // GET: odata/Companies(5)/CompanyContacts
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyContact> GetCompanyContacts([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.CompanyContacts);
        }

        // GET: odata/Companies(5)/CompanyDataReaders
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyDataReader> GetCompanyDataReaders([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.CompanyDataReaders);
        }

        // GET: odata/Companies(5)/SiteCompanies
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SiteCompany> GetSiteCompanies([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.SiteCompanies);
        }

        // GET: odata/Companies(5)/CompanyType
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<CompanyType> GetCompanyType([FromODataUri] long key)
        {
            return SingleResult.Create(db.Companies.Where(m => m.Id == key).Select(m => m.CompanyType));
        }

        // GET: odata/Companies(5)/Systems
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGroup> GetSystems([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.Systems);
        }

        // GET: odata/Companies(5)/CustomJBTStandardObservations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CustomJBTStandardObservation> GetCustomJBTStandardObservations([FromODataUri] long key)
        {
            return db.Companies.Where(m => m.Id == key).SelectMany(m => m.CustomJBTStandardObservations);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CompanyExists(long key)
        {
            return db.Companies.Count(e => e.Id == key) > 0;
        }
    }
}
