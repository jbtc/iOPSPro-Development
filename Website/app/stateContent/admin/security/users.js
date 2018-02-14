//++Users Controller
(function () {
	"use strict";


	function UsersCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $q) {
		console.log("UsersCtrl conroller invoked.");
		var vm = this;

		vm.columnWidths = {
			name: 10,
			company: 6,
			username: 6,
			email: 15,
			phone: 10,
			privileges: 20,
			accountStatus: 15,
			loggedInStatus: 15,
			sites: 15
		};

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		dataService.GetUsers().then(function (data) {

			AttachListsToUsersData(data);

			vm.users = data;
			console.log("Users for listing = %O", data);
		});



		vm.sendPasswordResetEmail = function (user) {
			dataService.GetEntityById("iOPSUsers", user.Id).then(function (odataUser) {
				odataUser.GeneratePasswordChangeLoginTokenOnSave = 1;
				odataUser.$save().then(function (pwmodUser) {


					console.log("iOPS User with password change token = %O", pwmodUser);

					dataService.GetEntityById("People", pwmodUser.PersonId).then(function (person) {

						dataService.AddEntity("DatabaseMailQueues",
							{
								Subject: "iOPS Pro - Set Password",
								Recipients: person.Email,
								//Body: "https://www.iopspro.com?pwt=" + pwmodUser.PasswordChangeLoginToken
								Body: [
									'JBT Aerotech has been requested to forward you a password reset link. Please click on the link below to set a new password for your account on the iOPSPro asset monitoring system',
									'',
									'<a href="https://www.iOPSPro.com?pwt=' + pwmodUser.PasswordChangeLoginToken + '">Reset my  JBT iOPS Pro password</a>'
									//'<a href="http://localhost/iops?pwt=' + pwmodUser.PasswordChangeLoginToken + '">Reset my Password with Localhost Link</a>',
								].join('<br>')
							});

					});

					signalR.SignalAllClientsInGroup("Admin", "iOPSUser", pwmodUser);
				});
			});


		}



		vm.messageToUser = function (login) {
			var message = prompt("Message to Send:");
			signalR.SignalSpecificClient(login.ClientId, "System.InformationalMessage", message);
		}

		vm.ackAlert = function (login) {
			var message = prompt("Message to Send:");
			signalR.SignalSpecificClient(login.ClientId, "System.AlertMessage", message);
		}

		function AttachListsToUsersData(data) {
			data.forEach(function (u) {

				u.SitesList = u.SiteDataReaders.select(function (sdr) { return sdr.Site.Name }).join(", ");
				u.PrivilegesList = u.UserAuthorizedActivities.select(function (uaa) { return uaa.AuthorizableActivity.Description }).join(", ");


				u.accountStatus = [];
				if (u.Active) {
					u.accountStatus.push("Active");
				} else {
					u.accountStatus.push("Disabled");
				}

				if (u.PasswordChangeLoginToken) {
					u.accountStatus.push("Pending Password Set Via Email");
				}

				u.connectedClients = signalR.connectedClients.where(function (client) { return client.User.User.Username == u.Username });


			});

		}


		vm.deleteUser = function (user) {
			alertify.set({
				labels: {
					ok: "Yes, Delete the User",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});
			var message = 'Are you SURE you want to delete this User? All security settings will also be deleted! ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					//Go and get a "pure" copy of the user before deleting
					//Need the User, UserAuthorizedActivity, and SiteDataReaders collections for the user.
					var collectedData = {};
					$q.all([
							dataService.GetIOPSCollection("UserAuthorizedActivities", "iOPSUserId", user.Id).then(function (aa) {
								//Delete all of the site data reader entries
								return dataService.DeleteEntities(aa);
							}),
							dataService.GetIOPSCollection("SiteDataReaders", "iOPSUserId", user.Id).then(function (sdrEntities) {
								//Delete all of the site data reader entries
								return dataService.DeleteEntities(sdrEntities);
							})
						])
						.then(function () {

							dataService.GetEntityById("iOPSUsers", user.Id).then(function (pureUser) {
								pureUser.Id = -pureUser.Id;
								pureUser.$save().then(function () {
									toastr.success(location.Name, "User was deleted!");
									pureUser.Id = -pureUser.Id;
									signalR.SignalAllClients("iOPSUser.Delete", pureUser);
								});
							});


						});

				} else {
					// user clicked "no"
					toastr.info(location.Name, "User was NOT deleted!");
				}
			});

		}


		vm.scrolledToEnd = function () {
			//console.log("scrolled to end");
		}


		$scope.$on("iOPSUser", function (event, iOPSUser) {
			console.log("Event iOPSUser");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("System.ClientConnectionEstablished", function (event, clientConnection) {
			console.log("Event System.ClientConnectionEstablished");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("System.SignalR.ClientDisconnected", function (event, clientConnection) {
			console.log("Event System.ClientDisconnected");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("iOPSUser.Delete", function (event, iOPSUser) {
			console.log("Event iOPSUser.Delete");
			vm.users = vm.users.where(function (u) { return u.Id != iOPSUser.Id });
		});



	}

	angular
		.module("app")
		.controller("UsersCtrl", [
			"$scope",
			"$state",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$q",
			UsersCtrl
		]);



})();

