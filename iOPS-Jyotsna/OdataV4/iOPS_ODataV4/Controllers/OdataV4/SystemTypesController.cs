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
    builder.EntitySet<SystemType>("SystemTypes");
    builder.EntitySet<SystemGroup>("SystemGroups"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SystemTypesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/SystemTypes
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemType> GetSystemTypes()
        {
            return db.SystemTypes;
        }

        // GET: odata/SystemTypes(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<SystemType> GetSystemType([FromODataUri] long key)
        {
            return SingleResult.Create(db.SystemTypes.Where(systemType => systemType.Id == key));
        }

       
        // POST: odata/SystemTypes
        public async Task<IHttpActionResult> Post(SystemType entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new SystemType { Id = -entity.Id };
                db.SystemTypes.Attach(delEntity);
                db.SystemTypes.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.SystemTypes.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.SystemTypes.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.SystemTypes.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/SystemTypes(5)/Systems
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SystemGroup> GetSystems([FromODataUri] long key)
        {
            return db.SystemTypes.Where(m => m.Id == key).SelectMany(m => m.Systems);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SystemTypeExists(long key)
        {
            return db.SystemTypes.Count(e => e.Id == key) > 0;
        }
    }
}
