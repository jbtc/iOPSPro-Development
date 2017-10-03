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
    builder.EntitySet<AssetCondition>("AssetConditions");
    builder.EntitySet<Asset>("Assets"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetConditionsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetConditions
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<AssetCondition> GetAssetConditions()
        {
            return db.AssetConditions;
        }

        // GET: odata/AssetConditions(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AssetCondition> GetAssetCondition([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetConditions.Where(assetCondition => assetCondition.Id == key));
        }

        // PUT: odata/AssetConditions(5)
        public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<AssetCondition> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AssetCondition assetCondition = await db.AssetConditions.FindAsync(key);
            if (assetCondition == null)
            {
                return NotFound();
            }

            patch.Put(assetCondition);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AssetConditionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(assetCondition);
        }

        // POST: odata/AssetConditions
        public async Task<IHttpActionResult> Post(AssetCondition assetCondition)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.AssetConditions.Add(assetCondition);
            await db.SaveChangesAsync();

            return Created(assetCondition);
        }

        // PATCH: odata/AssetConditions(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<AssetCondition> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AssetCondition assetCondition = await db.AssetConditions.FindAsync(key);
            if (assetCondition == null)
            {
                return NotFound();
            }

            patch.Patch(assetCondition);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AssetConditionExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(assetCondition);
        }

        // DELETE: odata/AssetConditions(5)
        public async Task<IHttpActionResult> Delete([FromODataUri] long key)
        {
            AssetCondition assetCondition = await db.AssetConditions.FindAsync(key);
            if (assetCondition == null)
            {
                return NotFound();
            }

            db.AssetConditions.Remove(assetCondition);
            await db.SaveChangesAsync();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET: odata/AssetConditions(5)/Assets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Asset> GetAssets([FromODataUri] long key)
        {
            return db.AssetConditions.Where(m => m.Id == key).SelectMany(m => m.Assets);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetConditionExists(long key)
        {
            return db.AssetConditions.Count(e => e.Id == key) > 0;
        }
    }
}
