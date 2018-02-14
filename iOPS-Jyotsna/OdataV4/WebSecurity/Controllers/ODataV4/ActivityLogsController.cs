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
    public class ActivityLogsController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        //++ GET: odata/ActivityLogs
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public IQueryable<ActivityLog> GetActivityLogs()
        {
            return db.ActivityLogs;
        }

        // GET: odata/ActivityLogs(5)
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public SingleResult<ActivityLog> GetActivityLog([FromODataUri] long key)
        {
            return SingleResult.Create(db.ActivityLogs.Where(activityLog => activityLog.Id == key));
        }

        //++ PUT: odata/ActivityLogs(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<ActivityLog> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ActivityLog activityLog = await db.ActivityLogs.FindAsync(key);
            if (activityLog == null)
            {
                return NotFound();
            }

            patch.Put(activityLog);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityLogExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(activityLog);
        }

        // POST: odata/ActivityLogs
        public async Task<IHttpActionResult> Post(ActivityLog activityLog)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ActivityLogs.Add(activityLog);
            await db.SaveChangesAsync();

            return Created(activityLog);
        }

        // PATCH: odata/ActivityLogs(5)
        [AcceptVerbs("PATCH", "MERGE")]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<ActivityLog> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ActivityLog activityLog = await db.ActivityLogs.FindAsync(key);
            if (activityLog == null)
            {
                return NotFound();
            }

            patch.Patch(activityLog);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityLogExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(activityLog);
        }

        // DELETE: odata/ActivityLogs(5)
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            ActivityLog activityLog = await db.ActivityLogs.FindAsync(key);
            if (activityLog == null)
            {
                return NotFound();
            }

            db.ActivityLogs.Remove(activityLog);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/ActivityLogs(5)/Activity
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public SingleResult<Activity> GetActivity([FromODataUri] long key)
        {
            return SingleResult.Create(db.ActivityLogs.Where(m => m.Id == key).Select(m => m.Activity));
        }

        // GET: odata/ActivityLogs(5)/Application
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public SingleResult<Application> GetApplication([FromODataUri] long key)
        {
            return SingleResult.Create(db.ActivityLogs.Where(m => m.Id == key).Select(m => m.Application));
        }

        // GET: odata/ActivityLogs(5)/User
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public SingleResult<User> GetUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.ActivityLogs.Where(m => m.Id == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ActivityLogExists(long key)
        {
            return db.ActivityLogs.Count(e => e.Id == key) > 0;
        }
    }
}
