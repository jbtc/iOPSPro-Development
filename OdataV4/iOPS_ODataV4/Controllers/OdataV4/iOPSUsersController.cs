using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.ModelBinding;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using iOPS_ODataV4.Filters;
using iOPS_ODataV4.Models;
using iOPS_ODataV4.ViewModels;

namespace iOPS_ODataV4.Controllers.OdataV4
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.OData.Builder;
    using System.Web.OData.Extensions;
    using iOPS_ODataV4.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<iOPSUser>("iOPSUsers");
    builder.EntitySet<CompanyDataReader>("CompanyDataReaders"); 
    builder.EntitySet<Person>("People"); 
    builder.EntitySet<SiteDataReader>("SiteDataReaders"); 
    builder.EntitySet<UserEventLog>("UserEventLogs"); 
    builder.EntitySet<UserAuthorizedActivity>("UserAuthorizedActivities"); 
    builder.EntitySet<Dashboard>("Dashboards"); 
    builder.EntitySet<StaticDashboard>("StaticDashboards"); 
    config.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    [EnableQuery(MaxExpansionDepth = 100)]
    public class iOPSUsersController : ODataController
    {
        private iOPS_NormalizedEntities db = new iOPS_NormalizedEntities();



        //---R
        //++Special OData Function for logging in.
        //---R
        //---G
        //+Special for Username and Password - or ODataAccessToken - Or Email Link Token - Login.
        [ODataRoute("login")]
        [HttpPost, HttpOptions]
        [AllowAnonymous]
        public async Task<IHttpActionResult> Login()
        {
            var loginString = await Request.Content.ReadAsStringAsync();


            if (loginString.Contains("\n"))
            {
                var username = loginString.Split('\n')[0];
                var password = loginString.Split('\n')[1];

                var userEntity = await db.iOPSUsers.Include(u => u.SiteDataReaders).FirstOrDefaultAsync(u => u.Username == username);

                if (userEntity != null)
                {
                    //-If the user password hash has not been set yet then set it now.
                    if (String.IsNullOrWhiteSpace(userEntity.PasswordHash))
                    {
                        //-External user has no password hash set - unauthorized
                        return Unauthorized();
                    }


                    if (userEntity.WillEncryptPasswordOnFirstLogin ?? false)
                    {
                        userEntity.PasswordHash = Services.Security.CreatePasswordHash(userEntity.PasswordHash);
                        userEntity.WillEncryptPasswordOnFirstLogin = false;
                        await db.SaveChangesAsync();
                    }

                    if (Services.Security.ValidatePassword(password, userEntity.PasswordHash))
                    {
                        //-External user has a valid password
                        if (string.IsNullOrWhiteSpace(userEntity.AccessToken))
                        {
                            //If their access token has not been computed and set, do so now.
                            userEntity.AccessToken = Services.Security.CreateAccessToken(userEntity);
                            await db.SaveChangesAsync();
                        }
                        //Send the user object back to the browser
                        return Ok(Services.Mapping.UserEntityToUserViewModel(userEntity));
                    }

                }

                return Ok(new iOPSUserViewModel());

            }
            else
            {
                //-WebAPI OData bound functions will not let you send strings as parameters unless they are wrapped in single quotes. The single quotes will follow the paramter all the way into the function.
                //-You must strip the single quotes off of the values to get the real values.
                var accesstoken = loginString.Replace("'", "");
                if (accesstoken.Length < 10)
                {
                    return Unauthorized();
                }

                var userEntity = await db.iOPSUsers.FirstOrDefaultAsync(u => u.AccessToken == accesstoken);

                //-Can't find the user? Return an empty UserViewModel (it will have an ID of 0). This is to indicate that the user was not found.
                if (userEntity == null)
                {
                    //If no user was found with the access token, then look for the user with a password change token.
                    var pwcEntity = await db.iOPSUsers.FirstOrDefaultAsync(u => u.PasswordChangeLoginToken == accesstoken);
                    if (pwcEntity != null)
                    {
                        return Ok(Services.Mapping.UserEntityToUserViewModel(pwcEntity));
                    }
                    return Ok(new iOPSUserViewModel());



                }

                return Ok(Services.Mapping.UserEntityToUserViewModel(userEntity));

            }


        }

        //---R
        //---R




        //---G
        //+Normal OData methods below

        // GET: odata/iOPSUsers
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<iOPSUser> GetiOPSUsers()
        {
            return db.iOPSUsers;
        }

        // GET: odata/iOPSUsers(5)
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<iOPSUser> GetiOPSUser([FromODataUri] long key)
        {
            return SingleResult.Create(db.iOPSUsers.Where(iOPSUser => iOPSUser.Id == key));
        }

        
        // POST: odata/iOPSUsers
        [IOPSAuthorize]
        public async Task<IHttpActionResult> Post(iOPSUser entity)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            if (entity.Id < 0)
            {
                var delEntity = new iOPSUser { Id = -entity.Id };
                db.iOPSUsers.Attach(delEntity);
                db.iOPSUsers.Remove(delEntity);
                await db.SaveChangesAsync();
                return StatusCode(HttpStatusCode.NoContent);
            }

            var modifiedEntity = await db.iOPSUsers.FindAsync(entity.Id);

            if (modifiedEntity != null)
            {
                db.Entry(modifiedEntity).State = EntityState.Detached;
                


                //See if the record is being saved with the generate password change token set.
                //If so, then generate a new password change token and clear the flag.
                //Record the date of the token generation. It will be only good for 24 hours.
                if (entity.GeneratePasswordChangeLoginTokenOnSave == 1)
                {
                    entity.GeneratePasswordChangeLoginTokenOnSave = 0;
                    entity.PasswordChangeLoginToken = Services.Security.CreateAccessToken(entity).Replace("=","").Replace("+","");
                    entity.PasswordChangeLoginTokenDate = DateTime.Now;
                }

                db.iOPSUsers.Attach(entity);
                db.Entry(entity).State = EntityState.Modified;

                await db.SaveChangesAsync();
                return Created(entity);

            }
            modifiedEntity = db.iOPSUsers.Add(entity);

            await db.SaveChangesAsync();

            return Created(modifiedEntity);
        }


        // GET: odata/iOPSUsers(5)/Person
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public SingleResult<Person> GetPerson([FromODataUri] long key)
        {
            return SingleResult.Create(db.iOPSUsers.Where(m => m.Id == key).Select(m => m.Person));
        }

        // GET: odata/iOPSUsers(5)/SiteDataReaders
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<SiteDataReader> GetSiteDataReaders([FromODataUri] long key)
        {
            return db.iOPSUsers.Where(m => m.Id == key).SelectMany(m => m.SiteDataReaders);
        }

        // GET: odata/iOPSUsers(5)/UserEventLogs
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<UserEventLog> GetUserEventLogs([FromODataUri] long key)
        {
            return db.iOPSUsers.Where(m => m.Id == key).SelectMany(m => m.UserEventLogs);
        }

        // GET: odata/iOPSUsers(5)/WidgetCustomTagDisplayOrders
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<WidgetCustomTagDisplayOrder> GetWidgetCustomTagDisplayOrders([FromODataUri] long key)
        {
            return db.iOPSUsers.Where(m => m.Id == key).SelectMany(m => m.WidgetCustomTagDisplayOrders);
        }

        // GET: odata/iOPSUsers(5)/UserAuthorizedActivities
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<UserAuthorizedActivity> GetUserAuthorizedActivities([FromODataUri] long key)
        {
            return db.iOPSUsers.Where(m => m.Id == key).SelectMany(m => m.UserAuthorizedActivities);
        }

        // GET: odata/iOPSUsers(5)/Dashboards
        [IOPSAuthorize]
        [EnableQuery(MaxExpansionDepth = 100)]
        public IQueryable<Dashboard> GetDashboards([FromODataUri] long key)
        {
            return db.iOPSUsers.Where(m => m.Id == key).SelectMany(m => m.Dashboards);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool iOPSUserExists(long key)
        {
            return db.iOPSUsers.Count(e => e.Id == key) > 0;
        }
    }
}
