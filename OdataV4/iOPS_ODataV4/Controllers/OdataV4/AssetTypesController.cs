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
    builder.EntitySet<AssetType>("AssetTypes");
    builder.EntitySet<Asset>("Assets"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetTypesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetTypes
        [EnableQuery]
        public IQueryable<AssetType> GetAssetTypes()
        {
            return db.AssetTypes;
        }

        // GET: odata/AssetTypes(5)
        [EnableQuery]
        public SingleResult<AssetType> GetAssetType([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetTypes.Where(assetType => assetType.Id == key));
        }

       
        public async Task<IHttpActionResult> Post(AssetType entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AssetType { Id = -entity.Id };
                db.AssetTypes.Attach(delEntity);
                db.AssetTypes.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AssetTypes.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AssetTypes.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AssetTypes.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }





      

        // GET: odata/AssetTypes(5)/Assets
        [EnableQuery]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.AssetTypes.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetTypeExists(long key)
        {
            return db.AssetTypes.Count(e => e.Id == key) > 0;
        }
    }
}
