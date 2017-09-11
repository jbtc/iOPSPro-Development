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
    builder.EntitySet<AssetModelImage>("AssetModelImages");
    builder.EntitySet<AssetModel>("AssetModels"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetModelImagesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetModelImages
        [EnableQuery]
        public IQueryable<AssetModelImage> GetAssetModelImages()
        {
            return db.AssetModelImages;
        }

        // GET: odata/AssetModelImages(5)
        [EnableQuery]
        public SingleResult<AssetModelImage> GetAssetModelImage([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetModelImages.Where(assetModelImage => assetModelImage.Id == key));
        }

        // POST: odata/AssetModelImage

        public async Task<IHttpActionResult> Post(AssetModelImage entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AssetModelImage { Id = -entity.Id };
                db.AssetModelImages.Attach(delEntity);
                db.AssetModelImages.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AssetModelImages.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AssetModelImages.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AssetModelImages.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/AssetModelImages(5)/AssetModel
        [EnableQuery]
        public SingleResult<AssetModel> GetAssetModel([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetModelImages.Where(m => m.Id == key).Select(m => m.AssetModel));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetModelImageExists(long key)
        {
            return db.AssetModelImages.Count(e => e.Id == key) > 0;
        }
    }
}
