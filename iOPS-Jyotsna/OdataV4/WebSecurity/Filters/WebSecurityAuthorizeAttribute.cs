using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Security;
using WebSecurityToken.Models;

namespace WebSecurityToken.Filters
{
	[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
	public class WebSecurityAuthorizeAttribute : AuthorizeAttribute
	{
		readonly bool Active = true;
		public int Order { get; set; }

		/// <summary>
		/// Overriden constructor to allow explicit disabling of this
		/// filter's behavior. Pass false to disable (same as no filter
		/// but declarative)
		/// </summary>
		/// <param name="active"></param>
		public WebSecurityAuthorizeAttribute(bool active)
		{
			Active = active;
		}

		public WebSecurityAuthorizeAttribute()
		{
			Order = 1;
		}


		public override void OnAuthorization(HttpActionContext actionContext)
		{
			//Add the WebSecurity Roles to the Principal Windows Identity


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



			//base.OnAuthorization(actionContext);


			//var username = httpContext.User.Identity.Name;
			//var roles = GetAuthorizedRoles(username);

			//var provider = new WindowsTokenRoleProvider();
			//if (roles.Any(role => provider.IsUserInRole(httpContext.User.Identity.Name, role)))
			//{
			//	return true;
			//}

			//return base.AuthorizeCore(httpContext);

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