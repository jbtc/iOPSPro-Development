﻿(function () {
	"use strict";


	function GPUSummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {

		var vm = this;


		vm.AddTagsToGraphModal = function (tagObjectCollectionFromWidget) {
			vm.dashboard.tagsToGraph = tagObjectCollectionFromWidget.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
			console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
			if (vm.dashboard.tagsToGraph.length > 0) {
				$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
			} else {
				$rootScope.$broadcast("Dashboard.TagsToGraph", null);
			}
		}


		vm.state = $state;


		vm.widget = $stateParams.widget;
		vm.assetId = $stateParams.assetId;
		vm.dashboard = $stateParams.dashboard;



		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function(data) {
			vm.JBTData = data;
			vm.gpu = data.Assets.first(function (a) { return a.Id == vm.assetId });
			vm.panelTitle = vm.widget.Name;
			vm.panelSubtitle = 'esc to close';

			vm.showScreen = true;


		});


		vm.AddToDashboard = function() {

			dataService.GetEntityById("WidgetTypes", vm.widget.WidgetResource.WidgetTypeId).then(function(wt) {


				return dataService.AddEntity("Widgets",
					{
						Name: 'GPU Summary',
						WidgetTypeId: vm.widget.WidgetResource.WidgetTypeId,
						ParentDashboardId: vm.dashboard.Id,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 100,
						Col: 0,
						AssetId: vm.widget.WidgetResource.AssetId,
						DefaultNavPill: "Amps",
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

		console.log("GPUSummaryModalCtrl invoked = %O", vm);

	}

	angular
			.module("app")
			.controller("GPUSummaryModalCtrl", [
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
				GPUSummaryModalCtrl
			]);



})();