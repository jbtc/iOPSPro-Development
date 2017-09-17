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
    builder.EntitySet<CompanyType>("CompanyTypes");
    builder.EntitySet<Company>("Companies"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CompanyTypesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/CompanyTypes
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyType> GetCompanyTypes()
        {
            return db.CompanyTypes;
        }

        // GET: odata/CompanyTypes(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<CompanyType> GetCompanyType([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyTypes.Where(companyType => companyType.Id == key));
        }

        
        // POST: odata/CompanyTypes
        public async Task<IHttpActionResult> Post(CompanyType entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new CompanyType { Id = -entity.Id };
                db.CompanyTypes.Attach(delEntity);
                db.CompanyTypes.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.CompanyTypes.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.CompanyTypes.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.CompanyTypes.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/CompanyTypes(5)/Companies
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Company> GetCompanies([FromODataUri] long key)
        {
            return db.CompanyTypes.Where(m => m.Id == key).SelectMany(m => m.Companies);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CompanyTypeExists(long key)
        {
            return db.CompanyTypes.Count(e => e.Id == key) > 0;
        }
    }
}
