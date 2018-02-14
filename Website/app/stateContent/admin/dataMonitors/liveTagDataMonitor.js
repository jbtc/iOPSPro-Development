//++LiveTagDataMonitor Controller
(function () {
	"use strict";


	function LiveTagDataMonitorCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout, utilityService) {
		console.log("LiveTagDataMonitorCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			company: 4,
			terminal: 4,
			zone: 4,
			gate: 4,
			equipment: 4,
			tagId: 5,
			tagName: 40,
			observationName: 25,
			date: 20,
			value: 80,
			dataChangeCount: 15
		};


		vm.dataService = dataService;


		$scope.$on("dataService.ready", function (event, course) {
			LoadData();

		});

		if (dataService.IsReady) {
			LoadData();
		}

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();
		vm.tags = [];



		function LoadData() {
			console.log("Load Data");

			//Set up interval that re-loads the vm tags. They will update that often.
			vm.updateInterval = $interval(function () {
				GetFormattedTags();
			}, 1000);

			$scope.$on("$destroy",
				function () {
					$interval.cancel(vm.updateInterval);
				});


			//Load the first time for responsiveness.
			GetFormattedTags();

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions();
			});
		}

		function GetFormattedTags() {
			dataService.GetTags().then(function (data) {
				vm.totalChangeCount = 0;

				var upperSearchText;
				if (vm.searchText) {
					upperSearchText = vm.searchText.toUpperCase();
				}

				vm.tags = data
					.where(function (t) {
						if (vm.searchText == '' || !vm.searchText) {
							return true;
						}


						return t.TagName.toUpperCase().indexOf(upperSearchText) >= 0 || t.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) >= 0 || t.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) >= 0;
					})
					.orderByDescending(function (t) { return t.PLCUTCDateMS })
					.take(100);


				//console.log("vm.tags = %O", vm.tags);


			});
		}


		vm.scrolledToEnd = function () {
			//console.log("scrolled to end");
		}

	}

	angular
		.module("app")
		.controller("LiveTagDataMonitorCtrl", [
			"$scope",
			"$state",
			"$stateParams",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$timeout",
			"utilityService",
			LiveTagDataMonitorCtrl
		]);



})();

