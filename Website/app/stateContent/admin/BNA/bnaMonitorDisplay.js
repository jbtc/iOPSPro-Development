/// <reference path="site.js" />
(function ()
{
	"use strict";


	function BNAMonitorDisplayCtrl($scope, $state, displaySetupService, dataService, signalR, $interval)
	{
		console.log("BNAMonitorDisplayCtrl conroller invoked.");
		var vm = this;



		vm.buttonPanelWidth = 70;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();



		function LoadData() {
			
				dataService.GetLastXBHSAlarms(50).then(function(data) {
					vm.alarms = data;
				});
		}


		LoadData();

		vm.loopInterval = $interval(function() {
				LoadData();

			},
			1000);



		$scope.$on("$destroy",
                function () {
                    $interval.cancel(vm.loopInterval);
                });

		

		vm.scrolledToEnd = function() {
			console.log("scrolled to end");
		}
		

		

	}

	angular
			.module("app")
			.controller("BNAMonitorDisplayCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
				"$interval",
				BNAMonitorDisplayCtrl
			]);



})();