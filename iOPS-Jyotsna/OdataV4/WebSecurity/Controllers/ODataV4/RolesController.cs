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
    builder.EntitySet<Role>("Roles");
    builder.EntitySet<User>("Users"); 
    builder.EntitySet<Application>("Applications"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
	[WebSecurityAuthorize]
    public class RolesController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/Roles
        [EnableQuery]
        public IQueryable<Role> GetRoles()
        {
            return db.Roles;
        }

        // GET: odata/Roles(5)
        [EnableQuery]
        public SingleResult<Role> GetRole([FromODataUri] int key)
        {
            return SingleResult.Create(db.Roles.Where(role => role.Id == key));
        }

        // PUT: odata/Roles(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public async Task<IHttpActionResult> Put([FromODataUri] int key, Delta<Role> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Role role = await db.Roles.FindAsync(key);
            if (role == null)
            {
                return NotFound();
            }

            patch.Put(role);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(role);
        }

        // POST: odata/Roles
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public async Task<IHttpActionResult> Post(Role role)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Roles.Add(role);
            await db.SaveChangesAsync();

            return Created(role);
        }

        // PATCH: odata/Roles(5)
        [AcceptVerbs("PATCH", "MERGE")]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Role> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Role role = await db.Roles.FindAsync(key);
            if (role == null)
            {
                return NotFound();
            }

            patch.Patch(role);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(role);
        }

        // DELETE: odata/Roles(5)
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            Role role = await db.Roles.FindAsync(key);
            if (role == null)
            {
                return NotFound();
            }

            db.Roles.Remove(role);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/UserRoles(5)/Users
        [EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public IQueryable<UserRole> GetUserRoles([FromODataUri] int key)
        {
            return db.Roles.Where(m => m.Id == key).SelectMany(m => m.UserRoles);
        }

        // GET: odata/Roles(5)/Application
        [EnableQuery]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin")]
		public SingleResult<Application> GetApplication([FromODataUri] int key)
        {
            return SingleResult.Create(db.Roles.Where(m => m.Id == key).Select(m => m.Application));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RoleExists(int key)
        {
            return db.Roles.Count(e => e.Id == key) > 0;
        }
    }
}
