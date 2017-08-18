﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class BHSTop5AlarmTypeLongestDurationController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<BHSTop5AlarmTypeLongestDuration_Result1> Get(DateTime beginDate, DateTime endDate, int siteId)
        {
            var result = db.BHSTop5AlarmTypeLongestDuration(beginDate, endDate, siteId);

            return result;


        }
    }
}
