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
    builder.EntitySet<AssetGraphic>("AssetGraphics");
    builder.EntitySet<Asset>("Assets"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetGraphicsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetGraphics
        [EnableQuery]
        public IQueryable<AssetGraphic> GetAssetGraphics()
        {
            return db.AssetGraphics;
        }

        // GET: odata/AssetGraphics(5)
        [EnableQuery]
        public SingleResult<AssetGraphic> GetAssetGraphic([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetGraphics.Where(assetGraphic => assetGraphic.Id == key));
        }

        // POST: odata/AssetGraphic

        public async Task<IHttpActionResult> Post(AssetGraphic entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AssetGraphic { Id = -entity.Id };
                db.AssetGraphics.Attach(delEntity);
                db.AssetGraphics.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AssetGraphics.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AssetGraphics.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AssetGraphics.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/AssetGraphics(5)/Asset
        [EnableQuery]
        public SingleResult<Asset> GetAsset([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetGraphics.Where(m => m.Id == key).Select(m => m.Asset));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetGraphicExists(long key)
        {
            return db.AssetGraphics.Count(e => e.Id == key) > 0;
        }
    }
}
