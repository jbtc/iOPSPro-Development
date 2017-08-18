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
    builder.EntitySet<Country>("Countries");
    builder.EntitySet<Person>("People"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CountriesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Countries
        [EnableQuery]
        public IQueryable<Country> GetCountries()
        {
            return db.Countries;
        }

        // GET: odata/Countries(5)
        [EnableQuery]
        public SingleResult<Country> GetCountry([FromODataUri] long key)
        {
            return SingleResult.Create(db.Countries.Where(country => country.Id == key));
        }

        
        // POST: odata/Countries
       public async Task<IHttpActionResult> Post(Country entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Country { Id = -entity.Id };
                db.Countries.Attach(delEntity);
                db.Countries.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Countries.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Countries.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Countries.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/Countries(5)/People
        [EnableQuery]
        public IQueryable<Person> GetPeople([FromODataUri] long key)
        {
            return db.Countries.Where(m => m.Id == key).SelectMany(m => m.People);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CountryExists(long key)
        {
            return db.Countries.Count(e => e.Id == key) > 0;
        }
    }
}
