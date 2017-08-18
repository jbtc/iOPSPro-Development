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
    builder.EntitySet<DashboardTimeScope>("DashboardTimeScopes");
    builder.EntitySet<Dashboard>("Dashboards"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class DashboardTimeScopesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/DashboardTimeScopes
        [EnableQuery]
        public IQueryable<DashboardTimeScope> GetDashboardTimeScopes()
        {
            return db.DashboardTimeScopes;
        }

        // GET: odata/DashboardTimeScopes(5)
        [EnableQuery]
        public SingleResult<DashboardTimeScope> GetDashboardTimeScope([FromODataUri] long key)
        {
            return SingleResult.Create(db.DashboardTimeScopes.Where(dashboardTimeScope => dashboardTimeScope.Id == key));
        }

        

       

        // POST: odata/DashboardTimeScopes
        public async Task<IHttpActionResult> Post(DashboardTimeScope entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new DashboardTimeScope { Id = -entity.Id };
                db.DashboardTimeScopes.Attach(delEntity);
                db.DashboardTimeScopes.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.DashboardTimeScopes.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.DashboardTimeScopes.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.DashboardTimeScopes.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/DashboardTimeScopes(5)/Dashboards
        [EnableQuery]
        public IQueryable<Dashboard> GetDashboards([FromODataUri] long key)
        {
            return db.DashboardTimeScopes.Where(m => m.Id == key).SelectMany(m => m.Dashboards);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DashboardTimeScopeExists(long key)
        {
            return db.DashboardTimeScopes.Count(e => e.Id == key) > 0;
        }
    }
}
