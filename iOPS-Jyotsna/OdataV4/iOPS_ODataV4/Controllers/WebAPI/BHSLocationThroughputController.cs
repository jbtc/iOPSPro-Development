using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSLocationThroughputController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSLocationThroughput_Result1> Get(DateTime beginDate, DateTime endDate, string location)
        {
            var result = db.BHSLocationThroughput(beginDate, endDate, location);

            return result;


        }


    }
}
