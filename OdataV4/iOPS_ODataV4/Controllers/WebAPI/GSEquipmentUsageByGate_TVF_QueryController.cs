using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class GSEquipmentUsageByGate_TVF_QueryController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<spGSEquipmentUsageByGate_TVF_Query_Result> Get(DateTime beginDate, DateTime endDate, int siteId, string gate)
        {
            var result = db.spGSEquipmentUsageByGate_TVF_Query(beginDate, endDate, siteId, gate);

            return result;


        }
    }
}
