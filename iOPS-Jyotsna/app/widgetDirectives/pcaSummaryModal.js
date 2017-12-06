(function () {
	"use strict";


	function PCASummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("PCASummaryModalCtrl invoked");


		var vm = this;

		vm.state = $state;


		vm.widget = $stateParams.widget;
		vm.assetId = $stateParams.assetId;
		vm.dashboard = $stateParams.dashboard;

		console.log("PCASummaryModalCtrl widget = %O", vm.widget);

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function(data) {
			vm.JBTData = data;
			vm.pca = data.Assets.first(function (a) { return a.Id == vm.assetId });
			vm.panelTitle = vm.widget.Name;
			vm.panelSubtitle = 'esc to close';

			dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.assetId).then(function() {
				vm.showScreen = true;
			});


		});


		vm.AddToDashboard = function() {

			dataService.GetEntityById("WidgetTypes", vm.widget.WidgetResource.WidgetTypeId).then(function(wt) {


				return dataService.AddEntity("Widgets",
					{
						Name: 'PCA Summary',
						WidgetTypeId: vm.widget.WidgetResource.WidgetTypeId,
						ParentDashboardId: vm.dashboard.Id,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 100,
						Col: 0,
						AssetId: vm.widget.WidgetResource.AssetId,
						DefaultNavPill: "Press",
						GateSystemId: vm.widget.WidgetResource.GateSystemId,
						SiteId: vm.widget.WidgetResource.SiteId,
						SplitLeftPercentage: 50,
						SplitRightPercentage: 50,
						SystemId: vm.widget.WidgetResource.SystemId,
						TerminalSystemId: vm.widget.WidgetResource.TerminalSystemId,
						ZoneSystemId: vm.widget.WidgetResource.ZoneSystemId
					}).then(function(widget) {
						signalR.SignalAllClients("WidgetAdded", widget);
				});


			});

		}


		hotkeys.bindTo($scope)
		.add({
			combo: 'esc',
			description: 'Cancel and close any input form',
			allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
			callback: function () {
				$state.go("^");
			}
		});


	}

	angular
			.module("app")
			.controller("PCASummaryModalCtrl", [
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
				PCASummaryModalCtrl
			]);



})();