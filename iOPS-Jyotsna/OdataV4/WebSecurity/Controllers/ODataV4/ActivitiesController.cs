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
using WebSecurityToken.Filters;
using WebSecurityToken.Models;

namespace WebSecurityToken.Controllers.ODataV4
{
	[WebSecurityAuthorize]
	[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
	public class ActivitiesController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/Activities
        [EnableQuery]
        public IQueryable<Activity> GetActivities()
        {
            return db.Activities;
        }

        // GET: odata/Activities(5)
        [EnableQuery]
        public SingleResult<Activity> GetActivity([FromODataUri] long key)
        {
            return SingleResult.Create(db.Activities.Where(activity => activity.Id == key));
        }

        // PUT: odata/Activities(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<Activity> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Activity activity = await db.Activities.FindAsync(key);
            if (activity == null)
            {
                return NotFound();
            }

            patch.Put(activity);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(activity);
        }

        // POST: odata/Activities
        public async Task<IHttpActionResult> Post(Activity activity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Activities.Add(activity);
            await db.SaveChangesAsync();

            return Created(activity);
        }

        // PATCH: odata/Activities(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<Activity> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Activity activity = await db.Activities.FindAsync(key);
            if (activity == null)
            {
                return NotFound();
            }

            patch.Patch(activity);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(activity);
        }

        // DELETE: odata/Activities(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            Activity activity = await db.Activities.FindAsync(key);
            if (activity == null)
            {
                return NotFound();
            }

            db.Activities.Remove(activity);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Activities(5)/ActivityLogs
        [EnableQuery]
        public IQueryable<ActivityLog> GetActivityLogs([FromODataUri] long key)
        {
            return db.Activities.Where(m => m.Id == key).SelectMany(m => m.ActivityLogs);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ActivityExists(long key)
        {
            return db.Activities.Count(e => e.Id == key) > 0;
        }
    }
}
