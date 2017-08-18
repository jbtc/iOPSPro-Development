(function () {
	"use strict";


	function CompanyEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.CompanyId < 0) {
			$stateParams.CompanyId = 0;
		}


		dataService.GetJBTData().then(function (data) {
			vm.sites = data.Sites.where(function (site) { return site.Name.length < 10 });
		});


		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.

		//+After we have finished obtaining all of the above collections of data, put together the vm.user DTO.
		if ($stateParams.CompanyId > 0) {
			//Existing User

			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.get($stateParams.CompanyId)
				.$promise
				.then(function (data) {
					vm.company = data;
					vm.company.associatedSiteIds = [];

					vm.company.SiteCompanies.forEach(function (sc) {
						vm.company.associatedSiteIds[sc.Site.Id] = true;
					});
					vm.panelTitle = "iOPS Company: " + vm.company.Name + " - " + vm.company.ShortName;
					vm.panelSubtitle = "Editing Existing Company";

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelDimensions(10);

						vm.showScreen = true;
						console.log("vm = %O", vm);
					});


				});



		} else {
			vm.company = {
				Id: 0
			};
			vm.panelTitle = "New Company";
			vm.panelSubtitle = "Enter a new Company for iOPS";
			vm.showScreen = true;

		}


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
			var associatedSiteIdObjects = [];

			console.log("Company to save = %O", vm.company);

			vm.company.associatedSiteIds.forEach(function (enabled, siteId) {
				associatedSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
			});

			dataService.GetEntityById("Companies", vm.company.Id).then(function (odataCompany) {
				odataCompany.Name = vm.company.Name;
				odataCompany.ShortName = vm.company.ShortName;
				odataCompany.Description = vm.company.Description;
				odataCompany.Address = vm.company.Address;

				odataCompany.$save().then(function (modCompany) {


					$q.all(
							//All Sites that are present in the company already associated set, that are not present in the enabled sites list in the company, as delete promise set.
							vm.company
							.SiteCompanies
							.where(function (sc) { return !vm.company.associatedSiteIds[sc.SiteId] })
							.select(function (scToRemoveFromCompany) {
								return dataService.GetIOPSResource("SiteCompanies")
									.filter("CompanyId", vm.company.Id)
									.filter("SiteId", scToRemoveFromCompany.SiteId)
									.query().$promise.then(function (data) {

										var scToDelete = data.first();
										scToDelete.Id = -scToDelete.Id;

										return scToDelete.$save();
									});


							}),

							$q.all(
								associatedSiteIdObjects
								.where(function (en) {
									return en.Enabled && !vm.company.SiteCompanies.any(function (sc) { return sc.SiteId == en.SiteId });
								})
								.select(function (scToInsert) {

									return dataService.AddEntity("SiteCompanies",
									{
										Id: 0,
										SiteId: scToInsert.SiteId,
										CompanyId: vm.company.Id
									});
								})
							)

					).then(function () {
						signalR.SignalAllClientsInGroup("Admin", "Company", modCompany);
						$state.go("^");
					});

				});


			});

		}

	}

	angular
			.module("app")
			.controller("CompanyEditCtrl", [
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
				CompanyEditCtrl
			]);



})();