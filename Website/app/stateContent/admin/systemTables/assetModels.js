//++Asset Models Controller
(function () {
	"use strict";


	function AssetModelsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $q) {
		console.log("AssetModelsCtrl conroller invoked.");
		var vm = this;

		vm.columnWidths = {
			name: 20,
			description: 50,
			graphicsPath: 30

		};

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		vm.assetModels = dataService.GetCache().assetModels;
		console.log("assetModels = %O", vm.assetModels);

		$scope.$on("AssetModel", function (event, assetModel) {

			console.log("AssetModel change. AssetModel = %O", assetModel);
			vm.assetModels = [assetModel].concat(vm.assetModels).distinct(function (a, b) { return a.Id == b.Id });

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
		.module("app")
		.controller("AssetModelsCtrl", [
			"$scope",
			"$state",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$q",
			AssetModelsCtrl
		]);



})();

