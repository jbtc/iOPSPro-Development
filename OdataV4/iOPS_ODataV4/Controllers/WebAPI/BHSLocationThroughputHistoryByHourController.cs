using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSLocationThroughputHistoryByHourController : ApiController
    {
        private readonly iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSLocationThroughputHistoryByHour_Result1> Get(DateTime beginDate, DateTime endDate, string location)
        {
            var result = db.BHSLocationThroughputHistoryByHour(beginDate, endDate, location);

            return result;


        }
    }
}
