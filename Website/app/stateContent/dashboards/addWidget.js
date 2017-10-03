(function () {
	"use strict";


	function AddWidgetCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("AddWidgetCtrl invoked");


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


		dataService.GetIOPSCollection("WidgetTypes").then(function (wt) {
			vm.widgetTypes = wt.orderBy(function (t) { return t.CategoryPath }).thenBy(function (wt) { return wt.Name });
			vm.showScreen = true;
			displaySetupService.SetPanelDimensions(20);
		});


		vm.columnWidths = {
			categoryPath: 35,
			name: 20,
			description: 50
		};



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


		vm.widgetTypeIdsToAdd = [];
		var rowStart = 40;

		vm.AddWidget = function(wt) {
					rowStart += 10;
					return dataService.AddEntity("Widgets",
					{
						Name: wt.Name,
						WidgetTypeId: wt.Id,
						ParentDashboardId: $stateParams.DashboardId,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 0,
						Col: 60
					}).then(function(widget) {
						signalR.SignalAllClients("Widget", widget);

					});
			
		}


		vm.Close = function() {
			
				$state.go("^");
				$timeout(function() {
						$state.go("^");
						$timeout(function() {
							$state.go("home.app.dashboard", { DashboardId: $stateParams.DashboardId });

							},
							10);

					},
					10);


		}


		vm.Save = function () {
			console.log("vm.widgetTypeIdsToAdd = %O", vm.widgetTypeIdsToAdd);

			$q.all(
				vm.widgetTypes.where(function(wt) {
					return vm.widgetTypeIdsToAdd[wt.Id];
				})
				.select(function(wt) {
					//Add the widget type to the dashboard
					rowStart += 10;
					return dataService.AddEntity("Widgets",
					{
						Name: wt.Name,
						WidgetTypeId: wt.Id,
						ParentDashboardId: $stateParams.DashboardId,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: rowStart,
						Col: 60
					}).then(function(widget) {
						signalR.SignalAllClients("Widget", widget);

					});
				})
			).then(function () {
				$state.go("^");
				$timeout(function() {
						$state.go("^");
						$timeout(function() {
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
			.controller("AddWidgetCtrl", [
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
				AddWidgetCtrl
			]);



})();