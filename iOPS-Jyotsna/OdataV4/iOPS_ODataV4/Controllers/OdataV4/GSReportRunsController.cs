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
    builder.EntitySet<GSReportRun>("GSReportRuns");
    builder.EntitySet<GSReport>("GSReports"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class GSReportRunsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/GSReportRuns
        [EnableQuery]
        public IQueryable<GSReportRun> GetGSReportRuns()
        {
            return db.GSReportRuns;
        }

        // GET: odata/GSReportRuns(5)
        [EnableQuery]
        public SingleResult<GSReportRun> GetGSReportRun([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSReportRuns.Where(gSReportRun => gSReportRun.Id == key));
        }

        // POST: odata/GSReportRuns
        public async Task<IHttpActionResult> Post(GSReportRun entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new GSReportRun { Id = -entity.Id };
                db.GSReportRuns.Attach(delEntity);
                db.GSReportRuns.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.GSReportRuns.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.GSReportRuns.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }
            modifiedEntity = db.GSReportRuns.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }



        // GET: odata/GSReportRuns(5)/GSReport
        [EnableQuery]
        public SingleResult<GSReport> GetGSReport([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSReportRuns.Where(m => m.Id == key).Select(m => m.GSReport));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GSReportRunExists(long key)
        {
            return db.GSReportRuns.Count(e => e.Id == key) > 0;
        }
    }
}
