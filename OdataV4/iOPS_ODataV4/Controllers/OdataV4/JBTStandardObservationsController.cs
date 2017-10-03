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
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations");
    builder.EntitySet<CustomJBTStandardObservation>("CustomJBTStandardObservations"); 
    builder.EntitySet<Unit>("Units"); 
    builder.EntitySet<Tag>("Tags"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class JBTStandardObservationsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/JBTStandardObservations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<JBTStandardObservation> GetJBTStandardObservations()
        {
            return db.JBTStandardObservations;
        }

        // GET: odata/JBTStandardObservations(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<JBTStandardObservation> GetJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.JBTStandardObservations.Where(jBTStandardObservation => jBTStandardObservation.Id == key));
        }

        
        // POST: odata/JBTStandardObservations
        public async Task<IHttpActionResult> Post(JBTStandardObservation entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new JBTStandardObservation { Id = -entity.Id };
                db.JBTStandardObservations.Attach(delEntity);
                db.JBTStandardObservations.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.JBTStandardObservations.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.JBTStandardObservations.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.JBTStandardObservations.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/JBTStandardObservations(5)/CustomJBTStandardObservations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<CustomJBTStandardObservation> GetCustomJBTStandardObservations([FromODataUri] long key)
        {
            return db.JBTStandardObservations.Where(m => m.Id == key).SelectMany(m => m.CustomJBTStandardObservations);
        }

        // GET: odata/JBTStandardObservations(5)/WidgetCustomTagDisplayOrders
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetCustomTagDisplayOrder> GetWidgetCustomTagDisplayOrders([FromODataUri] long key)
        {
            return db.JBTStandardObservations.Where(m => m.Id == key).SelectMany(m => m.WidgetCustomTagDisplayOrders);
        }

        // GET: odata/JBTStandardObservations(5)/Unit
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Unit> GetUnit([FromODataUri] long key)
        {
            return SingleResult.Create(db.JBTStandardObservations.Where(m => m.Id == key).Select(m => m.Unit));
        }

        // GET: odata/JBTStandardObservations(5)/Tags
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Tag> GetTags([FromODataUri] long key)
        {
            return db.JBTStandardObservations.Where(m => m.Id == key).SelectMany(m => m.Tags);
        }

        // GET: odata/JBTStandardObservations(5)/SystemGraphicVisibleValues
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGraphicVisibleValue> GetSystemGraphicVisibleValues([FromODataUri] long key)
        {
            return db.JBTStandardObservations.Where(m => m.Id == key).SelectMany(m => m.SystemGraphicVisibleValues);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool JBTStandardObservationExists(long key)
        {
            return db.JBTStandardObservations.Count(e => e.Id == key) > 0;
        }
    }
}
