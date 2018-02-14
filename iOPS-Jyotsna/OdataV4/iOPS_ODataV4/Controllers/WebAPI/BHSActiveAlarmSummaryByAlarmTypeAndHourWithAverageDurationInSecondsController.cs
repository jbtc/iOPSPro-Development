using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSecondsController : ApiController
    {
        private readonly iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds_Result2> Get(DateTime beginDate, DateTime endDate, int siteId, string alarmType)
        {
            var result = db.BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds(beginDate, endDate, siteId, alarmType);

            return result;


        }
    }
}
