//++GraphicsCatalog Controller
(function () {
	"use strict";


	function GraphicsCatalogCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("GraphicsCatalogCtrl conroller invoked.");
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



		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		console.log("Load Data");


		dataService.GetIOPSResource("Sites")
			.expandPredicate("SystemGroups")
			.expand()
			.finish()


		$scope.$$postDigest(function () {
			displaySetupService.SetPanelDimensions();
		});




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
		.controller("GraphicsCatalogCtrl", [
			"$scope",
			"$state",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$timeout",
			GraphicsCatalogCtrl
		]);



})();

