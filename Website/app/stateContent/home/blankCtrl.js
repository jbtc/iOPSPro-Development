(function () {
	"use strict";


	function BlankCtrl($scope, displaySetupService, $interval, dataService) {
		var vm = this;

		console.log("BlankCtrl invoked");
		vm.displaySetupService = displaySetupService;

		vm.loadingMessage = "Is Initializing for Performance ";
		vm.dataService = dataService;

		function AddDotToMessage() {
			vm.loadingMessage += ".";
		}

		vm.updateInterval = $interval(function () {
			AddDotToMessage();
		}, 500);


		$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.updateInterval);
					
        });

	}

	angular
			.module("app")
			.controller("BlankCtrl", [
				"$scope",
                "displaySetupService",
				"$interval",
				"dataService",
				BlankCtrl
			]);



})();