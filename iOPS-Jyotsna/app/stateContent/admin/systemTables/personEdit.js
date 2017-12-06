(function () {
	"use strict";


	function PersonEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
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




		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.

		//+After we have finished obtaining all of the above collections of data, put together the vm.person object
		$q.all([

			//+All of the state by state abbreviations for the address field
			dataService.GetStateAbbreviations().then(function (data) {
				vm.unitedStates = data;
			}),

			//+The Person
			$stateParams.PersonId > 0 ?
				dataService.GetIOPSResource("People")
				.get($stateParams.PersonId)
				.$promise
				.then(function (data) {

					console.log("Person to edit = %O", data);
					vm.person = data;

				}) : $q.when(true)

		]).then(function () {


			if (vm.person) {
				vm.panelTitle = "iOPS Person: ";
				vm.panelSubtitle = "Editing Existing Person";
			} else {


				vm.person = { Id: 0 };
				vm.panelTitle = "iOPS Person: ";
				vm.panelSubtitle = "Adding New Person";


			}

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions(10);

				vm.showScreen = true;
				console.log("vm = %O", vm);
			});

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

			dataService.GetEntityById("People", vm.person.Id).then(function (odataPerson) {
				odataPerson.FamilyName = vm.person.FamilyName;
				odataPerson.GivenName = vm.person.GivenName;
				odataPerson.MiddleName = vm.person.MiddleName;
				odataPerson.StreetAddress1 = vm.person.StreetAddress1;
				odataPerson.StreetAddress2 = vm.person.StreetAddress2;
				odataPerson.CountryId = vm.person.CountryId;
				odataPerson.Phone = vm.person.Phone;
				odataPerson.Email = vm.person.Email;
				odataPerson.Title = vm.person.Title;
				odataPerson.City = vm.person.City;
				odataPerson.State = vm.person.State;
				odataPerson.ZipCode = vm.person.ZipCode;

				odataPerson.$save().then(function (modPerson) {



					signalR.SignalAllClientsInGroup("Admin", "Person", modPerson);
					$state.go("^");
				});

			});



		}

	}

	angular
			.module("app")
			.controller("PersonEditCtrl", [
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
				PersonEditCtrl
			]);



})();