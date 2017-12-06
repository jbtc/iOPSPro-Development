/// <reference path="building.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
	"use strict";


	function UsersCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("UsersCtrl conroller invoked.");
		var vm = this;




		vm.columnWidths = {
			name: 10,
			company: 10,
			username: 10,
			email: 15,
			phone: 10,
			privileges: 20,
			accountStatus: 15,
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

					dataService.GetEntityById("People", pwmodUser.PersonId).then(function(person) {

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



			});

		}


		vm.delete = function (user) {

			//Go and get a "pure" copy of the user before deleting
			dataService.GetUser(user.Id).then(function (pureUser) {
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
						pureUser.$save().then(function () {
							toastr.success(location.Name, "User was deleted!");
						});




					} else {
						// user clicked "no"
						toastr.info(location.Name, "User was NOT deleted!");
					}
				});
			});

		}


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}


		$scope.$on("iOPSUser", function (event, iOPSUser) {
			console.log("Event iOPSUser");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

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
				UsersCtrl
			]);



})();