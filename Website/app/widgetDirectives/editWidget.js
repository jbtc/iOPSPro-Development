//++EditWidget Controller
(function () {
	"use strict";


	function EditWidgetCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("EditWidgetCtrl invoked");


		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.DashboardId < 0) {
			$stateParams.DashboardId = 0;
		}

		dataService.GetEntityById("Widgets", $stateParams.WidgetId).then(function (data) {

			vm.widget = data;
			vm.showScreen = true;
			console.log("widget = %O", vm.widget);
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
			vm.widget.$save().then(function (data) {
				signalR.SignalAllClients("Widget", data);
				$state.go("^");
				$timeout(function () {
						$state.go("^");
						$timeout(function () {
								$state.go("home.app.dashboard", { DashboardId: $stateParams.DashboardId });

							},
							10);

					},
					10);
			});
		}

	}

	angular
		.module("app")
		.controller("EditWidgetCtrl", [
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
			EditWidgetCtrl
		]);



})();
