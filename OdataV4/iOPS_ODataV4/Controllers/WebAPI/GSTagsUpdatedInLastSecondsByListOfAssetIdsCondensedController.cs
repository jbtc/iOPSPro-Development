using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class GSTagsUpdatedInLastSecondsByListOfAssetIdsCondensedController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<string> Get(string assetIds, int seconds)
        {
            var result = db.GSTagsUpdatedInLastSecondsByListOfAssetIdsCondensed(assetIds, seconds);

            return result;


        }
    }
}
