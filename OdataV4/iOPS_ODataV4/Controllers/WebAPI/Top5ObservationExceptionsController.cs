﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Controllers.WebAPI
{
    public class Top5ObservationExceptionsController : ApiController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();
        public IEnumerable<GSTop5AlarmTypes3_Result> Get(DateTime beginDate, DateTime endDate, int siteId)
        {
            var result = db.GSTop5AlarmTypes3(beginDate, endDate, siteId);

            return result;


        }
    }
}
