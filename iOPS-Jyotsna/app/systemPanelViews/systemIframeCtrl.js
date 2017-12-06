(function ()
{
	"use strict";


	function SystemIframeCtrl($state, $stateParams, $sce, $scope, displaySetupService, $timeout, hotkeys)
	{
		var vm = this;


		console.log("SystemIframeCtrl invoked");
		displaySetupService.SetPanelDimensions();

		vm.reportTitle = $stateParams.title;

		vm.state = $state;

		vm.url = $sce.trustAsResourceUrl($stateParams.url);

		console.log($stateParams);

		
		$scope.$emit("dataLoaded", null);

		$timeout(function() {
			displaySetupService.SetPanelDimensions();
		}, 500);



	}

	angular
			.module("app")
			.controller("SystemIframeCtrl", [
				"$state",
				"$stateParams",
				"$sce",
				"$scope",
				"displaySetupService",
				"$timeout",
				"hotkeys",
				SystemIframeCtrl
			]);



})();