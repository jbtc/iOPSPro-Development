using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class Top5ObservationExceptionsController : Controller
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<GSTop5AlarmTypes_Result> Get(DateTime beginDate, DateTime endDate, int siteId)
        {
            var result = db.GSTop5AlarmTypes(beginDate, endDate, siteId);

            return result;


        }
    }
}