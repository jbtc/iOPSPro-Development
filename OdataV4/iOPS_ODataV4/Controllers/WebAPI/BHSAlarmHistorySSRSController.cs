using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSAlarmHistorySSRSController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSAlarmHistorySSRS_Result> Get(DateTime beginDate, DateTime endDate, int siteId, string token )
        {
            var result = db.BHSAlarmHistorySSRS(beginDate, endDate,siteId,  "87238723r87r2873287tr3." );

            return result;


        }

    }
}
