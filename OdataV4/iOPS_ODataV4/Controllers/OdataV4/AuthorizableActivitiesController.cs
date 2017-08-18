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
    builder.EntitySet<AuthorizableActivity>("AuthorizableActivities");
    builder.EntitySet<UserAuthorizedActivity>("UserAuthorizedActivities"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AuthorizableActivitiesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AuthorizableActivities
        [EnableQuery]
        public IQueryable<AuthorizableActivity> GetAuthorizableActivities()
        {
            return db.AuthorizableActivities;
        }

        // GET: odata/AuthorizableActivities(5)
        [EnableQuery]
        public SingleResult<AuthorizableActivity> GetAuthorizableActivity([FromODataUri] long key)
        {
            return SingleResult.Create(db.AuthorizableActivities.Where(authorizableActivity => authorizableActivity.Id == key));
        }

        

        // POST: odata/AuthorizableActivities
        public async Task<IHttpActionResult> Post(AuthorizableActivity entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AuthorizableActivity { Id = -entity.Id };
                db.AuthorizableActivities.Attach(delEntity);
                db.AuthorizableActivities.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AuthorizableActivities.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AuthorizableActivities.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AuthorizableActivities.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }






        // GET: odata/AuthorizableActivities(5)/UserAuthorizedActivities
        [EnableQuery]
        public IQueryable<UserAuthorizedActivity> GetUserAuthorizedActivities([FromODataUri] long key)
        {
            return db.AuthorizableActivities.Where(m => m.Id == key).SelectMany(m => m.UserAuthorizedActivities);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AuthorizableActivityExists(long key)
        {
            return db.AuthorizableActivities.Count(e => e.Id == key) > 0;
        }
    }
}
