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
using WebSecurityToken.Models;

namespace WebSecurityToken.Controllers.ODataV4
{
    public class ExternalUsersController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/ExternalUsers
        [EnableQuery]
        public IQueryable<ExternalUser> GetExternalUsers()
        {
            return db.ExternalUsers;
        }

        // GET: odata/ExternalUsers(5)
        [EnableQuery]
        public SingleResult<ExternalUser> GetExternalUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.ExternalUsers.Where(externalUser => externalUser.UserMasterId == key));
        }

        // PUT: odata/ExternalUsers(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<ExternalUser> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ExternalUser externalUser = await db.ExternalUsers.FindAsync(key);
            if (externalUser == null)
            {
                return NotFound();
            }

            patch.Put(externalUser);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExternalUserExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(externalUser);
        }

        // POST: odata/ExternalUsers
        public async Task<IHttpActionResult> Post(ExternalUser externalUser)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ExternalUsers.Add(externalUser);
            await db.SaveChangesAsync();

            return Created(externalUser);
        }

        // PATCH: odata/ExternalUsers(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<ExternalUser> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ExternalUser externalUser = await db.ExternalUsers.FindAsync(key);
            if (externalUser == null)
            {
                return NotFound();
            }

            patch.Patch(externalUser);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExternalUserExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(externalUser);
        }

        // DELETE: odata/ExternalUsers(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            ExternalUser externalUser = await db.ExternalUsers.FindAsync(key);
            if (externalUser == null)
            {
                return NotFound();
            }

            db.ExternalUsers.Remove(externalUser);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/ExternalUsers(5)/User
        [EnableQuery]
        public SingleResult<User> GetUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.ExternalUsers.Where(m => m.UserMasterId == key).Select(m => m.User));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ExternalUserExists(long key)
        {
            return db.ExternalUsers.Count(e => e.UserMasterId == key) > 0;
        }
    }
}
