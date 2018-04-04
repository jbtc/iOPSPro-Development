(function () {
	"use strict";


	function SecurityService($http, $odataresource, store, $rootScope, $timeout, signalR, utilityService, dataService, $interval) {

		var service = {};


		service.users = [];
		var serverPath;

		if (odataServerUrl.indexOf("48773") > 0) {
			serverPath = odataServerUrl;
		} else {
			serverPath = odataServerUrl + "/iOPS";
		}

		//console.log("SecurityService Started...");

		service.IsUserOnline = function (userId) {
			var onlineUsers = service.GetOnlineUsers();
			return onlineUsers.any(function (u) { return u.Id == userId });
		}

		function GetResource(collection) {
			//In order to be able to update any entity, the $odataresource object must know the key field. Here it is Id"
			//This is supplied to the $odataresource as the second parameter.
			return $odataresource(serverPath + collection, {}, {}, {
				odatakey: 'Id',
				isodatav4: true
			});

		}


		service.GetResource = function (collection) {
			return GetResource(collection);
		}

		service.GetCurrentUser = function () {
			if (!service.currentUser) {
				service.currentUser = store.get('currentUser');
			}
			return service.currentUser;
		};

		service.UserHasAuthorizedActivity = function (activityName) {
			//console.log(service.currentUser);
			activityName = activityName.toUpperCase();
			return service.currentUser.AuthorizedActivities.any(function (n) { return n.toUpperCase() == activityName });

		}

		service.SaveNewApplication = function (application) {
			return GetResource("Applications").save(application);
		}

		service.SaveUser = function (user) {
			GetResource("iOPS_Users").update(user);
		}



		service.GetAuthorizableActivityById = function (AuthorizableActivityId) {
			return GetResource("AuthorizableActivities").odata().get(parseInt(AuthorizableActivityId)).$promise;
		}






		service.LoginUserWithUsernameAndPassword = function (username, password) {
			var dataString = username + "\n" + password;
			var url = serverPath + "/login?$format=application/json;odata.metadata=none";
			var promise = $http.post(url, dataString)
				.then(function (response) {
					console.log("Entire response = %O", response);
					if (response.status == 401) {
						$rootScope.$broadcast("securityService.invalidAccount", null);
						return "";
					}
					var data = response.data;
					if (data.Id == 0) {
						$rootScope.$broadcast("securityService.invalidAccount", null);
						return "";
					}
					console.log("Logged in User = %O", data);
					if (response.status != 401) {
						data.DateLoggedIn = Date.now();
						service.currentUser = data;
						store.set('currentUser', data);
						service.showMenu = true;
						Global.User = data;
					}

					if (data.error) {
						//There was an error for some reason
						if (data.error.innererror &&
							data.error.innererror.internalexception &&
							data.error.innererror.internalexception.type &&
							(
								data.error.innererror.internalexception.type == 'System.Data.Entity.Core.EntityException'
									||
									data.error.innererror.internalexception.type == 'System.Data.Entity.Core.EntityException'
							)) {

							alertify.alert("iOPSPro is experiencing database issues. Try again later.");

						}
					}

					JoinUserSignalRGroups();

					$rootScope.$broadcast('securityService:authenticated', service.currentUser);
					return (data);
				});
			return promise;
		};


		$rootScope.$on("System.signalR Connected", function (event, obj) {
			//For some reason (like putting your system to sleep) the signalR service disconnected.
			//On reconnection, join the appropriate groups.

			$timeout(function () {

				JoinUserSignalRGroups();
			}, 50);
		});

		//$interval(function () {
		//	JoinUserSignalRGroups();
		//}, 3000);

		function JoinUserSignalRGroups() {
			if (Global.SignalR && Global.SignalR.Status == "Connected") {
				
				if (Global.User && Global.User.AuthorizedActivities) {
					if (Global.User.AuthorizedActivities.contains("AuthorizedActivity.AdministerSystem")) {
						signalR.JoinGroup("Admin");
					}

					Global.User.ReaderOf.forEach(function (ro) {
						var site = ro.replace('Site.', '')
						//console.log("User ReaderOf Sites site = to join = %O", site);
						signalR.JoinGroup(site);
					});
				}
			}
		}





		service.LoginUserWithAccessToken = function (accessToken) {

			var dataString = utilityService.GetQuerystringParameterByName("pwt");

			if (dataString) {
				service.currentUser = null;
				store.remove("currentUser");
			} else {

				var currentUser = service.GetCurrentUser();

				if (currentUser) {
					dataString = currentUser.ODataAccessToken;
				}
			}

			var url = serverPath + "/login?$format=application/json;odata.metadata=none";

			var promise = $http.post(url, dataString)
				.then(function (response) {
					//console.log("Entire response = %O",response);
					if (response.status == 401 || response.data.Id == 0) {
						//alert("Invalid Account!");
						$rootScope.$broadcast("securityService.invalidAccount", null);
						return "";
					}
					var data = response.data;
					console.log("Logged in User = %O", data);


					if (response.status != 401) {
						data.DateLoggedIn = Date.now();
						service.currentUser = data;
						store.set('currentUser', data);
						Global.User = data;
					}


					JoinUserSignalRGroups();
					$rootScope.$broadcast('securityService:authenticated', service.currentUser);
					return (data);
				});
			return promise;



		};

		function RefreshUserObject() {
			$http.get(serverPath + "loginaccesstoken(accesstoken='" + service.currentUser.AccessToken + "')?$format=application/json;odata.metadata=none")
				.then(function (response) {
					var data = response.data;
					//console.log("Logged in User = %O", data);

					if (data.UserMasterId > 0) {
						service.currentUser = data;
						store.set('currentUser', data);
						console.log("Local currentUser object refreshed = %O", service.currentUser);
						$rootScope.$broadcast("securityService.currentUserRefreshed");
					}



				});

		}

		service.RefreshUserSecurityForUserId = function (userId) {
			//First of all, is it me that is commanded to refresh?
			if (userId == service.currentUser.Id) {
				RefreshUserObject();
			} else {
				//Check the connected clients to see if the user that was changed is one of them.
				//If it is, signal that specific client to refresh the user object and broadcast to the 
				//rest of the site that the user object has been refreshed.
				//This enables any listener to dynamically change their menus, screen displays, etc...

				var connectedUsers = service.users;
				console.log("Someone Elses user data needs to be refreshed. Connected Users = %O", connectedUsers);
				service.users.where(function (u) { return u.Id == userId }).forEach(function (u) {
					signalR.SignalSpecificClient(connectedUsers[u].ClientId, "Security.RefreshUser", null);
				});
			}

		};


		$rootScope.$on("Security.RefreshUser", function () {
			RefreshUserObject();
		});












		return service;
	}


	angular
		.module("app")
		.factory('securityService', ['$http', '$odataresource', 'store', '$rootScope', '$timeout', "signalR", "utilityService", "dataService", "$interval", SecurityService]);



}());	//SecurityService
