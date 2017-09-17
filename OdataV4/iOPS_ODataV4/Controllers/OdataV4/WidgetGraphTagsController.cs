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
    builder.EntitySet<WidgetGraphTag>("WidgetGraphTags");
    builder.EntitySet<Tag>("Tags"); 
    builder.EntitySet<Widget>("Widgets"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class WidgetGraphTagsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/WidgetGraphTags
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetGraphTag> GetWidgetGraphTags()
        {
            return db.WidgetGraphTags;
        }

        // GET: odata/WidgetGraphTags(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<WidgetGraphTag> GetWidgetGraphTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetGraphTags.Where(widgetGraphTag => widgetGraphTag.Id == key));
        }

        // POST: odata/AssetGraphic
        public async Task<IHttpActionResult> Post(WidgetGraphTag entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new WidgetGraphTag { Id = -entity.Id };
                db.WidgetGraphTags.Attach(delEntity);
                db.WidgetGraphTags.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.WidgetGraphTags.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.WidgetGraphTags.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.WidgetGraphTags.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/WidgetGraphTags(5)/Tag
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Tag> GetTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetGraphTags.Where(m => m.Id == key).Select(m => m.Tag));
        }

        // GET: odata/WidgetGraphTags(5)/Widget
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Widget> GetWidget([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetGraphTags.Where(m => m.Id == key).Select(m => m.Widget));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WidgetGraphTagExists(long key)
        {
            return db.WidgetGraphTags.Count(e => e.Id == key) > 0;
        }
    }
}
