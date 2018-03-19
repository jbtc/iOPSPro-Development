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
    builder.EntitySet<WidgetType>("WidgetTypes");
    builder.EntitySet<Widget>("Widgets"); 
    builder.EntitySet<WidgetTypeTabGroup>("WidgetTypeTabGroups"); 
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class WidgetTypesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/WidgetTypes
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetType> GetWidgetTypes()
        {
            return db.WidgetTypes;
        }

        // GET: odata/WidgetTypes(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<WidgetType> GetWidgetType([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetTypes.Where(widgetType => widgetType.Id == key));
        }

        // POST: odata/WidgetTypes
        public async Task<IHttpActionResult> Post(WidgetType entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new WidgetType { Id = -entity.Id };
                db.WidgetTypes.Attach(delEntity);
                db.WidgetTypes.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.WidgetTypes.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.WidgetTypes.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Created(entity);

            }
            modifiedEntity = db.WidgetTypes.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/WidgetTypes(5)/Widgets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Widget> GetWidgets([FromODataUri] long key)
        {
            return db.WidgetTypes.Where(m => m.Id == key).SelectMany(m => m.Widgets);
        }

        // GET: odata/WidgetTypes(5)/WidgetTypeTabGroup
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<WidgetTypeTabGroup> GetWidgetTypeTabGroup([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetTypes.Where(m => m.Id == key).Select(m => m.WidgetTypeTabGroup));
        }

        // GET: odata/WidgetTypes(5)/CreatorUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetCreatorUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetTypes.Where(m => m.Id == key).Select(m => m.CreatorUser));
        }

        // GET: odata/WidgetTypes(5)/LastModifiedUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetLastModifiedUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.WidgetTypes.Where(m => m.Id == key).Select(m => m.LastModifiedUser));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool WidgetTypeExists(long key)
        {
            return db.WidgetTypes.Count(e => e.Id == key) > 0;
        }
    }
}
