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
    builder.EntitySet<CustomJBTStandardObservation>("CustomJBTStandardObservations");
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class CustomJBTStandardObservationsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/CustomJBTStandardObservations
        [EnableQuery]
        public IQueryable<CustomJBTStandardObservation> GetCustomJBTStandardObservations()
        {
            return db.CustomJBTStandardObservations;
        }

        // GET: odata/CustomJBTStandardObservations(5)
        [EnableQuery]
        public SingleResult<CustomJBTStandardObservation> GetCustomJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.CustomJBTStandardObservations.Where(customJBTStandardObservation => customJBTStandardObservation.Id == key));
        }

        
        // POST: odata/CustomJBTStandardObservations
       public async Task<IHttpActionResult> Post(CustomJBTStandardObservation entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new CustomJBTStandardObservation { Id = -entity.Id };
                db.CustomJBTStandardObservations.Attach(delEntity);
                db.CustomJBTStandardObservations.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.CustomJBTStandardObservations.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.CustomJBTStandardObservations.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.CustomJBTStandardObservations.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/CustomJBTStandardObservations(5)/Company
        [EnableQuery]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.CustomJBTStandardObservations.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/CustomJBTStandardObservations(5)/JBTStandardObservation
        [EnableQuery]
        public SingleResult<JBTStandardObservation> GetJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.CustomJBTStandardObservations.Where(m => m.Id == key).Select(m => m.JBTStandardObservation));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool CustomJBTStandardObservationExists(long key)
        {
            return db.CustomJBTStandardObservations.Count(e => e.Id == key) > 0;
        }
    }
}
