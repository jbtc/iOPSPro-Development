(function () {
	"use strict";


	function SignalR($rootScope, $window, store, $interval, $timeout, $q) {


		//console.log("SignalR service created");
		var service = {};

		service.serverPath = signalRServerUrl;

		service.OdataLockedEntities = [];

		service.connectedClients = [];


		service.connected = false;

		var signalRHub = $.connection.jbthub;


		var serverPath = "";
		$.connection.hub.logging = false;
		var localLogging = false;

		function LocalLogIn(code, callerConnectionId, dataObject) {
			if (localLogging) {
				//console.log(" Hub->Me " + code + " Client:" + callerConnectionId + " Data:%O", dataObject);
				console.log(" Hub->Me " + code + " %O", dataObject);
			}
		}

		function LocalLogOut(code, dataObject) {
			if (localLogging) {
				console.log(" Me->Hub " + code + " Data:%O", dataObject);
			}
		}


		$.connection.hub.url = service.serverPath;

		var startTime = 0;
		var firstConnectedClient = null;



		$interval(function () {
			if (service.connectionState == "disconnected") {
				service.connected = false;
				HubStart();
			}
		}, 1000);


		function GetUserByClientId(clientId) {
			return service.connectedClients.where(function (client) { return client.ClientId === clientId }).first().User;
		}

		function SaveUserByClientId(clientId, user) {
			service.connectedClients = [
				{
					ClientId: clientId,
					User: user
				}
			].concat(service.connectedClients).distinct(function (a, b) { return a.ClientId == b.ClientId });

		}

		function RemoveUserByClientId(clientId) {

			var browser = service.connectedClients.first(function (c) { return c.ClientId == clientId });
			if (browser) {
				console.log("SignalR Client Disconnect was a browser for client = %O", browser);
			}
			service.connectedClients = service.connectedClients.where(function (c) { return c.ClientId != clientId });
		}

		var messageCount = 0;
		var lastGroupName = "";

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//Angular SignalR central station. This is the only point of connection with SignalR in this entire Angular application.
		//Angular will simply broadcast the SignalR messages and data to anybody who is listening.
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		signalRHub.client.SignalRNotification = function (code, dataObject, callerConnectionId, groupName) {

			//if (messageCount++ % 1 == 0) {
			//    console.log("SignalR Messages = " + messageCount);
			//    console.log(" Last Hub->Me " + code + " %O", dataObject);
			//}


			var elapsedMS = Date.now() - startTime;
			if (!groupName) {
				groupName = "";
			}

			//if (dataObject && dataObject.indexOf) {
			//	if (dataObject.indexOf('TestTagName') > 0) {
			//		console.log("TestTagName Arrived in signalR Service = %O", dataObject);
			//	}
			//}


			//if (groupName == "BNA") {
			//	console.log("Code = " + code + "  BNA Message = %O", dataObject);
			//}

			//console.log(groupName);

			LocalLogIn(code, callerConnectionId, dataObject, groupName);

			var fromUser;
			var fromUserName;
			switch (code) {

			case "System.InformationalMessage":
				fromUser = GetUserByClientId(callerConnectionId);
				if (fromUser) {
					fromUserName = fromUser.User.GivenName + " " + fromUser.User.FamilyName;
					toastr.info(dataObject, "Message from " + fromUserName);
					break;

				}

			case "System.AlertMessage":
				fromUser = GetUserByClientId(callerConnectionId);
				console.log("Alert Message from user = %O", fromUser);
				if (fromUser) {

					fromUserName = fromUser.User.GivenName + " " + fromUser.User.FamilyName;
					alertify.set({ labels: { ok: "Ok, I Got It!" } });

					var currentUser = Global.User;
					alertify.alert("<div class='panel panel-default'>" +
						"<div class='panel-heading'>" +
						"Message from " + fromUserName +
						"</div>" +
						"<div class='panel-body'>" +
						dataObject +
						"</div>" +
						"</div>"
						, function (e) {
							service.SignalSpecificClient(callerConnectionId, "System.InformationalMessage", "......message acknowledged.");
						});

				}
				break;

			case "System.ClientConnectionEstablished":

				console.log("ngEvent: System.ClientConnectionEstablished Data:%O", dataObject);
				SaveUserByClientId(callerConnectionId, dataObject);

				//Tell the new user about us in response.
				service.SignalSpecificClient(dataObject.ClientId, "System.OnLineReportResponse", GetClientDataObject());
				ConsoleLogAllConnectedClients();
				//Tell the rest of the system about it, in case some application wants to listen in on client connection events.
				$rootScope.$broadcast(code, dataObject);
				break;

			case "System.ClientLogout":

				console.log("ngEvent: System.ClientLogout Data:%O", dataObject);
				console.log("Our ClientId = " + $.connection.hub.id);
				if (dataObject) {

					RemoveUserByClientId(dataObject.ClientId);

					ConsoleLogAllConnectedClients();
					RemoveAllEntityLocksForClientId(dataObject.ClientId);
					//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
					$rootScope.$broadcast(code, dataObject);

				}
				break;

			case "System.SignalR.ClientDisconnected":

				console.log("ngEvent: System.ClientDisconnected Data:%O", dataObject);
				//The dataObject IS the clientID in this case.
				RemoveUserByClientId(dataObject.ClientId);
				ConsoleLogAllConnectedClients();
				RemoveAllEntityLocksForClientId(dataObject);
				//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
				$rootScope.$broadcast(code, dataObject);
				break;

			case "System.OnLineReportResponse":

				if (dataObject) {
					SaveUserByClientId(dataObject.ClientId, dataObject);

					if (!firstConnectedClient) {
						firstConnectedClient = dataObject;
						//Ask the first connected client about locked entites so we can start with a synced list like everybody else has.
						service.SignalSpecificClient(dataObject.ClientId, "System.ReportLockedEntities", null);
					}
					ConsoleLogAllConnectedClients();

				}
				break;


			case "System.ReportLockedEntities":
				service.SignalSpecificClient(callerConnectionId, "System.LockedEntitiesReport", service.OdataLockedEntities);
				break;

			case "System.LockedEntitiesReport":
				dataObject.forEach(function (lockEntry) {
					AddEntityLockEntryToLocalList(lockEntry);
				});
				console.log("Current Locked Entities = %O", service.OdataLockedEntities);
				break;

			case "System.EntityLocked":

				AddEntityLockEntryToLocalList(dataObject);
				console.log("Entity Has Been Locked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);
				$rootScope.$broadcast("System.EntityLocked", dataObject);
				break;


			case "System.EntityUnlocked":
				//Remove it from our locked list
				RemoveEntityLockEntryFromLocalList(dataObject);
				console.log("Entity Has Been Unlocked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);

				//Tell the entire local system about it.
				$rootScope.$broadcast("System.EntityUnlocked", dataObject);

				break;



			default:
				//console.log("Broadcasting..");
				$rootScope.$broadcast(code, dataObject);




			}

		}

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



		function GetEntityLockingDataObject(odataSource, collection, Id) {
			return { odataSource: odataSource, collection: collection, Id: parseInt(Id), lockingClientId: service.Me.ClientId };
		}

		//Called by the local system to lock an entity on all connected clients.
		service.LockEntity = function (odataSourceName, collectionName, Id) {
			var entityLockData = GetEntityLockingDataObject(odataSourceName, collectionName, Id);

			AddEntityLockEntryToLocalList(entityLockData);
			service.SignalAllClients("System.EntityLocked", entityLockData);
		}

		function AddEntityLockEntryToLocalList(lockEntry) {

			var found = false;
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].Id == lockEntry.Id
					&&
					service.OdataLockedEntities[lc].odataSource == lockEntry.odataSource
					&&
					service.OdataLockedEntities[lc].collection == lockEntry.collection) {
					found = true;
					break;
				}
			}
			if (!found) {
				console.log("Lock entry was unique - adding to the list");
				service.OdataLockedEntities.push(lockEntry);
				console.log("Current locks = %O", service.OdataLockedEntities);
			}
		}


		function RemoveEntityLockEntryFromLocalList(lockEntry) {
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].entityTag == lockEntry.entityTag) {
					service.OdataLockedEntities.splice(lc, 1);
					break;
				}
			}

		}


		function RemoveAllEntityLocksForClientId(clientId) {
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].clientId == clientId) {
					service.OdataLockedEntities.splice(lc, 1);
				}
			}

		}

		service.GetLockingUserForEntity = function (odataSource, collection, entityId) {
			console.log("Checking for locks.....");
			//See if this entity is already locked by someone else. (Not us)
			if (service.OdataLockedEntities.length > 0) {
				console.log("Global Locks are present....%O", service.OdataLockedEntities);
				for (var x = 0; x < service.OdataLockedEntities.length; x++) {
					if (service.OdataLockedEntities[x].Id == parseInt(entityId)) {

						if (service.OdataLockedEntities[x].odataSource == odataSource) {
							if (service.OdataLockedEntities[x].collection == collection) {
								var lock = service.OdataLockedEntities[x];
								console.log("entity lock is present - Applicable lock = %O", lock);

								//Find the person out of the logged in people who matches this client id.
								if (lock.lockingClientId != service.Me.ClientId) {

									var lockUser = datacache.GetFromNamedCache("SignalRUsersByClientId", lock.lockingClientId);
									if (lockUser) {
										console.log("Lock User = %O", lockUser.User);
										return lockUser.User;

									} else {
										console.log("signalR did not find the locking client ID in the cache for users!!!!");
										console.log("Cache for Users by Client Id = %O", datacache.GetAllValuesFromCache("SignalRUsersByClientId"));
									}
								}
							}
						}
					}
				}
				return null;
			}

		}


		//Called by the local system to unlock an entity on all connected clients.
		service.UnlockEntity = function (odataSourceName, collectionName, Id) {
			var entityLockData = GetEntityLockingDataObject(odataSourceName, collectionName, Id);
			RemoveEntityLockEntryFromLocalList(entityLockData);
			console.log("Current locks = %O", service.OdataLockedEntities);
			service.SignalAllClients("System.EntityUnlocked", entityLockData);
		}


		function DisplayAlertMessage(fromUserName, fromClientId, message) {
		}



		function GetClientDataObject() {
			var u = store.get('currentUser');
			if (u) {
				return {
					User: {
						Username: u.Username,
						UserId: u.Id,
						Email: u.Email,
						FamilyName: u.FamilyName,
						GivenName: u.GivenName,
						MiddleName: u.MiddleName

					},
					ClientId: $.connection.hub.id,
					DateLoggedIn: u.DateLoggedIn,
					DateLoggedInFormatted: moment(u.DateLoggedIn).format("YYYY-MM-DD HH:mm:ss")

				};

			}
			return null;
		}


		service.SignalAllClients = function (code, item) {
			//Signal down the chain locally. 
			//console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClients(code, item);
		}

		service.SignalAllClientsInGroup = function (groupName, code, item) {
			//Signal down the chain locally. 
			console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClientsInGroup(groupName, code, item);
		}

		service.SignalOnlyOtherClients = function (code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			var deferred = $q.defer();
			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					//Signal everybody else.
					LocalLogOut(code, item);
					return signalRHub.server.notifyOtherClients(code, item);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});

			return deferred.promise;
		}

		service.SignalOnlyOtherClientsInGroup = function (groupName, code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;

					//Signal everybody else.
					LocalLogOut(code, item);
					return signalRHub.server.notifyOtherClientsInGroup(groupName, code, item);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error");
				});
			return deferred.promise;
		}


		service.JoinGroup = function (groupName) {

			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					signalRHub.server.joinGroup(groupName).then(function () {
						deferred.resolve();
					});
					//console.log("Joined signalR Group " + groupName);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("Could not start signalR Hub");
				});

			return deferred.promise;
		}
		service.LeaveGroup = function (groupName) {

			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					//Signal everybody else.
					return signalRHub.server.leaveGroup(groupName);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});

			return deferred.promise;
		}

		service.SignalSpecificClient = function (clientId, code, item) {
			//console.log("Local->Client " + clientId +  " Code:" + code + " Data:%O", item);
			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;
					LocalLogOut(code, item);
					return signalRHub.server.notifySpecificClient(clientId, code, item);
				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});
			return deferred.promise;
		}

		service.SendEmail = function (emailData) {
			console.log("Sending Email.....");
			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					signalRHub.server.sendEmail(emailData);
				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
				});
		}

		function ConsoleLogAllConnectedClients() {
			//console.log("Clients Connected: %O", service.connectedClients);
			//console.log("hub = %O", $.connection.hub);
		}

		service.SignalClientsForLogout = function () {
			service.SignalAllClients("System.ClientLogout", GetClientDataObject());
		}

		$window.onbeforeunload = service.SignalClientsForLogout;

		$.connection.hub.stateChanged(function (state) {
			var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
			//console.log('SignalR state changed from: ' + stateConversion[state.oldState] + ' to: ' + stateConversion[state.newState]);
			service.connectionState = stateConversion[state.newState];
			if (service.connectionState == "connected") {
				$rootScope.$broadcast("System.signalR Connected");
			}

		});

		//Conduct a signalR round trip timing test
		function SignalRPerformanceTest() {

			startTime = performance.now();
			console.log("signalR Client = %O", service.Me);
			if (service.Me) {
				service.SignalSpecificClient(service.Me.ClientId, "signalRPerformanceTest", true);
			}
		}

		$rootScope.$on("signalRPerformanceTest", function (event, obj) {
			console.log("SignalR Trip Time = " + (performance.now() - startTime) / 2);
		});

		//IMPORTANT!!!! - This has to be defined AFTER THE HUB IS DEFINED - PLACE THE START FUNCTION NEAR THE END OF THE SERVICE DEFINITION - WHERE IT IS NOW -     DO NOT MOVE IT TO THE TOP.
		function HubStart() {
			$.connection.hub.start({ withCredentials: false, transport: ["webSockets", "serverSentEvents", "longPolling"] })

				.done(function () {
					//console.log("SignalR start is done.");
					if (!service.connected) {
						service.connected = true;
						console.log("Client Connect - Local ClientId:" + $.connection.hub.id);
						var dataObject = GetClientDataObject();
						if (dataObject) {
							service.Me = dataObject;
							SaveUserByClientId(dataObject.ClientId, dataObject);

							service.SignalAllClients("System.ClientConnectionEstablished", GetClientDataObject());
						}
						//$interval(SignalRPerformanceTest,500);
						SignalRPerformanceTest();
					}



				})

				.fail(function (error) {
						//console.log("SignalR Error " + error);
						service.connected = false;
						$timeout(function () {
							HubStart();
						}, 1000);
					}
				);

		}

		HubStart();


		return service;
	}


	angular
		.module("app")
		.factory('signalR', ["$rootScope", "$window", "store", "$interval", "$timeout", "$q", SignalR]);



}());	//SignalR
