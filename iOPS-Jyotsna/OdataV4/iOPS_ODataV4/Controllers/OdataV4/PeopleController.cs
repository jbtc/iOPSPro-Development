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
    builder.EntitySet<Person>("People");
    builder.EntitySet<Country>("Countries"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    builder.EntitySet<CompanyContact>("CompanyContacts"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class PeopleController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/People
        [EnableQuery(MaxExpansionDepth=100)]
        public IQueryable<Person> GetPeople()
        {
            return db.People;
        }

        // GET: odata/People(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Person> GetPerson([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(person => person.Id == key));
        }

       
        // POST: odata/People
        public async Task<IHttpActionResult> Post(Person entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Person { Id = -entity.Id };
                db.People.Attach(delEntity);
                db.People.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.People.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.People.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.People.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/People(5)/Country
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Country> GetCountry([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Country));
        }

        // GET: odata/People(5)/iOPSUsers
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<iOPSUser> GetiOPSUsers([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.iOPSUsers);
        }

        // GET: odata/People(5)/Subordinates
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Person> GetSubordinates([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.Subordinates);
        }

        // GET: odata/People(5)/Supervisor
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Person> GetSupervisor([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Supervisor));
        }

        // GET: odata/People(5)/CompanyContacts
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CompanyContact> GetCompanyContacts([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.CompanyContacts);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PersonExists(long key)
        {
            return db.People.Count(e => e.Id == key) > 0;
        }
    }
}
