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
    builder.EntitySet<SiteSourceCodeAttachment>("SiteSourceCodeAttachments");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class SiteSourceCodeAttachmentsController : ODataController
    {
        private WebSecurityEntities db = new WebSecurityEntities();

        // GET: odata/SiteSourceCodeAttachments
        [EnableQuery]
        public IQueryable<SiteSourceCodeAttachment> GetSiteSourceCodeAttachments()
        {
            return db.SiteSourceCodeAttachments;
        }

        // GET: odata/SiteSourceCodeAttachments(5)
        [EnableQuery]
        public SingleResult<SiteSourceCodeAttachment> GetSiteSourceCodeAttachment([FromODataUri] long key)
        {
            return SingleResult.Create(db.SiteSourceCodeAttachments.Where(siteSourceCodeAttachment => siteSourceCodeAttachment.Id == key));
        }

        // PUT: odata/SiteSourceCodeAttachments(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<SiteSourceCodeAttachment> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            SiteSourceCodeAttachment siteSourceCodeAttachment = await db.SiteSourceCodeAttachments.FindAsync(key);
            if (siteSourceCodeAttachment == null)
            {
                return NotFound();
            }

            patch.Put(siteSourceCodeAttachment);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteSourceCodeAttachmentExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(siteSourceCodeAttachment);
        }

        // POST: odata/SiteSourceCodeAttachments
        public async Task<IHttpActionResult> Post(SiteSourceCodeAttachment siteSourceCodeAttachment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.SiteSourceCodeAttachments.Add(siteSourceCodeAttachment);
            await db.SaveChangesAsync();

            return Created(siteSourceCodeAttachment);
        }

        // PATCH: odata/SiteSourceCodeAttachments(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<SiteSourceCodeAttachment> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            SiteSourceCodeAttachment siteSourceCodeAttachment = await db.SiteSourceCodeAttachments.FindAsync(key);
            if (siteSourceCodeAttachment == null)
            {
                return NotFound();
            }

            patch.Patch(siteSourceCodeAttachment);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteSourceCodeAttachmentExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(siteSourceCodeAttachment);
        }

        // DELETE: odata/SiteSourceCodeAttachments(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            SiteSourceCodeAttachment siteSourceCodeAttachment = await db.SiteSourceCodeAttachments.FindAsync(key);
            if (siteSourceCodeAttachment == null)
            {
                return NotFound();
            }

            db.SiteSourceCodeAttachments.Remove(siteSourceCodeAttachment);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool SiteSourceCodeAttachmentExists(long key)
        {
            return db.SiteSourceCodeAttachments.Count(e => e.Id == key) > 0;
        }
    }
}
