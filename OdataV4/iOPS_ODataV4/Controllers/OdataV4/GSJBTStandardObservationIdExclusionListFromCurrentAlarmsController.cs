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
    builder.EntitySet<GSJBTStandardObservationIdExclusionListFromCurrentAlarm>("GSJBTStandardObservationIdExclusionListFromCurrentAlarms");
    builder.EntitySet<JBTStandardObservation>("JBTStandardObservations"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class GSJBTStandardObservationIdExclusionListFromCurrentAlarmsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/GSJBTStandardObservationIdExclusionListFromCurrentAlarms
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<GSJBTStandardObservationIdExclusionListFromCurrentAlarm> GetGSJBTStandardObservationIdExclusionListFromCurrentAlarms()
        {
            return db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms;
        }

        // GET: odata/GSJBTStandardObservationIdExclusionListFromCurrentAlarms(5)
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<GSJBTStandardObservationIdExclusionListFromCurrentAlarm> GetGSJBTStandardObservationIdExclusionListFromCurrentAlarm([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Where(gSJBTStandardObservationIdExclusionListFromCurrentAlarm => gSJBTStandardObservationIdExclusionListFromCurrentAlarm.Id == key));
        }

        // POST: 
        public async Task<IHttpActionResult> Post(GSJBTStandardObservationIdExclusionListFromCurrentAlarm entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new GSJBTStandardObservationIdExclusionListFromCurrentAlarm { Id = -entity.Id };
                db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Attach(delEntity);
                db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;
                await db.SaveChangesAsync();
                return Updated(entity);

            }

            modifiedEntity = db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }

        // GET: odata/GSJBTStandardObservationIdExclusionListFromCurrentAlarms(5)/JBTStandardObservation
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<JBTStandardObservation> GetJBTStandardObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Where(m => m.Id == key).Select(m => m.JBTStandardObservation));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool GSJBTStandardObservationIdExclusionListFromCurrentAlarmExists(long key)
        {
            return db.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.Count(e => e.Id == key) > 0;
        }
    }
}
