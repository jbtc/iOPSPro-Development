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
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using WebSecurityToken.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<UserRole>("UserRoles");
    builder.EntitySet<Role>("Roles"); 
    builder.EntitySet<User>("Users"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
	[WebSecurityAuthorize]
	public class UserRolesController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/UserRoles
        [EnableQuery]
        public IQueryable<UserRole> GetUserRoles()
        {
            return db.UserRoles;
        }

        // GET: odata/UserRoles(5)
        [EnableQuery]
        public SingleResult<UserRole> GetUserRole([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserRoles.Where(userRole => userRole.Id == key));
        }

        // PUT: odata/UserRoles(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<UserRole> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRole userRole = await db.UserRoles.FindAsync(key);
            if (userRole == null)
            {
                return NotFound();
            }

            patch.Put(userRole);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRole);
        }

        // POST: odata/UserRoles
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Post(UserRole userRole)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UserRoles.Add(userRole);
            await db.SaveChangesAsync();

            return Created(userRole);
        }

        // PATCH: odata/UserRoles(5)
        [AcceptVerbs("PATCH", "MERGE")]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<UserRole> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            UserRole userRole = await db.UserRoles.FindAsync(key);
            if (userRole == null)
            {
                return NotFound();
            }

            patch.Patch(userRole);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserRoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(userRole);
        }

        // DELETE: odata/UserRoles(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            UserRole userRole = await db.UserRoles.FindAsync(key);
            if (userRole == null)
            {
                return NotFound();
            }

            db.UserRoles.Remove(userRole);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserRoles(5)/Role
        [EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public SingleResult<Role> GetRole([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserRoles.Where(m => m.Id == key).Select(m => m.Role));
        }

        // GET: odata/UserRoles(5)/User
        [EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin,WebSecurity.TechServIssues.Admin")]
		public SingleResult<User> GetUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.UserRoles.Where(m => m.Id == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserRoleExists(long key)
        {
            return db.UserRoles.Count(e => e.Id == key) > 0;
        }
    }
}
