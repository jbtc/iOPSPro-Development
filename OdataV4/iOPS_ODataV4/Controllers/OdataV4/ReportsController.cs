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
    builder.EntitySet<Report>("Reports");
    builder.EntitySet<ReportRun>("ReportRuns"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ReportsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/Reports
        [EnableQuery]
        public IQueryable<Report> GetReports()
        {
            return db.Reports;
        }

        // GET: odata/Reports(5)
        [EnableQuery]
        public SingleResult<Report> GetReport([FromODataUri] long key)
        {
            return SingleResult.Create(db.Reports.Where(report => report.Id == key));
        }

        public async Task<IHttpActionResult> Post(Report entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new Report { Id = -entity.Id };
                db.Reports.Attach(delEntity);
                db.Reports.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.Reports.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.Reports.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.Reports.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        public IQueryable<ReportRun> GetReportRuns([FromODataUri] long key)
        {
            return db.Reports.Where(m => m.Id == key).SelectMany(m => m.ReportRuns);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ReportExists(long key)
        {
            return db.Reports.Count(e => e.Id == key) > 0;
        }
    }
}
