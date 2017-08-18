using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHoursController : ApiController
    {

        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours_Result> Get(DateTime beginDate, DateTime endDate, long siteId)
        {
            var result = db.BHSBagPathDurationCumlativeHourlyAggregatePlusEmptyHours(beginDate, endDate, siteId);

            return result;

        }
    }
}
