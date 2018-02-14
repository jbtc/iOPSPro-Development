using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using iOPS_ODataV4.Models;

namespace iOPS_ODataV4.Filters
{
    public class ClaimsAuthorize : AuthorizeAttribute
    {

        public int Order { get; set; }

        public ClaimsAuthorize()
        {
            Order = 2;
        }

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {

            var httpContext = HttpContext.Current;
            if (!(httpContext.User.Identity is ClaimsIdentity))
            {
                return false;
            }

            var claimsIdentity = (ClaimsIdentity)httpContext.User.Identity;
            if (claimsIdentity.Claims.Where(claim => claim.Type == ClaimTypes.Role).Any(claim => Roles.Split(',').Any(r => r.Trim() == claim.Value)))
            {
                //Continue - user is allowed access
                return true;

            }

            return false;

        }

    }
}