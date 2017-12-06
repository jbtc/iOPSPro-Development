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
    builder.EntitySet<ObservationException>("ObservationExceptions");
    builder.EntitySet<Observation>("Observations"); 
    builder.EntitySet<Tag>("Tags"); 
    builder.EntitySet<ObservationExceptionComment>("ObservationExceptionComments"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ObservationExceptionsController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/ObservationExceptions
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public IQueryable<ObservationException> GetObservationExceptions()
        {
            return db.ObservationExceptions;
        }

        // GET: odata/ObservationExceptions(5)
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public SingleResult<ObservationException> GetObservationException([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptions.Where(observationException => observationException.Id == key));
        }


        // GET: odata/ObservationExceptions(5)/InitiatingObservation
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public SingleResult<Observation> GetInitiatingObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptions.Where(m => m.Id == key).Select(m => m.InitiatingObservation));
        }

        // GET: odata/ObservationExceptions(5)/TerminatingObservation
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public SingleResult<Observation> GetTerminatingObservation([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptions.Where(m => m.Id == key).Select(m => m.TerminatingObservation));
        }

        // GET: odata/ObservationExceptions(5)/Tag
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public SingleResult<Tag> GetTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationExceptions.Where(m => m.Id == key).Select(m => m.Tag));
        }

        // GET: odata/ObservationExceptions(5)/ObservationExceptionComments
        [EnableQuery(MaxExpansionDepth = 100, MaxNodeCount = 10000)]
        public IQueryable<ObservationExceptionComment> GetObservationExceptionComments([FromODataUri] long key)
        {
            return db.ObservationExceptions.Where(m => m.Id == key).SelectMany(m => m.ObservationExceptionComments);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ObservationExceptionExists(long key)
        {
            return db.ObservationExceptions.Count(e => e.Id == key) > 0;
        }
    }
}
