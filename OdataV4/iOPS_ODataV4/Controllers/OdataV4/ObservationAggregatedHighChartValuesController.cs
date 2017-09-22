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
    builder.EntitySet<ObservationAggregatedHighChartValue>("ObservationAggregatedHighChartValues");
    builder.EntitySet<Tag>("Tags"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ObservationAggregatedHighChartValuesController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();

        // GET: odata/ObservationAggregatedHighChartValues
        [EnableQuery]
        public IQueryable<ObservationAggregatedHighChartValue> GetObservationAggregatedHighChartValues()
        {
            return db.ObservationAggregatedHighChartValues;
        }

        // GET: odata/ObservationAggregatedHighChartValues(5)
        [EnableQuery]
        public SingleResult<ObservationAggregatedHighChartValue> GetObservationAggregatedHighChartValue([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationAggregatedHighChartValues.Where(observationAggregatedHighChartValue => observationAggregatedHighChartValue.Id == key));
        }

     

        // GET: odata/ObservationAggregatedHighChartValues(5)/Tag
        [EnableQuery]
        public SingleResult<Tag> GetTag([FromODataUri] long key)
        {
            return SingleResult.Create(db.ObservationAggregatedHighChartValues.Where(m => m.Id == key).Select(m => m.Tag));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ObservationAggregatedHighChartValueExists(long key)
        {
            return db.ObservationAggregatedHighChartValues.Count(e => e.Id == key) > 0;
        }
    }
}
