using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSLocationThroughputHistoryByDayController : ApiController
    {
        private readonly iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSLocationThroughputHistoryByDay_Result> Get(DateTime beginDate, DateTime endDate, string location)
        {
            var result = db.BHSLocationThroughputHistoryByDay(beginDate, endDate, location);

            return result;


        }
    }
}
