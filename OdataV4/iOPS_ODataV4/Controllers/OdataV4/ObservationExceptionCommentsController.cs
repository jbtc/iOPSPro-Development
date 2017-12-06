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
    builder.EntitySet<ObservationExceptionComment>("ObservationExceptionComments");
    builder.EntitySet<ObservationException>("ObservationExceptions"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ObservationExceptionCommentsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/ObservationExceptionComments
        [EnableQuery]
        public IQueryable<ObservationExceptionComment> GetObservationExceptionComments()
        {
            return db.ObservationExceptionComments;
        }

        // GET: odata/ObservationExceptionComments(5)
        [EnableQuery]
        public SingleResult<ObservationExceptionComment> GetObservationExceptionComment([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptionComments.Where(observationExceptionComment => observationExceptionComment.Id == key));
        }

        // POST: odata/ObservationException
        public async Task<IHttpActionResult> Post(ObservationExceptionComment entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new ObservationExceptionComment { Id = -entity.Id };
                db.ObservationExceptionComments.Attach(delEntity);
                db.ObservationExceptionComments.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.ObservationExceptionComments.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.ObservationExceptionComments.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.ObservationExceptionComments.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }
        // GET: odata/ObservationExceptionComments(5)/ObservationException
        [EnableQuery]
        public SingleResult<ObservationException> GetObservationException([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptionComments.Where(m => m.Id == key).Select(m => m.ObservationException));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ObservationExceptionCommentExists(long key)
        {
            return db.ObservationExceptionComments.Count(e => e.Id == key) > 0;
        }
    }
}
