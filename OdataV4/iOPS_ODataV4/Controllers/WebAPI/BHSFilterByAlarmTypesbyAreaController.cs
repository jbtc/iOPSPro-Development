using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSFilterByAlarmTypesbyAreaController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSFilterByAlarmTypesbyArea_Result> Get(DateTime beginDate, DateTime endDate, string alarmTypeList, int topNumber,  int siteId)
        {
            var result = db.BHSFilterByAlarmTypesbyArea(beginDate, endDate, alarmTypeList, topNumber, siteId);

            return result;


        }
    }
}
