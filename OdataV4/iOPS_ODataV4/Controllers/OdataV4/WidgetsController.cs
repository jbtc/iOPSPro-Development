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
using iOPS_ODataV4.Filters;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.OdataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using iOPS_ODataV4.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Widget>("Widgets");
    builder.EntitySet<DashboardWidget>("DashboardWidgets"); 
    builder.EntitySet<WidgetType>("WidgetTypes"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class WidgetsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Widgets
        [EnableQuery]
        public IQueryable<Widget> GetWidgets()
        {
            return db.Widgets;
        }

        // GET: odata/Widgets(5)
        [EnableQuery]
        public SingleResult<Widget> GetWidget([FromODataUri] long key)
        {
            return SingleResult.Create(db.Widgets.Where(widget => widget.Id == key));
        }

        
        // POST: odata/Widgets
       public async Task<IHttpActionResult> Post(Widget entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Widget { Id = -entity.Id };
                db.Widgets.Attach(delEntity);
                db.Widgets.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Widgets.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Widgets.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Widgets.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/Widgets(5)/Dashboard
        [EnableQuery]
        public SingleResult<Dashboard> GetDashboard([FromODataUri] long key)
        {
            return SingleResult.Create(db.Widgets.Where(m => m.Id == key).Select(m => m.Dashboard));
        }

        // GET: odata/Widgets(5)/EmbeddedDashboard
        [EnableQuery]
        public SingleResult<Dashboard> GetEmbeddedDashboard([FromODataUri] long key)
        {
            return SingleResult.Create(db.Widgets.Where(m => m.Id == key).Select(m => m.EmbeddedDashboard));
        }

        // GET: odata/Widgets(5)/WidgetType
        [EnableQuery]
        public SingleResult<WidgetType> GetWidgetType([FromODataUri] long key)
        {
            return SingleResult.Create(db.Widgets.Where(m => m.Id == key).Select(m => m.WidgetType));
        }

        // GET: odata/Widgets(5)/WidgetCustomTagDisplayOrders
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetCustomTagDisplayOrder> GetWidgetCustomTagDisplayOrders([FromODataUri] long key)
        {
            return db.Widgets.Where(m => m.Id == key).SelectMany(m => m.WidgetCustomTagDisplayOrders);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WidgetExists(long key)
        {
            return db.Widgets.Count(e => e.Id == key) > 0;
        }
    }
}
