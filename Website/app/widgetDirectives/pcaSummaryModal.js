(function () {
	"use strict";


	function PCASummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("PCASummaryModalCtrl invoked");


		var vm = this;

		vm.state = $state;





		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function(data) {
			vm.JBTData = data;
			vm.pca = data.Assets.first(function (a) { return a.Id == $stateParams.assetId });
			dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory($stateParams.assetId);
			
		})





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