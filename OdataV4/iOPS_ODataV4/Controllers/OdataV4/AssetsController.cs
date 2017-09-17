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
    builder.EntitySet<Asset>("Assets");
    builder.EntitySet<Company>("Companies"); 
    builder.EntitySet<Site>("Sites"); 
    builder.EntitySet<AssetType>("AssetTypes"); 
    builder.EntitySet<AssetCondition>("AssetConditions"); 
    builder.EntitySet<Tag>("Tags"); 
    builder.EntitySet<SystemGroup>("SystemGroups"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Assets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Asset> GetAssets()
        {
            return db.Assets;
        }

        // GET: odata/Assets(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Asset> GetAsset([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(asset => asset.Id == key));
        }

       

        // POST: odata/Assets
        public async Task<IHttpActionResult> Post(Asset entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Asset { Id = -entity.Id };
                db.Assets.Attach(delEntity);
                db.Assets.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Assets.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Assets.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Assets.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/Assets(5)/Company
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Company> GetCompany([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(m => m.Id == key).Select(m => m.Company));
        }

        // GET: odata/Assets(5)/Site
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(m => m.Id == key).Select(m => m.Site));
        }

        // GET: odata/Assets(5)/AssetType
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AssetType> GetAssetType([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(m => m.Id == key).Select(m => m.AssetType));
        }

        // GET: odata/Assets(5)/AssetCondition
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AssetCondition> GetAssetCondition([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(m => m.Id == key).Select(m => m.AssetCondition));
        }

        // GET: odata/Assets(5)/Tags
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Tag> GetTags([FromODataUri] long key)
        {
            return db.Assets.Where(m => m.Id == key).SelectMany(m => m.Tags);
        }

        // GET: odata/Assets(5)/AssetGraphics
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<AssetGraphic> GetAssetGraphics([FromODataUri] long key)
        {
            return db.Assets.Where(m => m.Id == key).SelectMany(m => m.AssetGraphics);
        }

        // GET: odata/Assets(5)/System
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<SystemGroup> GetSystem([FromODataUri] long key)
        {
            return SingleResult.Create(db.Assets.Where(m => m.Id == key).Select(m => m.System));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetExists(long key)
        {
            return db.Assets.Count(e => e.Id == key) > 0;
        }
    }
}
