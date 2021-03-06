﻿using System;
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
    builder.EntitySet<Dashboard>("Dashboards");
    builder.EntitySet<iOPSUser>("iOPSUsers"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class DashboardsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Dashboards
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Dashboard> GetDashboards()
        {
            return db.Dashboards;
        }

        // GET: odata/Dashboards(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Dashboard> GetDashboard([FromODataUri] long key)
        {
            return SingleResult.Create(db.Dashboards.Where(dashboard => dashboard.Id == key));
        }

       
        // POST: odata/Dashboards
        public async Task<IHttpActionResult> Post(Dashboard entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Dashboard { Id = -entity.Id };
                db.Dashboards.Attach(delEntity);
                db.Dashboards.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Dashboards.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Dashboards.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Dashboards.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/Dashboards(5)/iOPSUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.Dashboards.Where(m => m.Id == key).Select(m => m.iOPSUser));
        }
        
        
        // GET: odata/Dashboards(5)/iOPSUser
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<DashboardTimeScope> GetDashboardTimeScope([FromODataUri] long key)
        {
            return SingleResult.Create(db.Dashboards.Where(m => m.Id == key).Select(m => m.DashboardTimeScope));
        }


        // GET: odata/Dashboards(5)/DashboardWidgets
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Widget> GetWidgets([FromODataUri] long key)
        {
            return db.Dashboards.Where(m => m.Id == key).SelectMany(m => m.Widgets);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool DashboardExists(long key)
        {
            return db.Dashboards.Count(e => e.Id == key) > 0;
        }
    }
}
