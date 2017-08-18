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
    builder.EntitySet<DatabaseMailQueue>("DatabaseMailQueues");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class DatabaseMailQueuesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/DatabaseMailQueues
        [EnableQuery]
        public IQueryable<DatabaseMailQueue> GetDatabaseMailQueues()
        {
            return db.DatabaseMailQueues;
        }

        // GET: odata/DatabaseMailQueues(5)
        [EnableQuery]
        public SingleResult<DatabaseMailQueue> GetDatabaseMailQueue([FromODataUri] long key)
        {
            return SingleResult.Create(db.DatabaseMailQueues.Where(databaseMailQueue => databaseMailQueue.Id == key));
        }

       
        // POST: odata/DatabaseMailQueues
        public async Task<IHttpActionResult> Post(DatabaseMailQueue entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new DatabaseMailQueue { Id = -entity.Id };
                db.DatabaseMailQueues.Attach(delEntity);
                db.DatabaseMailQueues.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.DatabaseMailQueues.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.DatabaseMailQueues.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.DatabaseMailQueues.Add(entity);

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

        private bool DatabaseMailQueueExists(long key)
        {
            return db.DatabaseMailQueues.Count(e => e.Id == key) > 0;
        }
    }
}
