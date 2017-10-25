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
    builder.EntitySet<ChronologicalRawTagValueLogKepwareReceiver>("ChronologicalRawTagValueLogKepwareReceivers");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ChronologicalRawTagValueLogKepwareReceiversController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/ChronologicalRawTagValueLogKepwareReceivers
        [EnableQuery]
        public IQueryable<ChronologicalRawTagValueLogKepwareReceiver> GetChronologicalRawTagValueLogKepwareReceivers()
        {
            return db.ChronologicalRawTagValueLogKepwareReceivers;
        }

        // GET: odata/ChronologicalRawTagValueLogKepwareReceivers(5)
        [EnableQuery]
        public SingleResult<ChronologicalRawTagValueLogKepwareReceiver> GetChronologicalRawTagValueLogKepwareReceiver([FromODataUri] long key)
        {
            return SingleResult.Create(db.ChronologicalRawTagValueLogKepwareReceivers.Where(chronologicalRawTagValueLogKepwareReceiver => chronologicalRawTagValueLogKepwareReceiver.Id == key));
        }

        // POST: odata
        public async Task<IHttpActionResult> Post(ChronologicalRawTagValueLogKepwareReceiver entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new ChronologicalRawTagValueLogKepwareReceiver { Id = -entity.Id };
                db.ChronologicalRawTagValueLogKepwareReceivers.Attach(delEntity);
                db.ChronologicalRawTagValueLogKepwareReceivers.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.ChronologicalRawTagValueLogKepwareReceivers.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.ChronologicalRawTagValueLogKepwareReceivers.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.ChronologicalRawTagValueLogKepwareReceivers.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ChronologicalRawTagValueLogKepwareReceiverExists(long key)
        {
            return db.ChronologicalRawTagValueLogKepwareReceivers.Count(e => e.Id == key) > 0;
        }
    }
}
