//++AssetModelEdit Controller
(function () {
	"use strict";


	function AssetModelEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.AssetModelId < 0) {
			$stateParams.AssetModelId = 0;
		}




		if ($stateParams.AssetModelId > 0) {
			//Existing Asset Model

			dataService.GetEntityById("AssetModels", $stateParams.AssetModelId)
				.then(function (data) {
					vm.assetModel = data;

					vm.panelTitle = "iOPS Asset Model Type: " + vm.assetModel.Name + " - ";
					vm.panelSubtitle = "Editing Existing Asset Model Type";

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelDimensions(10);

						vm.showScreen = true;
						console.log("vm = %O", vm);
					});


				});



		} else {
			vm.assetModel = {
				Id: 0
			};
			vm.panelTitle = "New Asset Model Type";
			vm.panelSubtitle = "Enter a new Asset Model Type for iOPS";
			vm.showScreen = true;

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

			console.log("Asset Model to save = %O", vm.assetModel);

			(vm.assetModel.Id > 0
				? dataService.GetEntityById("AssetModels", vm.assetModel.Id).then(function (odataAssetModel) {
					odataAssetModel.Name = vm.assetModel.Name;
					odataAssetModel.Size = vm.assetModel.Size;
					odataAssetModel.Description = vm.assetModel.Description;
					odataAssetModel.GraphicsPath = vm.assetModel.GraphicsPath;

					return odataAssetModel.$save();


				})
				: dataService.AddEntity("AssetModels", vm.assetModel)).then(function (assetModel) {

				//At this point we have either added or updated an AssetModel entity

				signalR.SignalAllClientsInGroup("Admin", "AssetModel", assetModel);
				$state.go("^");

			});
		}




	}

	angular
		.module("app")
		.controller("AssetModelEditCtrl", [
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
			AssetModelEditCtrl
		]);



})();

