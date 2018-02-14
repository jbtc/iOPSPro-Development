//++UserEdit Controller
(function () {
	"use strict";


	function UserEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.UserId < 0) {
			$stateParams.UserId = 0;
		}


		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.
		$q.all([
				//+An expanded user object from the data service.
				//It includes the authorized activities, and the enabled sites that the user can read.
				$stateParams.UserId > 0 ?
				dataService.GetIOPSResource("iOPSUsers")
				.expand("Person")
				.expandPredicate("UserAuthorizedActivities")
				.expand("AuthorizableActivity")
				.finish()
				.expandPredicate("SiteDataReaders")
				.expand("Site")
				.finish()
				.get($stateParams.UserId)
				.$promise.then(function (user) {
					vm.user = user;
					console.log("vm.user = %O", vm.user);
				}) : $q.when(function () {
					vm.user = {
						Id: 0,
						Person: {}
					};
				}),

				//+All of the state by state abbreviations for the address field
				dataService.GetStateAbbreviations().then(function (data) {
					vm.unitedStates = data;
				}),

				//+The locally maintained collection of all of the lookup data
				dataService.GetJBTData().then(function (JBTData) {
					vm.JBTData = JBTData;

					//Some of the sites are test ones. This will filter those out.
					vm.sites = JBTData.Sites.where(function (site) { return site.Name.length < 10 });
				}),


				//+The dictionary of authorizable activities
				dataService.GetAuthorizableActivities().then(function (data) {
					vm.authorizableActivities = data;
				})

			]
		).then(function () {


			//+After we have finished obtaining all of the above collections of data, put together the vm.user DTO.
			if ($stateParams.UserId > 0) {
				//Existing User


				vm.panelTitle = "Username: " + vm.user.Username + " - " + vm.user.Person.GivenName + " " + vm.user.Person.FamilyName;
				vm.panelSubtitle = "Editing Existing User";

				//Set the state id for the user address. This is needed by id for the selection picker dropdown.
				vm.user.Person.StateId = !vm.user.Person.State ? 1 : vm.unitedStates.first(function (s) { return s.Abbreviation == vm.user.Person.State }).Id;

				//Setup the user.authorizedActivityIds array based on the authorizations they now have. This will make the buttons light up.


				vm.user.authorizedActivityIds = [];
				vm.user.UserAuthorizedActivities.forEach(function (a) {
					vm.user.authorizedActivityIds[a.AuthorizableActivity.Id] = true;
				});


				//Setup the user.enabledSiteIds array based on the sites they now have. This will make the buttons light up.
				vm.user.enabledSiteIds = [];

				vm.user.SiteDataReaders.forEach(function (sdr) {
					vm.user.enabledSiteIds[sdr.Site.Id] = true;
				});


				$scope.$$postDigest(function () {
					displaySetupService.SetPanelDimensions(10);

					utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
					vm.showScreen = true;
					console.log("vm = %O", vm);
				});

				$scope.$watch("vm.user.Person.Email",
					function (newValue, oldValue) {
						if (newValue.indexOf("@") > 0) {
							console.log("New email detected");
						}


					});


			} else {
				vm.user = {
					Id: 0,
					Person: {}
				};

				vm.user.authorizedActivityIds = [];

				vm.authorizableActivities.forEach(function (aa) {
					vm.user.authorizedActivityIds[aa.Id] = false;
				});

				//Setup the user.enabledSiteIds array from the sites list.
				vm.user.enabledSiteIds = [];

				vm.sites.forEach(function (s) {
					vm.user.enabledSiteIds[s.Id] = false;
				});


				vm.panelTitle = "New User";
				vm.panelSubtitle = "Enter a new User for iOPS";
				vm.showScreen = true;

				$scope.$$postDigest(function () {
					displaySetupService.SetPanelDimensions(10);

					utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
					vm.showScreen = true;
					console.log("vm = %O", vm);
				});

				$scope.$watch("vm.user.Person.Email",
					function (newValue, oldValue) {
						if (newValue) {
							if (newValue.indexOf("@") > 0) {
								console.log("New email detected");
								dataService.GetIOPSCollection("People", "Email", vm.user.Person.Email).then(function (odataPeople) {
									var odataPersonByEmailLookup = odataPeople.first();
									if (odataPersonByEmailLookup) {
										odataPersonByEmailLookup.StateId = !odataPersonByEmailLookup.State ? 1 : vm.unitedStates.first(function (s) { return s.Abbreviation == odataPersonByEmailLookup.State }).Id;
										vm.user.Person = odataPersonByEmailLookup;
										utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
									}
								});


							}
						}


					});
			}



		});





		hotkeys.bindTo($scope)
			.add({
				combo: 'ctrl+s',
				description: 'Save and Close any form data input form',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function () {
					event.preventDefault();
					vm.Save();

				}
			})
			.add({
				combo: 'esc',
				description: 'Cancel and close any input form',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function () {
					$state.go("^");
				}
			});




		vm.Save = function () {



			var person;
			var iOPSUser;

			if (!vm.user.Person.Email || !vm.user.Person.Email > "") {
				alertify.alert("User MUST have an email address",
					function (e) {
						return;
					});

			}


			vm.enabledSiteIdObjects = [];


			if (!vm.user.enabledSiteIds) {
				vm.user.enabledSiteIds = [];
			}



			vm.user.enabledSiteIds.forEach(function (enabled, siteId) {
				vm.enabledSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
			});

			vm.authorizedActivityIdObjects = [];
			vm.user.authorizedActivityIds.forEach(function (enabled, activityId) {
				vm.authorizedActivityIdObjects.push({ AuthorizableActivityId: activityId, Enabled: enabled });
			});


			console.log("enabledSiteIdObjects = %O", vm.enabledSiteIdObjects);



			//Get the person with the same email address, or add one.
			dataService.GetIOPSCollection("People", "Email", vm.user.Person.Email).then(function (odataPeople) {

				var odataPerson = odataPeople.first();

				if (odataPerson) {

					//update the properties of the person who was already there.

					odataPerson.GivenName = vm.user.Person.GivenName;
					odataPerson.MiddleName = vm.user.Person.MiddleName;
					odataPerson.FamilyName = vm.user.Person.FamilyName;
					odataPerson.StreetAddress1 = vm.user.Person.StreetAddress1;
					odataPerson.StreetAddress2 = vm.user.Person.StreetAddress2;
					odataPerson.Phone = vm.user.Person.Phone;
					odataPerson.Email = vm.user.Person.Email;
					odataPerson.Title = vm.user.Person.Title;
					odataPerson.City = vm.user.Person.City;
					odataPerson.State = vm.user.Person.State;
					odataPerson.ZipCode = vm.user.Person.ZipCode;
					return odataPerson.$save();

				} else {
					//Add a new person who was not already there by email address.
					return dataService.AddEntity("People",
						{
							GivenName: vm.user.Person.GivenName,
							MiddleName: vm.user.Person.MiddleName,
							FamilyName: vm.user.Person.FamilyName,
							StreetAddress1: vm.user.Person.StreetAddress1,
							StreetAddress2: vm.user.Person.StreetAddress2,
							Phone: vm.user.Person.Phone,
							Email: vm.user.Person.Email,
							Title: vm.user.Person.Title,
							City: vm.user.Person.City,
							State: vm.user.Person.State,
							ZipCode: vm.user.Person.ZipCode
						});

				}
			}).then(function (person) {

				vm.odataPerson = person;
				console.log("Person who was saved = %O", person);
				//Go and get a pure user object or create one if this is a new user with an Id of 0
				(vm.user.Id > 0
					? dataService.GetEntityById("iOPSUsers", vm.user.Id).then(function (u) {
						u.Username = vm.user.Username;
						u.Active = true;
						return u.$save();
					})
					: dataService.AddEntity("iOPSUsers", { Id: 0, Username: vm.user.Username, PersonId: vm.odataPerson.Id, Active: true })).then(function (user) {
					vm.odataUser = user;
					vm.user.Id = vm.odataUser.Id;
					vm.odataUser.Username = vm.user.Username;

					SaveRestOfRecord();
				});

			});





		}

		function SaveRestOfRecord() {
			return $q.all([

				//+Promise to reconcile the site data readers items from the DTO enabledSiteIds
				vm.user.SiteDataReaders
				? $q.all(
					//All Sites that are present in the users already enabled set, that are not present in the enabled sites list in the userDTO, as delete promise set.
					vm.user
					.SiteDataReaders
					.where(function (sdr) { return !vm.user.enabledSiteIds[sdr.SiteId] })
					.select(function (sdrToRemoveFromUser) {
						return dataService.GetIOPSResource("SiteDataReaders")
							.filter("iOPSUserId", vm.user.Id)
							.filter("SiteId", sdrToRemoveFromUser.SiteId)
							.query().$promise.then(function (data) {

								var sdrToDelete = data.first();
								sdrToDelete.Id = -sdrToDelete.Id;

								return sdrToDelete.$save();
							});


					})
				)
				: $q.when(true),

				$q.all(
					vm.enabledSiteIdObjects
					.where(function (en) {
						return en.Enabled && !vm.user.SiteDataReaders.any(function (sdr) { return sdr.SiteId == en.SiteId })
					})
					.select(function (sdrToInsert) {

						return dataService.AddEntity("SiteDataReaders",
							{
								Id: 0,
								SiteId: sdrToInsert.SiteId,
								iOPSUserId: vm.user.Id
							});
					})
				),


				//+Promise to reconcile the authorized activities
				$q.all(
					//Deletions.
					vm.user.UserAuthorizedActivities
					? vm.user
					.UserAuthorizedActivities
					.where(function (uaa) { return !vm.user.authorizedActivityIds[uaa.AuthorizableActivityId] })
					.select(function (aaToRemoveFromUser) {
						return dataService.GetIOPSResource("UserAuthorizedActivities")
							.filter("iOPSUserId", vm.user.Id)
							.filter("AuthorizableActivityId", aaToRemoveFromUser.AuthorizableActivityId)
							.query().$promise.then(function (data) {

								var aaToDelete = data.first();
								aaToDelete.Id = -aaToDelete.Id;

								return aaToDelete.$save();
							});


					})
					: $q.when(true)
				),


				//Insertions
				$q.all(

					vm.authorizedActivityIdObjects
					.where(function (aao) { return aao.Enabled && vm.user.UserAuthorizedActivities && !vm.user.UserAuthorizedActivities.any(function (uaa) { return uaa.AuthorizableActivityId == aao.AuthorizableActivityId }) })
					.select(function (aaToInsert) {

						return dataService.AddEntity("UserAuthorizedActivities",
							{
								Id: 0,
								AuthorizableActivityId: aaToInsert.AuthorizableActivityId,
								iOPSUserId: vm.user.Id
							});
					})
				)

			]).then(function () {
				signalR.SignalAllClientsInGroup("Admin", "iOPSUser", vm.odataUser);
				$state.go("^");

			});
		}
	}

	angular
		.module("app")
		.controller("UserEditCtrl", [
			"$q",
			"$state",
			"$rootScope",
			"$scope",
			"securityService",
			"dataService",
			"$stateParams",
			"utilityService",
			"$timeout",
			"uibButtonConfig",
			"hotkeys",
			"$interval",
			"displaySetupService",
			"signalR",
			UserEditCtrl
		]);



})();

