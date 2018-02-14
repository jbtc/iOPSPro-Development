//++WidgetTypeEdit Controller
(function () {
	"use strict";


	function WidgetTypeEditCtrl($state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR, $q) {
		var vm = this;

		vm.state = $state;

		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;
		vm.showScreen = false;


		uibButtonConfig.activeClass = 'radio-active';
		vm.initialHeights = mx.range(3, 31).toArray();
		vm.initialWidths = mx.range(3, 31).toArray();
		vm.Path = $stateParams.Path;
		vm.panelHeadingSubtitle = "For widget that is related to " + $stateParams.Path.split(".").join(" --> ") + "s";

		if ($stateParams.WidgetTypeId > 0) {
			//Existing widget type
			$q.all([
				dataService.GetEntityById("WidgetTypes", $stateParams.WidgetTypeId).then(function (data) { vm.widgetType = data }),
				dataService.GetIOPSCollection("WidgetTypeTabGroups").then(function (data) { vm.widgetTypeTabGroups = data })
			]).then(function () {
				vm.originalWidgetType = angular.copy(vm.widgetType);
				vm.panelTitle = "" + vm.widgetType.CategoryPath + " - " + vm.widgetType.Name;


				vm.isAvailableToAdmin = vm.widgetType.IsAvailableToAdmin ? 1 : 0;
				vm.isAvailableToAll = vm.widgetType.IsAvailableToAll ? 1 : 0;
				vm.hasSettings = vm.widgetType.HasSettings ? 1 : 0;
				vm.showScreen = true;
				console.log("widgetTypeEdit Controller = %O", vm);


				console.log("vm.widgetType = %O", vm.widgetType);

			});

			dataService.GetEntityById("WidgetTypes", $stateParams.WidgetTypeId).then(function (wt) {
				vm.widgetType = wt;
			});

		} else {
			vm.widgetType = {
				Id: 0,
				CategoryPath: vm.Path
			};
			dataService.GetIOPSCollection("WidgetTypeTabGroups").then(function (data) { vm.widgetTypeTabGroups = data })
			vm.panelTitle = "New Widget Type";
			vm.showScreen = true;
			console.log("vm.widgetType = %O", vm.widgetType);
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
			vm.widgetType.IsAvailableToAdmin = vm.isAvailableToAdmin == 1 ? true : false;
			vm.widgetType.IsAvailableToAll = vm.isAvailableToAll == 1 ? true : false;
			vm.widgetType.IsHiddenSystemType = vm.isHiddenSystemType == 1 ? true : false;
			vm.widgetType.HasSettings = vm.hasSettings == 1 ? true : false;

			(vm.widgetType.Id > 0 ? vm.widgetType.$save() : dataService.AddEntity("WidgetTypes", vm.widgetType)).then(function (data) {
				signalR.SignalAllClientsInGroup("Admin", "WidgetType", data);
				$state.go("^");
			});
		}

	}

	angular
		.module("app")
		.controller("WidgetTypeEditCtrl", [
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
			"$q",
			WidgetTypeEditCtrl
		]);



})();

