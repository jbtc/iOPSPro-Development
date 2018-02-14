using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class GSAlarmTagsByListOfAssetIdsController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<GSAlarmTagsByListOfAssetIds_Result> Get(string assetIds)
        {
            var result = db.GSAlarmTagsByListOfAssetIds(assetIds);

            return result;


        }
    }
}
