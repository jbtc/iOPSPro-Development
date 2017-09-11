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
    builder.EntitySet<AssetModel>("AssetModels");
    builder.EntitySet<Asset>("Assets"); 
    builder.EntitySet<AssetModelImage>("AssetModelImages"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetModelsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetModels
        [EnableQuery]
        public IQueryable<AssetModel> GetAssetModels()
        {
            return db.AssetModels;
        }

        // GET: odata/AssetModels(5)
        [EnableQuery]
        public SingleResult<AssetModel> GetAssetModel([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetModels.Where(assetModel => assetModel.Id == key));
        }


        // POST: odata/AssetModel

        public async Task<IHttpActionResult> Post(AssetModel entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AssetModel { Id = -entity.Id };
                db.AssetModels.Attach(delEntity);
                db.AssetModels.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AssetModels.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AssetModels.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AssetModels.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/AssetModels(5)/Assets
        [EnableQuery]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.AssetModels.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        // GET: odata/AssetModels(5)/AssetModelImages
        [EnableQuery]
        public IQueryable<AssetModelImage> GetAssetModelImages([FromODataUri] long key)
        {
            return db.AssetModels.Where(m => m.Id == key).SelectMany(m => m.AssetModelImages);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetModelExists(long key)
        {
            return db.AssetModels.Count(e => e.Id == key) > 0;
        }
    }
}
