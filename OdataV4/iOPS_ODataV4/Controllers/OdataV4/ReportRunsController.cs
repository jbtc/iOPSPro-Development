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
    builder.EntitySet<ReportRun>("ReportRuns");
    builder.EntitySet<Report>("Reports"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ReportRunsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/ReportRuns
        [EnableQuery]
        public IQueryable<ReportRun> GetReportRuns()
        {
            return db.ReportRuns;
        }

        // GET: odata/ReportRuns(5)
        [EnableQuery]
        public SingleResult<ReportRun> GetReportRun([FromODataUri] long key)
        {
            return SingleResult.Create(db.ReportRuns.Where(reportRun => reportRun.Id == key));
        }

        public async Task<IHttpActionResult> Post(ReportRun entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new ReportRun { Id = -entity.Id };
                db.ReportRuns.Attach(delEntity);
                db.ReportRuns.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.ReportRuns.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.ReportRuns.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.ReportRuns.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/ReportRuns(5)/Report
        [EnableQuery]
        public SingleResult<Report> GetReport([FromODataUri] long key)
        {
            return SingleResult.Create(db.ReportRuns.Where(m => m.Id == key).Select(m => m.Report));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ReportRunExists(long key)
        {
            return db.ReportRuns.Count(e => e.Id == key) > 0;
        }
    }
}
