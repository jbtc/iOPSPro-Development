//++EditDashboard Controller
(function () {
	"use strict";


	function EditDashboardCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("EditDashboardCtrl invoked");


		var vm = this;

		vm.state = $state;


		$scope.$on("$destroy",
			function () {
				console.log("Destroyed settings controller");
				$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
			});


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

		($stateParams.DashboardId > 0
			? dataService.GetEntityById("Dashboards", $stateParams.DashboardId)
			: $q.when({ CreatorUserId: Global.User.Id })).then(function (dashboard) {


			dataService.GetIOPSCollection("DashboardTimeScopes").then(function (data) {
				vm.DashboardTimeScopes = data;
				vm.dashboard = dashboard;
				if (vm.dashboard.CustomStartDate) {
					vm.dashboard.CustomStartDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomStartDate);
				}
				if (vm.dashboard.CustomEndDate) {
					vm.dashboard.CustomEndDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomEndDate);
				}
				vm.endDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomEndDate);
				vm.showScreen = true;
				if (vm.dashboard.CustomStartDate || vm.dashboard.CustomEndDate) {
					vm.dashboard.TimeScopeId = null;
				}

				console.log("dashboard = %O", vm.dashboard);
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

		$scope.$watch("vm.dashboard.TimeScopeId",
			function (newValue, oldValue) {
				if (newValue > 0) {
					vm.dashboard.CustomStartDate = null;
					vm.dashboard.CustomEndDate = null;

				}

			}
		);



		$scope.$watch("vm.dashboard.CustomStartDate",
			function (newValue, oldValue) {
				if (vm.dashboard && vm.dashboard.CustomStartDate && vm.dashboard.CustomEndDate) {
					vm.dashboard.TimeScopeId = null;
				}

			}
		);

		$scope.$watch("vm.dashboard.CustomEndDate",
			function (newValue, oldValue) {
				if (vm.dashboard && vm.dashboard.CustomStartDate && vm.dashboard.CustomEndDate) {
					vm.dashboard.TimeScopeId = null;
				}

			}
		);


		vm.Save = function () {



			if (vm.dashboard.TimeScopeId && vm.dashboard.TimeScopeId > 0) {
				vm.dashboard.CustomStartDate = null;
				vm.dashboard.CustomEndDate = null;
			}

			if (vm.dashboard.CustomStartDate) {
				vm.dashboard.CustomStartDate = utilityService.GetNonUTCQueryDate(vm.dashboard.CustomStartDate);
			}

			if (vm.dashboard.CustomEndDate) {
				vm.dashboard.CustomEndDate = utilityService.GetNonUTCQueryDate(vm.dashboard.CustomEndDate);
			}

			if (!vm.dashboard.TimeScopeId && !vm.dashboard.CustomStartDate && !vm.dashboard.CustomEndDate) {
				vm.dashboard.TimeScopeId = 6;
			}

			console.log("vm.dashboard = %O", vm.dashboard);

			($stateParams.DashboardId > 0 ? vm.dashboard.$save() : dataService.AddEntity("Dashboards", vm.dashboard))
				.then(function (data) {

					dataService.GetExpandedDashboardById(data.Id).then(function (modifiedExpandedDashboard) {
						signalR.SignalAllClients("Dashboard", modifiedExpandedDashboard);
						$state.go("^");
					});

				});
		}

	}

	angular
		.module("app")
		.controller("EditDashboardCtrl", [
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
			EditDashboardCtrl
		]);



})();

