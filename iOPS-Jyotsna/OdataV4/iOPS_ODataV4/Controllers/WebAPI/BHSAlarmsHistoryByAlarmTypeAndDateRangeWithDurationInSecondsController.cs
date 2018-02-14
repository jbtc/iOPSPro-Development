using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSecondsController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds_Result> Get(DateTime beginDate, DateTime endDate, int siteId, string alarmType)
        {
            var result = db.BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds(beginDate, endDate, siteId, alarmType);

            return result;


        }
    }
}
