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
using System.Web.Security;
using WebSecurityToken.Filters;
using WebSecurityToken.Models;

namespace WebSecurityToken.Controllers.ODataV4
{
    [WebSecurityAuthorize]
	public class ApplicationsController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/Applications
        [EnableQuery]
		public IQueryable<Application> GetApplications()
        {
            return db.Applications;
        }

        // GET: odata/Applications(5)
        [EnableQuery]
		public SingleResult<Application> GetApplication([FromODataUri] int key)
        {
            return SingleResult.Create(db.Applications.Where(application => application.Id == key));
        }

        // PUT: odata/Applications(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Application> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Application application = await db.Applications.FindAsync(key);
            if (application == null)
            {
                return NotFound();
            }

            patch.Put(application);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApplicationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(application);
        }

        // POST: odata/Applications
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Post(Application application)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Applications.Add(application);
            await db.SaveChangesAsync();

            return Created(application);
        }

        // PATCH: odata/Applications(5)
        [AcceptVerbs("PATCH", "MERGE")]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Application> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Application application = await db.Applications.FindAsync(key);
            if (application == null)
            {
                return NotFound();
            }

            patch.Patch(application);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApplicationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(application);
        }

        // DELETE: odata/Applications(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Application application = await db.Applications.FindAsync(key);
            if (application == null)
            {
                return NotFound();
            }

            db.Applications.Remove(application);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/Applications(5)/ActivityLogs
        [EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public IQueryable<ActivityLog> GetActivityLogs([FromODataUri] int key)
        {
            return db.Applications.Where(m => m.Id == key).SelectMany(m => m.ActivityLogs);
        }

		// GET: odata/Applications(5)/Roles
		[EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public IQueryable<Role> GetRoles([FromODataUri] int key)
		{
			return db.Applications.Where(m => m.Id == key).SelectMany(m => m.Roles);
		}

		// GET: odata/Applications(5)/ApplicationFileAttachments
		[EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins")]
		public IQueryable<ApplicationFileAttachment> GetApplicationFileAttachments([FromODataUri] int key)
		{
			return db.Applications.Where(m => m.Id == key).SelectMany(m => m.ApplicationFileAttachments);
		}

		protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ApplicationExists(int key)
        {
            return db.Applications.Count(e => e.Id == key) > 0;
        }
    }
}
