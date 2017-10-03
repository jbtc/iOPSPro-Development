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
    builder.EntitySet<UserAuthorizedActivity>("UserAuthorizedActivities");
    builder.EntitySet<AuthorizableActivity>("AuthorizableActivities"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class UserAuthorizedActivitiesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/UserAuthorizedActivities
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<UserAuthorizedActivity> GetUserAuthorizedActivities()
        {
            return db.UserAuthorizedActivities;
        }

        // GET: odata/UserAuthorizedActivities(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<UserAuthorizedActivity> GetUserAuthorizedActivity([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserAuthorizedActivities.Where(userAuthorizedActivity => userAuthorizedActivity.Id == key));
        }

        
        //+ POST: odata/UserAuthorizedActivities
        public async Task<IHttpActionResult> Post(UserAuthorizedActivity entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new UserAuthorizedActivity { Id = -entity.Id };
                db.UserAuthorizedActivities.Attach(delEntity);
                db.UserAuthorizedActivities.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.UserAuthorizedActivities.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.UserAuthorizedActivities.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.UserAuthorizedActivities.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/UserAuthorizedActivities(5)/AuthorizableActivity
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AuthorizableActivity> GetAuthorizableActivity([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserAuthorizedActivities.Where(m => m.Id == key).Select(m => m.AuthorizableActivity));
        }

        // GET: odata/UserAuthorizedActivities(5)/iOPSUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserAuthorizedActivities.Where(m => m.Id == key).Select(m => m.iOPSUser));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserAuthorizedActivityExists(long key)
        {
            return db.UserAuthorizedActivities.Count(e => e.Id == key) > 0;
        }
    }
}
