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
    builder.EntitySet<SystemGroup>("SystemGroups"); 
    builder.EntitySet<SystemGraphic>("SystemGraphics");
    builder.EntitySet<SystemGraphicVisibleValue>("SystemGraphicVisibleValues"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SystemGraphicsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/SystemGraphics
        [EnableQuery]
        public IQueryable<SystemGraphic> GetSystemGraphics()
        {
            return db.SystemGraphics;
        }

        // GET: odata/SystemGraphics(5)
        [EnableQuery]
        public SingleResult<SystemGraphic> GetSystemGraphic([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGraphics.Where(systemGraphic => systemGraphic.Id == key));
        }

        // POST: odata/SystemGraphics
        public async Task<IHttpActionResult> Post(SystemGraphic entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new SystemGraphic { Id = -entity.Id };
                db.SystemGraphics.Attach(delEntity);
                db.SystemGraphics.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.SystemGraphics.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.SystemGraphics.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.SystemGraphics.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/SystemGraphics(5)/System
        [EnableQuery]
        public SingleResult<SystemGroup> GetSystem([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemGraphics.Where(m => m.Id == key).Select(m => m.System));
        }

        // GET: odata/SystemGraphics(5)/SystemGraphicVisibleValues
        [EnableQuery]
        public IQueryable<SystemGraphicVisibleValue> GetSystemGraphicVisibleValues([FromODataUri] long key)
        {
            return db.SystemGraphics.Where(m => m.Id == key).SelectMany(m => m.SystemGraphicVisibleValues);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SystemGraphicExists(long key)
        {
            return db.SystemGraphics.Count(e => e.Id == key) > 0;
        }
    }
}
