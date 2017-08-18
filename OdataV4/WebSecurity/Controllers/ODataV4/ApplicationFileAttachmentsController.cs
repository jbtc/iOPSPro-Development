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
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using WebSecurityToken.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<ApplicationFileAttachment>("ApplicationFileAttachments");
    builder.EntitySet<Application>("Applications"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ApplicationFileAttachmentsController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/ApplicationFileAttachments
        [EnableQuery]
        public IQueryable<ApplicationFileAttachment> GetApplicationFileAttachments()
        {
            return db.ApplicationFileAttachments;
        }

        // GET: odata/ApplicationFileAttachments(5)
        [EnableQuery]
        public SingleResult<ApplicationFileAttachment> GetApplicationFileAttachment([FromODataUri] long key)
        {
            return SingleResult.Create(db.ApplicationFileAttachments.Where(applicationFileAttachment => applicationFileAttachment.Id == key));
        }

        // PUT: odata/ApplicationFileAttachments(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<ApplicationFileAttachment> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationFileAttachment applicationFileAttachment = await db.ApplicationFileAttachments.FindAsync(key);
            if (applicationFileAttachment == null)
            {
                return NotFound();
            }

            patch.Put(applicationFileAttachment);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApplicationFileAttachmentExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(applicationFileAttachment);
        }

        // POST: odata/ApplicationFileAttachments
        public async Task<IHttpActionResult> Post(ApplicationFileAttachment applicationFileAttachment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ApplicationFileAttachments.Add(applicationFileAttachment);
            await db.SaveChangesAsync();

            return Created(applicationFileAttachment);
        }

        // PATCH: odata/ApplicationFileAttachments(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<ApplicationFileAttachment> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ApplicationFileAttachment applicationFileAttachment = await db.ApplicationFileAttachments.FindAsync(key);
            if (applicationFileAttachment == null)
            {
                return NotFound();
            }

            patch.Patch(applicationFileAttachment);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ApplicationFileAttachmentExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(applicationFileAttachment);
        }

        // DELETE: odata/ApplicationFileAttachments(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            ApplicationFileAttachment applicationFileAttachment = await db.ApplicationFileAttachments.FindAsync(key);
            if (applicationFileAttachment == null)
            {
                return NotFound();
            }

            db.ApplicationFileAttachments.Remove(applicationFileAttachment);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/ApplicationFileAttachments(5)/Application
        [EnableQuery]
        public SingleResult<Application> GetApplication([FromODataUri] long key)
        {
            return SingleResult.Create(db.ApplicationFileAttachments.Where(m => m.Id == key).Select(m => m.Application));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ApplicationFileAttachmentExists(long key)
        {
            return db.ApplicationFileAttachments.Count(e => e.Id == key) > 0;
        }
    }
}
