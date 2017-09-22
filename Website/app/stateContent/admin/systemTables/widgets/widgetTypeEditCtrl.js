(function () {
	"use strict";


	function WidgetTypeEditCtrl($state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;
		vm.showScreen = false;


		uibButtonConfig.activeClass = 'radio-active';
		vm.initialHeights =  mx.range(10, 51).toArray();
		vm.initialWidths =  mx.range(10, 51).toArray();
		vm.Path = $stateParams.Path;
		vm.panelHeadingSubtitle = "For widget that is related to " + $stateParams.Path.split(".").join(" --> ") + "s";
		
		if ($stateParams.WidgetTypeId > 0) {
			//Existing widget type

			dataService.GetEntityById("WidgetTypes",$stateParams.WidgetTypeId).then(function (wt) {
				vm.widgetType = wt;
				vm.originalWidgetType = angular.copy(wt);
				vm.panelTitle = "" + vm.widgetType.DataTypeCode + " - " + vm.widgetType.Name;
				vm.showScreen = true;
				console.log("vm.widgetType = %O", vm.widgetType);

			});



		} else {
			vm.widgetType = {
				Id: 0,
				CategoryPath: vm.Path
			};
			vm.panelTitle = "New Widget Type";
			vm.showScreen = true;
			console.log("vm.widgetType = %O", vm.widgetType);

		}

		vm.developmentPriorities = mx.range(1, 10).toArray();

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
			(vm.widgetType.Id > 0 ? vm.widgetType.$save() : dataService.AddEntity("WidgetTypes",vm.widgetType)).then(function (data) {
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
				WidgetTypeEditCtrl
			]);



})();