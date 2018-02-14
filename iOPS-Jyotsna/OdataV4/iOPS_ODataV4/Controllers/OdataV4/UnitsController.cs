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
    builder.EntitySet<Unit>("Units");
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class UnitsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Units
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Unit> GetUnits()
        {
            return db.Units;
        }

        // GET: odata/Units(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Unit> GetUnit([FromODataUri] long key)
        {
            return SingleResult.Create(db.Units.Where(unit => unit.Id == key));
        }

        
        // POST: odata/Units
       public async Task<IHttpActionResult> Post(Unit entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Unit { Id = -entity.Id };
                db.Units.Attach(delEntity);
                db.Units.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Units.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Units.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Units.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/Units(5)/JBTStandardObservations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<JBTStandardObservation> GetJBTStandardObservations([FromODataUri] long key)
        {
            return db.Units.Where(m => m.Id == key).SelectMany(m => m.JBTStandardObservations);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UnitExists(long key)
        {
            return db.Units.Count(e => e.Id == key) > 0;
        }
    }
}
