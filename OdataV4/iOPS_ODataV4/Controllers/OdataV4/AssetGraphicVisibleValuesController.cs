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
    builder.EntitySet<AssetGraphicVisibleValue>("AssetGraphicVisibleValues");
    builder.EntitySet<AssetGraphic>("AssetGraphics"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class AssetGraphicVisibleValuesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/AssetGraphicVisibleValues
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<AssetGraphicVisibleValue> GetAssetGraphicVisibleValues()
        {
            return db.AssetGraphicVisibleValues;
        }

        // GET: odata/AssetGraphicVisibleValues(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AssetGraphicVisibleValue> GetAssetGraphicVisibleValue([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetGraphicVisibleValues.Where(assetGraphicVisibleValue => assetGraphicVisibleValue.Id == key));
        }

        // POST: odata/AssetGraphicVisibleValue
        public async Task<IHttpActionResult> Post(AssetGraphicVisibleValue entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new AssetGraphicVisibleValue { Id = -entity.Id };
                db.AssetGraphicVisibleValues.Attach(delEntity);
                db.AssetGraphicVisibleValues.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.AssetGraphicVisibleValues.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.AssetGraphicVisibleValues.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.AssetGraphicVisibleValues.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/AssetGraphicVisibleValues(5)/AssetGraphic
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<AssetGraphic> GetAssetGraphic([FromODataUri] long key)
        {
            return SingleResult.Create(db.AssetGraphicVisibleValues.Where(m => m.Id == key).Select(m => m.AssetGraphic));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool AssetGraphicVisibleValueExists(long key)
        {
            return db.AssetGraphicVisibleValues.Count(e => e.Id == key) > 0;
        }
    }
}
