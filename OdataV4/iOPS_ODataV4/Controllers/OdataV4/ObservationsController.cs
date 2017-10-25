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
    builder.EntitySet<Observation>("Observations");
    builder.EntitySet<Tag>("Tags"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ObservationsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Observations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Observation> GetObservations()
        {
            return db.Observations;
        }

        // GET: odata/Observations(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Observation> GetObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.Observations.Where(observation => observation.Id == key));
        }

        // POST: odata/Observation
        public async Task<IHttpActionResult> Post(Observation entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Observation { Id = -entity.Id };
                db.Observations.Attach(delEntity);
                db.Observations.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Observations.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Observations.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Observations.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }
        // GET: odata/Observations(5)/Tag
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Tag> GetTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.Observations.Where(m => m.Id == key).Select(m => m.Tag));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ObservationExists(long key)
        {
            return db.Observations.Count(e => e.Id == key) > 0;
        }
    }
}
