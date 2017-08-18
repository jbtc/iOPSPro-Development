using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Diagnostics;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.ModelBinding;
using System.Web.OData;
using System.Web.OData.Query;
using System.Web.OData.Routing;
using AutoMapper;
using Microsoft.Ajax.Utilities;
using WebSecurityToken.Filters;
using WebSecurityToken.Models;
using WebSecurityToken.ViewModels;

namespace WebSecurityToken.Controllers.ODataV4
{
	public class UsersController : ODataController
	{
		private WebSecurityEntities db = new WebSecurityEntities();

		// GET: odata/Users
		[EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins, WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		public IQueryable<User> GetUsers()
		{
			return db.Users.AsQueryable();
		}

        // GET: odata/Users(5)
        [EnableQuery]
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins, WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		public SingleResult<User> GetUser([FromODataUri] long key)
		{
			return SingleResult
				.Create(db.Users.Where(user => user.UserMasterId == key));
		}

        //---G
        //+Special function to check for an existing username without any security concerns.
        [EnableQuery]
        [ODataRoute("usernamecheck(username={username})")]
        [HttpGet, HttpOptions]
        public IHttpActionResult UsernameCheck(string username)
        {
            //+WebAPI OData bound functions will not let you send strings as parameters unless they are wrapped in single quotes. The single quotes will follow the parameter all the way into the function.
            //+You must strip the single quotes off of the values to get the real values.

            username = username.Replace("'", "");

            var userEntity = db.Users
                .FirstOrDefault(u => u.Username == username);

            //+Can't find the user? Return an empty UserViewModel (it will have an ID of 0). This is to indicate that the user was not found.
            if (userEntity == null)
            {
                return Ok(false);
            }

            return Ok(true);


        }
        //---G


        //---G
        //+Special for Login Access Token purposes.
        [EnableQuery]
		[ODataRoute("loginaccesstoken(accesstoken={accesstoken})")]
		[HttpGet, HttpOptions]
		public IHttpActionResult LoginAccessToken(string accesstoken)
		{
			//-WebAPI OData bound functions will not let you send strings as parameters unless they are wrapped in single quotes. The single quotes will follow the paramter all the way into the function.
			//-You must strip the single quotes off of the values to get the real values.
			accesstoken = accesstoken.Replace("'", "");

			var userEntity = db.Users
				.FirstOrDefault(u => u.AccessToken == accesstoken);

			//-Can't find the user? Return an empty UserViewModel (it will have an ID of 0). This is to indicate that the user was not found.
			if (userEntity == null)
			{
				return Unauthorized();
			}

			return Ok(Services.Mapping.UserEntityToUserViewModel(userEntity));


		}

        //---G
        //+Special for Login purposes.
        [EnableQuery]
		[ODataRoute("login")]
		[HttpPost, HttpOptions]
		public async Task<IHttpActionResult> Login()
		{
			var loginString = await Request.Content.ReadAsStringAsync();




			var username = loginString.Split('\n')[0];
			var password = loginString.Split('\n')[1];

			var userEntity = db.Users.FirstOrDefault(u => u.Username == username);

			//-If the user is an external user and their password hash has not been set yet then set it now.
			if (userEntity != null && userEntity.ExternalUser != null)
			{
				//-This is an external user
				if (userEntity.ExternalUser.PasswordHash.IsNullOrWhiteSpace())
				{
					//-External user has no password hash set - unauthorized
					return Unauthorized();
                }


				if (Services.Security.ValidatePassword(password, userEntity.ExternalUser.PasswordHash))
				{
					//-External user has a valid password
					if (userEntity.AccessToken.IsNullOrWhiteSpace())
					{
						//If their access token has not been computed and set, do so now.
						userEntity.AccessToken = Services.Security.CreateAccessToken(userEntity);
						db.SaveChanges();
					}
					//Send the user object back to the browser
					return Ok(Services.Mapping.UserEntityToUserViewModel(userEntity));
				}
			}
			else
			{
				//This is a UTMB user - authenticate via Active Directory.

				using (var pc = new PrincipalContext(ContextType.Domain, "utmb-users-m"))
                        {
                            // validate the credentials
	                        if (pc.ValidateCredentials(username, password))
	                        {
		                        //Add the user to the websecurity database if they are not already there.
		                        var loggedInUserEntity = db.Users.Include(u => u.ExternalUser).FirstOrDefault(u => u.Username == username);
		                        if (loggedInUserEntity == null)
		                        {
			                        loggedInUserEntity =
				                        db.Users.Add(new User
				                        {
					                        Username = username,
					                        UserMasterId = (new PersonnelEntities()).People.FirstOrDefault(p => p.Username == username).MasterId,
				                        });
			                        loggedInUserEntity.AccessToken = Services.Security.CreateAccessToken(loggedInUserEntity);
			                        loggedInUserEntity.AccessTokenDate = DateTime.Now;
			                        db.SaveChanges();

		                        }

		                        if ((loggedInUserEntity.AccessToken ?? "") == "")
		                        {
			                        loggedInUserEntity.AccessToken = Services.Security.CreateAccessToken(loggedInUserEntity);
			                        db.SaveChanges();
		                        }
		                        return Ok(Services.Mapping.UserEntityToUserViewModel(loggedInUserEntity));

	                        }
	                        else
	                        {
								return Unauthorized();
		                        
	                        };
                        } 
				

			}

			return Ok(new UserViewModel());

		}


	    //***G
		//+Special for Registration purposes.
		[EnableQuery]
		[ODataRoute("registration")]
		[HttpPost, HttpOptions]
		public async Task<IHttpActionResult> Registration()
		{
			var loginString = await Request.Content.ReadAsStringAsync();

			var loginData = loginString.Split('\n');

			var username = loginData[0];
			var password = loginData[1];
			var lastName = loginData[2];
			var firstName = loginData[3];
			var organisation = loginData[4];


			var userEntity = db.Users.FirstOrDefault(u => u.Username == username);


			//-If the user is an external user and their password hash has not been set yet then set it now.
			if (userEntity != null && userEntity.ExternalUser != null)
			{
				//-This is an external user
				if (userEntity.ExternalUser.PasswordHash.IsNullOrWhiteSpace())
				{
					//-External user has no password hash set - unauthorized
					return Unauthorized();
				}


				if (Services.Security.ValidatePassword(password, userEntity.ExternalUser.PasswordHash))
				{
					//-External user has a valid password
					if (userEntity.AccessToken.IsNullOrWhiteSpace())
					{
						//If their access token has not been computed and set, do so now.
						userEntity.AccessToken = Services.Security.CreateAccessToken(userEntity);
						db.SaveChanges();
					}
					//-Send the user object back to the browser
					return Ok(Services.Mapping.UserEntityToUserViewModel(userEntity));
				}
			}
			else
			{
				//-This is a UTMB user - authenticate via Active Directory.
				using (var pc = new PrincipalContext(ContextType.Domain, "utmb-users-m"))
				{
					//-validate the credentials
					if (pc.ValidateCredentials(username, password))
					{
						//-Add the user to the websecurity database if they are not already there.
						var loggedInUserEntity = db.Users.Include(u => u.ExternalUser).FirstOrDefault(u => u.Username == username);
						if (loggedInUserEntity == null)
						{
							loggedInUserEntity =
								db.Users.Add(new User
								{
									Username = username,
									UserMasterId = (new PersonnelEntities()).People.FirstOrDefault(p => p.Username == username).MasterId,
								});
							loggedInUserEntity.AccessToken = Services.Security.CreateAccessToken(loggedInUserEntity);
							loggedInUserEntity.AccessTokenDate = DateTime.Now;
							db.SaveChanges();

						}

						if ((loggedInUserEntity.AccessToken ?? "") == "")
						{
							loggedInUserEntity.AccessToken = Services.Security.CreateAccessToken(loggedInUserEntity);
							db.SaveChanges();
						}
						return Ok(Services.Mapping.UserEntityToUserViewModel(loggedInUserEntity));

					}
					else
					{
						return Unauthorized();

					};
				}


			}

			return Ok(new UserViewModel());

		}

		// PUT: odata/Users(5)
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins, WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Put([FromODataUri] long key, Delta<User> patch)
		{
			Validate(patch.GetEntity());

			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			User user = await db.Users.FindAsync(key);
			if (user == null)
			{
				return NotFound();
			}

			patch.Put(user);

			try
			{
				await db.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!UserExists(key))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return Updated(user);
		}

		// POST: odata/Users
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Post(User user)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			db.Users.Add(user);

			try
			{
				await db.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (UserExists(user.UserMasterId))
				{
					return Conflict();
				}
				else
				{
					throw;
				}
			}

			return Created(user);
		}

