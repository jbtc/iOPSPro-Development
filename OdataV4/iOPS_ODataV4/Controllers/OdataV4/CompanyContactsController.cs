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
    builder.EntitySet<CompanyContact>("CompanyContacts");
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<Person>("People"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CompanyContactsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/CompanyContacts
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyContact> GetCompanyContacts()
        {
            return db.CompanyContacts;
        }

        // GET: odata/CompanyContacts(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<CompanyContact> GetCompanyContact([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyContacts.Where(companyContact => companyContact.Id == key));
        }

        

        // POST: odata/CompanyContacts
        

        public async Task<IHttpActionResult> Post(CompanyContact entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new CompanyContact { Id = -entity.Id };
                db.CompanyContacts.Attach(delEntity);
                db.CompanyContacts.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.CompanyContacts.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.CompanyContacts.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.CompanyContacts.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }






        // GET: odata/CompanyContacts(5)/Company
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyContacts.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/CompanyContacts(5)/Person
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Person> GetPerson([FromODataUri] long key)
        {
            return SingleResult.Create(db.CompanyContacts.Where(m => m.Id == key).Select(m => m.Person));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CompanyContactExists(long key)
        {
            return db.CompanyContacts.Count(e => e.Id == key) > 0;
        }
    }
}
