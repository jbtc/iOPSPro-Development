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
using FileImageLibrary.Models;

namespace FileImageLibrary.Controllers.ODataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using FileImageLibrary.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<FileImage>("FileImages");
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class FileImagesController : ODataController
    {
        private FileImageLibraryEntities db = new FileImageLibraryEntities();


        // PUT: odata/FileImages(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<FileImage> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            FileImage fileImage = await db.FileImages.FindAsync(key);
            if (fileImage == null)
            {
                return NotFound();
            }

            patch.Put(fileImage);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FileImageExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(fileImage);
        }

        // POST: odata/FileImages
        public async Task<IHttpActionResult> Post(FileImage fileImage)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.FileImages.Add(fileImage);
            await db.SaveChangesAsync();

            return Created(fileImage);
        }

        // PATCH: odata/FileImages(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<FileImage> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            FileImage fileImage = await db.FileImages.FindAsync(key);
            if (fileImage == null)
            {
                return NotFound();
            }

            patch.Patch(fileImage);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FileImageExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(fileImage);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FileImageExists(long key)
        {
            return db.FileImages.Count(e => e.intFIL_Seq_Num == key) > 0;
        }
    }
}
