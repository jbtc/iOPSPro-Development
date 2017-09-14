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
    builder.EntitySet<WidgetCustomTagDisplayOrder>("WidgetCustomTagDisplayOrders");
    builder.EntitySet<Widget>("Widgets"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class WidgetCustomTagDisplayOrdersController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/WidgetCustomTagDisplayOrders
        [EnableQuery]
        public IQueryable<WidgetCustomTagDisplayOrder> GetWidgetCustomTagDisplayOrders()
        {
            return db.WidgetCustomTagDisplayOrders;
        }

        // GET: odata/WidgetCustomTagDisplayOrders(5)
        [EnableQuery]
        public SingleResult<WidgetCustomTagDisplayOrder> GetWidgetCustomTagDisplayOrder([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetCustomTagDisplayOrders.Where(widgetCustomTagDisplayOrder => widgetCustomTagDisplayOrder.Id == key));
        }

        // POST: odata/WidgetCustomTagDisplayOrder
        public async Task<IHttpActionResult> Post(WidgetCustomTagDisplayOrder entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new WidgetCustomTagDisplayOrder { Id = -entity.Id };
                db.WidgetCustomTagDisplayOrders.Attach(delEntity);
                db.WidgetCustomTagDisplayOrders.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.WidgetCustomTagDisplayOrders.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.WidgetCustomTagDisplayOrders.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.WidgetCustomTagDisplayOrders.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/WidgetCustomTagDisplayOrders(5)/Widget
        [EnableQuery]
        public SingleResult<Widget> GetWidget([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetCustomTagDisplayOrders.Where(m => m.Id == key).Select(m => m.Widget));
        }

        // GET: odata/WidgetCustomTagDisplayOrders(5)/iOPSUser
        [EnableQuery]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetCustomTagDisplayOrders.Where(m => m.Id == key).Select(m => m.iOPSUser));
        }

        // GET: odata/WidgetCustomTagDisplayOrders(5)/JBTStandardObservation
        [EnableQuery]
        public SingleResult<JBTStandardObservation> GetJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetCustomTagDisplayOrders.Where(m => m.Id == key).Select(m => m.JBTStandardObservation));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WidgetCustomTagDisplayOrderExists(long key)
        {
            return db.WidgetCustomTagDisplayOrders.Count(e => e.Id == key) > 0;
        }
    }
}
