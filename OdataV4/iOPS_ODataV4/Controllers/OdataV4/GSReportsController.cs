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
    builder.EntitySet<GSReport>("GSReports");
    builder.EntitySet<Site>("Sites"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class GSReportsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/GSReports
        [EnableQuery]
        public IQueryable<GSReport> GetGSReports()
        {
            return db.GSReports;
        }

        // GET: odata/GSReports(5)
        [EnableQuery]
        public SingleResult<GSReport> GetGSReport([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSReports.Where(gSReport => gSReport.Id == key));
        }




        // POST: odata/GSReports
        public async Task<IHttpActionResult> Post(GSReport entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new GSReport { Id = -entity.Id };
                db.GSReports.Attach(delEntity);
                db.GSReports.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.GSReports.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.GSReports.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.GSReports.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/GSReports(5)/GSReportRuns
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<GSReportRun> GetGSReportRuns([FromODataUri] long key)
        {
            return db.GSReports.Where(m => m.Id == key).SelectMany(m => m.GSReportRuns);
        }




        // GET: odata/GSReports(5)/Site
        [EnableQuery]
        public SingleResult<Site> GetSite([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSReports.Where(m => m.Id == key).Select(m => m.Site));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GSReportExists(long key)
        {
            return db.GSReports.Count(e => e.Id == key) > 0;
        }
    }
}
