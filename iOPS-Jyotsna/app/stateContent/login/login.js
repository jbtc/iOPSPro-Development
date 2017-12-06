(function () {
	"use strict";


	function LoginCtrl($scope, $rootScope, $state, store, $timeout, securityService, $sce, displaySetupService, utilityService, dataService, $interval, signalR) {
		//console.log("LoginCtrl conroller invoked. xxx");
		var vm = this;

		vm.username = "";
		vm.password = "";

		vm.currentUser = {};

		

		displaySetupService.suppressAllSiteHeaders = true;

		$timeout(function () {
			displaySetupService.suppressAllSiteHeaders = false;

		}, 20);


		vm.PasswordChangeToken = utilityService.GetQuerystringParameterByName("pwt");

		if (vm.PasswordChangeToken) {
			store.remove('currentUser');
			securityService.currentUser = null;
		}

		console.log("Password Change Token = " + utilityService.GetQuerystringParameterByName("pwt"));



		var counter = 0;
		vm.ShowLoginPanel = false;
		vm.showRegisterButtons = false;

		vm.LoginWithUsernameAndPassword = function () {
			console.log("Processing login via username and password...");
			vm.loginType = "username";
			securityService.LoginUserWithUsernameAndPassword(vm.username, $sce.trustAsHtml(vm.password));
		}

		vm.RegisterNewUser = function () {
			vm.loginType = "username";
			securityService.RegisterNewUser(vm.username, vm.password, vm.firstName, vm.lastName, vm.companyName, vm.email, vm.telephone);
		}

		vm.LoginUserWithAccessToken = function () {
			console.log("Processing login via access token...");
			if (!securityService.GetCurrentUser() || !securityService.GetCurrentUser().ODataAccessToken) {
				console.log("No current user found in local store. Seting login panel to be visible.");
				vm.ShowLoginPanel = true;
				return;
			}
			console.log("Processing login via access token...");
			securityService.LoginUserWithAccessToken().then(function (data) {
				if (data) {

				}
			});
		}

		vm.SetNewPassword = function () {
			var user = securityService.GetCurrentUser();
			dataService.GetEntityById("iOPSUsers", user.Id).then(function (userToSave) {
				userToSave.PasswordHash = vm.passwordChoice1;
				userToSave.WillEncryptPasswordOnFirstLogin = true;
				userToSave.PasswordChangeLoginToken = null;
				userToSave.PasswordChangeLoginTokenDate = null;

				userToSave.$save().then(function (data) {
					vm.PasswordChangeToken = "";
					securityService.currentUser = data;
					store.set('currentUser', data);
					signalR.SignalAllClientsInGroup("Admin", "iOPSUser", data);
					securityService.LoginUserWithUsernameAndPassword(data.Username, $sce.trustAsHtml(vm.passwordChoice1));
				});

			});


		}


		$rootScope.$on("securityService:accessTokenInvalid", function (event, user) {
			console.log("LoginCtrl accessToken Invalid event received. User = %O", user);
			vm.currentUser = user;
			vm.ShowLoginPanel = true;


		});

		$rootScope.$on("securityService:authenticated", function (event, user) {
			console.log("LoginCtrl authenticated event received. User = %O", user);
			vm.currentUser = securityService.GetCurrentUser();
			vm.ShowLoginPanel = false;


			if (vm.PasswordChangeToken > "") {
				//When this field is set, the user has been issued an email based login token.
				//They are logged in, but not all the way.
				vm.ShowLoginPanel = true;
				securityService.showMenu = false;
				vm.pwUser = user;
			} else {
				securityService.showMenu = true;
				$state.go("home.app");

			};


		});

		$rootScope.$on("securityService:unauthenticated", function (event, user) {
			console.log("LoginCtrl unauthenticated event received");
			alertify.alert("Username or Password is not valid.");
			vm.username = "";
			vm.password = "";
			vm.currentUser = user;
			vm.isPanelVisible = true;
			$scope.$apply();

		});

		$rootScope.$on("logout", function (event, user) {
			console.log("LoginCtrl logout event received");
			vm.username = "";
			vm.password = "";
			store.remove('currentUser');
			securityService.currentUser = null;
			top.location.href = "/";
			//$state.go('home');
			vm.isPanelVisible = true;
		});

		$rootScope.$on("securityService.invalidAccount", function (event, user) {
			alertify.alert("Username or Password is not valid!");

			if (utilityService.GetQuerystringParameterByName("pwt") == "") {

				console.log("LoginCtrl logout event received");
				vm.username = "";
				vm.password = "";
				store.remove('currentUser');
				securityService.currentUser = null;
				$state.go('home');
				vm.isPanelVisible = true;
			}
		});


		$timeout(function () {
			$(function () {
				var timingValue = 150;
				$('#login-form-link').click(function (e) {
					$("#login-form").delay(timingValue).fadeIn(timingValue);
					$("#register-form").fadeOut(timingValue);
					$('#register-form-link').removeClass('active');
					$(this).addClass('active');
					e.preventDefault();
				});
				$('#register-form-link').click(function (e) {
					$("#register-form").delay(timingValue).fadeIn(timingValue);
					$("#login-form").fadeOut(timingValue);
					$('#login-form-link').removeClass('active');
					$(this).addClass('active');
					e.preventDefault();
				});

			});
			$scope.$apply();


		}, 200);


		vm.LoginUserWithAccessToken = function () {
			console.log("Processing login via access token...");
			if (vm.PasswordChangeToken == "") {
				if ((!securityService.GetCurrentUser() || !securityService.GetCurrentUser().ODataAccessToken) && vm.PasswordChangeToken == "") {
					console.log("No current user found in local store. Seting login panel to be visible.");
					vm.ShowLoginPanel = true;
					return;
				}
			}
			console.log("Processing login via password change token...");
			securityService.LoginUserWithAccessToken().then(function (data) {
				if (data && data != "") {
					vm.pwUser = data;
					if (data.PasswordChangeLoginToken && vm.PasswordChangeToken > "") {
						vm.PasswordChangeToken = data.PasswordChangeLoginToken;
						vm.ShowLoginPanel = true;
						//store.remove('currentUser');
						//securityService.currentUser = null;
						securityService.showMenu = false;
						return;
					}


				} else {
					vm.PasswordChangeToken = "";
					store.remove('currentUser');
					securityService.currentUser = null;
					document.location = webRoot;

				}
			});
		}

		vm.LoginUserWithAccessToken();



	}

	angular
			.module("app")
			.controller("LoginCtrl", [
				"$scope",
				"$rootScope",
				"$state",
				'store',
				"$timeout",
				"securityService",
				"$sce",
				"displaySetupService",
				"utilityService",
				"dataService",
				"$interval",
				"signalR",
				LoginCtrl
			]);



})();  //Login Ctrl
