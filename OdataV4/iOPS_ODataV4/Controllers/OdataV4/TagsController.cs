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
    builder.EntitySet<Tag>("Tags");
    builder.EntitySet<Asset>("Assets"); 
    builder.EntitySet<Observation>("Observations"); 
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class TagsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Tags
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public IQueryable<Tag> GetTags()
        {
            return db.Tags;
        }

        // GET: odata/Tags(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Tag> GetTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.Tags.Where(tag => tag.Id == key));
        }

       
        // POST: odata/Tags
        public async Task<IHttpActionResult> Post(Tag entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Tag { Id = -entity.Id };
                db.Tags.Attach(delEntity);
                db.Tags.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Tags.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Tags.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Tags.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/Tags(5)/LastObservation
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Observation> GetLastObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.Tags.Where(m => m.Id == key).Select(m => m.LastObservation));
        }

        // GET: odata/Tags(5)/Asset
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Asset> GetAsset([FromODataUri] long key)
        {
            return SingleResult.Create(db.Tags.Where(m => m.Id == key).Select(m => m.Asset));
        }

        // GET: odata/Tags(5)/Observations
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Observation> GetObservations([FromODataUri] long key)
        {
            return db.Tags.Where(m => m.Id == key).SelectMany(m => m.Observations);
        }


        // GET: odata/Tags(5)/ObservationAggregatedHighChartValues
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<ObservationAggregatedHighChartValue> GetObservationAggregatedHighChartValues([FromODataUri] long key)
        {
            return db.Tags.Where(m => m.Id == key).SelectMany(m => m.ObservationAggregatedHighChartValues);
        }


        // GET: odata/Tags(5)/WidgetGraphTags
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetGraphTag> GetWidgetGraphTags([FromODataUri] long key)
        {
            return db.Tags.Where(m => m.Id == key).SelectMany(m => m.WidgetGraphTags);
        }

        // GET: odata/Tags(5)/JBTStandardObservation
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<JBTStandardObservation> GetJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.Tags.Where(m => m.Id == key).Select(m => m.JBTStandardObservation));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TagExists(long key)
        {
            return db.Tags.Count(e => e.Id == key) > 0;
        }
    }
}
