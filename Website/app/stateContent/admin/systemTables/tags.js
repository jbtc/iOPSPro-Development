//++Tags Controller
(function () {
	"use strict";


	function TagsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("TagsCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			company: 10,
			equipment: 10,
			tagId: 5,
			tagName: 50,
			observationName: 25,
			date: 20,
			value: 80,
			dataChangeCount: 15
		};


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
			}, 250);

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



		vm.searchText = "";

		function GetFormattedTags() {
			dataService.GetTags().then(function (data) {
				vm.totalChangeCount = 0;
				vm.tags = data
					.where(function (d) { return (vm.searchText == "" || d.Name.toUpperCase().indexOf(vm.searchText.toUpperCase()) > -1) })
					.orderBy(function (tag) { return tag.Name });
			});

		}


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}

	}

	angular
		.module("app")
		.controller("TagsCtrl", [
			"$scope",
			"$state",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$timeout",
			TagsCtrl
		]);



})();

