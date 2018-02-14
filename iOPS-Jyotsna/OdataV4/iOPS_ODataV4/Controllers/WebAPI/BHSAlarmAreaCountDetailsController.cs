using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSAlarmAreaCountDetailsController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSAlarmAreaCountDetails_Result> Get(DateTime beginDate, DateTime endDate, string bhsName, string area, int siteId)
        {
            var result = db.BHSAlarmAreaCountDetails(beginDate, endDate, bhsName, area, siteId);

            return result;


        }
    }
}
