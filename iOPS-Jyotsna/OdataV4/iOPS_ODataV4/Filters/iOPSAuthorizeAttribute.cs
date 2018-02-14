using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using System.Web.Security;
using iOPS_ODataV4.Models;
using iOPS_ODataV4.ViewModels;
using Microsoft.Ajax.Utilities;
using WebGrease.Css.Extensions;
using AuthorizeAttribute = System.Web.Http.AuthorizeAttribute;

namespace iOPS_ODataV4.Filters
{
    static class SecurityCache
    {
        public static ConcurrentDictionary<string, GenericPrincipal> PrincipalDict = new ConcurrentDictionary<string, GenericPrincipal>();
    }


    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class IOPSAuthorizeAttribute : AuthorizeAttribute
    {
        readonly bool Active = true;
        public int Order { get; set; }

        /// <summary>
        /// Overriden constructor to allow explicit disabling of this
        /// filter's behavior. Pass false to disable (same as no filter
        /// but declarative)
        /// </summary>
        /// <param name="active"></param>
        public IOPSAuthorizeAttribute(bool active)
        {
            Active = active;
        }

        public IOPSAuthorizeAttribute()
        {
            Order = 1;
        }


        public override void OnAuthorization(HttpActionContext actionContext)
        {
            string accessToken = "";
            try
            {
                accessToken = actionContext.Request.Headers?.GetValues("Authorization")?.FirstOrDefault();
            }
            catch
            {

            }



            if (!accessToken.IsNullOrWhiteSpace() && accessToken.Length > 30 && !accessToken.Contains("\n"))
            {
                GenericPrincipal principal;


                //Try to find the cached version of the principle. 
                if (SecurityCache.PrincipalDict.TryGetValue(accessToken, out principal))
                {
                    Thread.CurrentPrincipal = principal;
                    if (HttpContext.Current != null)
                    {
                        HttpContext.Current.User = principal;
                    }
                    return;
                }
            }

            //Find the user entity from values contained in the request header. They can be from the access token for from basic authentication from excel power query or power BI.
            var userEntity = GetUserEntityFromAuthorizationHeader(actionContext);




            if (userEntity != null)
            {
                var identity = new GenericIdentity(userEntity.Username);


                //Construct a list of strings consisting of the authorizable activites and the reader ACL entries.
                var claims = GetClaims(identity.Name);

                //Each authorizaed activity and reader list items are combined together in one list of strings.
                //These strings are added below as "Claims" attached to the principle.
                foreach (var claim in claims)
                {

                    identity.AddClaim(new Claim(ClaimTypes.Role, claim));
                }



                var principal = new GenericPrincipal(identity, null);

                //Cache this generated principle in the static concurrent dictionary keyed by access token value so it can be pulled up at high speed.
                SecurityCache.PrincipalDict.AddOrUpdate(userEntity.AccessToken, principal, (key, value) => value);

                Thread.CurrentPrincipal = principal;
                if (HttpContext.Current != null)
                {
                    HttpContext.Current.User = principal;
                }

            }
            else
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Forbidden);
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



        private List<string> GetClaims(string username)
        {
            using (var wsDb = new iOPS_NormalizedEntities())
            {
                var userEntity = wsDb
                    .iOPSUsers
                    .FirstOrDefault(u => u.Username == username);


                if (userEntity == null)
                {
                    return null;
                }

                var authorizedActivities = userEntity.UserAuthorizedActivities.Select(aa => "Activity." + aa.AuthorizableActivity.Activity).ToList();

                var readerRoles = userEntity.CompanyDataReaders.Select(cr => "Company." + cr.Company.Name)
                    .Concat(userEntity.SiteDataReaders.Select(sr => "Site." + sr.Site.Name))
                    .ToList();



                var allList = authorizedActivities.Concat(readerRoles).ToList();

                allList.Add("Token" + userEntity.AccessToken);


                return authorizedActivities.Concat(readerRoles).ToList();
            }

        }

        /// <summary>
        /// Parses the Authorization header and creates user credentials
        /// </summary>
        /// <param name="actionContext"></param>
        protected virtual iOPSUser GetUserEntityFromAuthorizationHeader(HttpActionContext actionContext)
        {

            string loginString = actionContext.Request.Content.ReadAsStringAsync().Result;

            if (actionContext.Request.Headers.Any() || loginString.Length > 2)
            {
                iOPSUser userEntity;
                if (loginString.Contains("\n"))
                {
                    var username = loginString.Split('\n')[0];
                    var password = loginString.Split('\n')[1];

                    using (var db = new iOPS_NormalizedEntities())
                    {
                        userEntity =
                            db.iOPSUsers.FirstOrDefault(u => u.Username == username || u.Person.Email == username);

                        if (userEntity != null)
                        {
                            //-If the user password hash has not been set yet then set it now.
                            if (String.IsNullOrWhiteSpace(userEntity.PasswordHash))
                            {
                                //-External user has no password hash set - unauthorized
                                return null;
                            }

                            if (userEntity.WillEncryptPasswordOnFirstLogin ?? false)
                            {
                                userEntity.PasswordHash = Services.Security.CreatePasswordHash(userEntity.PasswordHash);
                                userEntity.WillEncryptPasswordOnFirstLogin = false;
                                db.SaveChanges();
                            }

                            if (Services.Security.ValidatePassword(password, userEntity.PasswordHash))
                            {
                                //-External user has a valid password
                                if (String.IsNullOrWhiteSpace(userEntity.AccessToken))
                                {
                                    //If their access token has not been computed and set, do so now.
                                    userEntity.AccessToken = Services.Security.CreateAccessToken(userEntity);
                                    db.SaveChanges();
                                }
                                //Send the user object back to the browser
                                var identity = new GenericIdentity(userEntity.Username);
                                return userEntity;
                            }

                        }

                    }



                }


                string httpRequestHeaderAuthorizationValue = "";
                try
                {
                    httpRequestHeaderAuthorizationValue = actionContext.Request.Headers.GetValues("Authorization").FirstOrDefault();

                }
                catch
                {

                }



                if (!httpRequestHeaderAuthorizationValue.IsNullOrWhiteSpace())
                {

                    using (var db = new iOPS_NormalizedEntities())
                    {
                        if (httpRequestHeaderAuthorizationValue.Contains("Basic "))
                        {
                            var basicAuthentication =
                                Encoding.UTF8.GetString(
                                    Convert.FromBase64String(httpRequestHeaderAuthorizationValue.Replace("Basic ", "")));

                            var username = basicAuthentication.Split(':').First();
                            var password = basicAuthentication.Split(':').Last();

                            userEntity = db.iOPSUsers.FirstOrDefault(u => u.Username == username || u.Person.Email == username);

                            return userEntity;
                        }


                        userEntity = db.iOPSUsers.FirstOrDefault(u => u.AccessToken == httpRequestHeaderAuthorizationValue);
                        if (userEntity == null)
                        {
                            return null;
                        }
                        return userEntity;
                    }

                }
            }


            return null;

        }

    }
}