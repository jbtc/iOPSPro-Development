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
    builder.EntitySet<Module>("Modules");
    builder.EntitySet<SubscriptionModule>("SubscriptionModules"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ModulesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Modules
        [EnableQuery]
        public IQueryable<Module> GetModules()
        {
            return db.Modules;
        }

        // GET: odata/Modules(5)
        [EnableQuery]
        public SingleResult<Module> GetModule([FromODataUri] long key)
        {
            return SingleResult.Create(db.Modules.Where(module => module.Id == key));
        }

        // POST: odata/Modules
        public async Task<IHttpActionResult> Post(Module entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Module { Id = -entity.Id };
                db.Modules.Attach(delEntity);
                db.Modules.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Modules.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Modules.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Modules.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }
  
        // GET: odata/Modules(5)/SubscriptionModules
        [EnableQuery]
        public IQueryable<SubscriptionModule> GetSubscriptionModules([FromODataUri] long key)
        {
            return db.Modules.Where(m => m.Id == key).SelectMany(m => m.SubscriptionModules);
        }

        // GET: odata/Modules(5)/LastModifiedUser
        [EnableQuery]
        public SingleResult<iOPSUser> GetLastModifiedUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.Modules.Where(m => m.Id == key).Select(m => m.LastModifiedUser));
        }

        // GET: odata/Modules(5)/CreatorUser
        [EnableQuery]
        public SingleResult<iOPSUser> GetCreatorUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.Modules.Where(m => m.Id == key).Select(m => m.CreatorUser));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ModuleExists(long key)
        {
            return db.Modules.Count(e => e.Id == key) > 0;
        }
    }
}
