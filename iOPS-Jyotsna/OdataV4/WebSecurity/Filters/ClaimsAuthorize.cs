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
using WebSecurityToken.Models;

namespace WebSecurityToken.Filters
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

			var identity = ParseAuthorizationHeader(actionContext);


			var userRoles = GetAuthorizedRoles(identity.Name);

			var newIdentity = new GenericIdentity(identity.Name);


			//Added for testing purposes.
			foreach (var userRole in userRoles)
			{
				newIdentity.AddClaim(new Claim(ClaimTypes.Role, userRole));

			}

			var principal = new GenericPrincipal(newIdentity, null);


			Thread.CurrentPrincipal = principal;
			if (HttpContext.Current != null)
			{
				HttpContext.Current.User = principal;
			}


			var httpContext = HttpContext.Current;
			if (!(httpContext.User.Identity is ClaimsIdentity))
			{
				return false;
			}

			var claimsIdentity = (ClaimsIdentity)httpContext.User.Identity;
			if (claimsIdentity.Claims.Where(claim => claim.Type == ClaimTypes.Role).Any(claim => Roles.Split(',').Any(r => r.Trim() == claim.Value)))
			{
				//Continue with the regular Authorize check
				return true;
				
			}



			return false;

		}
		private IEnumerable<string> GetAuthorizedRoles(string username)
		{
			using (var wsDb = new WebSecurityEntities())
			{
				var userEntity = wsDb
					.Users
					.FirstOrDefault(u => u.Username == username);


				if (userEntity == null)
				{
					return null;
				}

				var webSecurityRoleNames = userEntity.UserRoles.Select(r => "WebSecurity." + r.Role.Application.Code + "." + r.Role.Name).ToList();

				using (var pDb = new PersonnelEntities())
				{
					var adGroupRoleNames = pDb.People
						.FirstOrDefault(p => p.MasterId == userEntity.UserMasterId)
						.ADGroups
						.Select(g => "ADGroup." + g.Name)
						.ToList();

					webSecurityRoleNames = webSecurityRoleNames.Union(adGroupRoleNames).ToList();
				}


				return webSecurityRoleNames;
			}

		}
		/// <summary>
		/// Parses the Authorization header and creates user credentials
		/// </summary>
		/// <param name="actionContext"></param>
		protected virtual GenericIdentity ParseAuthorizationHeader(HttpActionContext actionContext)
		{
			if (actionContext.Request.Headers.Any())
			{
				if (actionContext.Request.Headers.GetValues("authorization") != null)
				{
					var accessToken = actionContext.Request.Headers.GetValues("authorization").FirstOrDefault();
					if (string.IsNullOrEmpty(accessToken))
						return null;

					using (var db = new WebSecurityEntities())
					{
						var userEntity = db.Users.FirstOrDefault(u => u.AccessToken == accessToken);
						if (userEntity == null)
						{
							return null;
						}
						var identity = new GenericIdentity(userEntity.Username);
						return identity;
					}

				}

			}
			return null;

		}

	}
}