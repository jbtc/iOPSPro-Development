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
    builder.EntitySet<CompanyDataReader>("CompanyDataReaders");
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CompanyDataReadersController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/CompanyDataReaders
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyDataReader> GetCompanyDataReaders()
        {
            return db.CompanyDataReaders;
        }

        // GET: odata/CompanyDataReaders(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<CompanyDataReader> GetCompanyDataReader([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyDataReaders.Where(companyDataReader => companyDataReader.Id == key));
        }

        

        // POST: odata/CompanyDataReaders
        public async Task<IHttpActionResult> Post(CompanyDataReader entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new CompanyDataReader { Id = -entity.Id };
                db.CompanyDataReaders.Attach(delEntity);
                db.CompanyDataReaders.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.CompanyDataReaders.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.CompanyDataReaders.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.CompanyDataReaders.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/CompanyDataReaders(5)/Company
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyDataReaders.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/CompanyDataReaders(5)/iOPSUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyDataReaders.Where(m => m.Id == key).Select(m => m.iOPSUser));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CompanyDataReaderExists(long key)
        {
            return db.CompanyDataReaders.Count(e => e.Id == key) > 0;
        }
    }
}