		// PATCH: odata/Users(5)
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		[AcceptVerbs("PATCH", "MERGE")]
		public async Task<IHttpActionResult> Patch([FromODataUri] long key, Delta<User> patch)
		{
			Validate(patch.GetEntity());

			if (!ModelState.IsValid)
			{
				return BadRequest(ModelState);
			}

			User user = await db.Users.FindAsync(key);
			if (user == null)
			{
				return NotFound();
			}

			patch.Patch(user);

			try
			{
				await db.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!UserExists(key))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return Updated(user);
		}

		// DELETE: odata/Users(5)
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		public async Task<IHttpActionResult> Delete([FromODataUri] long key)
		{
			User user = await db.Users.FindAsync(key);
			if (user == null)
			{
				return NotFound();
			}

			db.Users.Remove(user);
			await db.SaveChangesAsync();

			return StatusCode(HttpStatusCode.NoContent);
		}

		// GET: odata/Users(5)/ActivityLogs
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		[EnableQuery]
		public IQueryable<ActivityLog> GetActivityLogs([FromODataUri] long key)
		{
			return db.Users.Where(m => m.UserMasterId == key).SelectMany(m => m.ActivityLogs);
		}

		// GET: odata/Users(5)/ExternalUser
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		[EnableQuery]
		public SingleResult<ExternalUser> GetExternalUser([FromODataUri] long key)
		{
			return SingleResult.Create(db.Users.Where(m => m.UserMasterId == key).Select(m => m.ExternalUser));
		}

		// GET: odata/Users(5)/UserRoles
		[WebSecurityAuthorize]
		[ClaimsAuthorize(Roles = "ADGroup.001MyUTMB-App-Admins,WebSecurity.Security.Admin, WebSecurity.TechServIssues.Admin")]
		[EnableQuery]
		public IQueryable<UserRole> GetUserRoles([FromODataUri] long key)
		{
			return db.Users.Where(m => m.UserMasterId == key).SelectMany(m => m.UserRoles);
		}

		protected override void Dispose(bool disposing)
		{
			if (disposing)
			{
				db.Dispose();
			}
			base.Dispose(disposing);
		}

		private bool UserExists(long key)
		{
			return db.Users.Count(e => e.UserMasterId == key) > 0;
		}

		
	}
}
