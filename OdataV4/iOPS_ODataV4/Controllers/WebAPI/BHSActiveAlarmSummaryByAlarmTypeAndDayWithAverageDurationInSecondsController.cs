using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSecondsController : ApiController
    {
        private readonly iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds_Result2> Get(DateTime beginDate, DateTime endDate, int siteId, string alarmType)
        {
            var result = db.BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds(beginDate, endDate, siteId, alarmType);
            

            return result;


        }
    }
}
