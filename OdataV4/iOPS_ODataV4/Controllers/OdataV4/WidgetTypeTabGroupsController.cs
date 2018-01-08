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
    builder.EntitySet<WidgetTypeTabGroup>("WidgetTypeTabGroups");
    builder.EntitySet<WidgetType>("WidgetTypes"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class WidgetTypeTabGroupsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/WidgetTypeTabGroups
        [EnableQuery]
        public IQueryable<WidgetTypeTabGroup> GetWidgetTypeTabGroups()
        {
            return db.WidgetTypeTabGroups;
        }

        // GET: odata/WidgetTypeTabGroups(5)
        [EnableQuery]
        public SingleResult<WidgetTypeTabGroup> GetWidgetTypeTabGroup([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetTypeTabGroups.Where(widgetTypeTabGroup => widgetTypeTabGroup.Id == key));
        }

        // POST: odata/WidgetTypeTabGroups
        public async Task<IHttpActionResult> Post(WidgetTypeTabGroup entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new WidgetTypeTabGroup { Id = -entity.Id };
                db.WidgetTypeTabGroups.Attach(delEntity);
                db.WidgetTypeTabGroups.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.WidgetTypeTabGroups.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.WidgetTypeTabGroups.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Created(entity);

            }
            modifiedEntity = db.WidgetTypeTabGroups.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }
        // GET: odata/WidgetTypeTabGroups(5)/WidgetTypes
        [EnableQuery]
        public IQueryable<WidgetType> GetWidgetTypes([FromODataUri] long key)
        {
            return db.WidgetTypeTabGroups.Where(m => m.Id == key).SelectMany(m => m.WidgetTypes);
        }




        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WidgetTypeTabGroupExists(long key)
        {
            return db.WidgetTypeTabGroups.Count(e => e.Id == key) > 0;
        }
    }
}
