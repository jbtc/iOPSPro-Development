/// <reference path="asset.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function ChangingAssetsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
        console.log("ChangingAssetsCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {

            company: 10,
            gate: 6,
            name: 10,
            dataChange: 70,
            dataChangeCount: 15
        };

        vm.buttonPanelWidth = 20;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();

        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready) {
            LoadData();
        }

        function LoadData() {
            

            vm.assetInventory = dataService.cache.expandedAssets.select(function (d) {
                return {
                    data: d,
                    lastChange: '',
                    changeCounter: 0
                };
            });
            console.log("vm.assetInventory = %O", vm.assetInventory);
            $scope.$$postDigest(function () {
                displaySetupService.SetPanelDimensions();
            });


            $scope.$on("observation", function (event, signalRData) {


                //Split the change data out into the components
                signalRData = signalRData.split(",").last().split("|").select(function (item) {
                    return {
                        name: item.split("^").first(),
                        value: item.split("^").last()
                    };
                });

                //Find the row in the data array.
                //Get the asset id out of the dataItems
                var signalRAssetIdDataItem = signalRData.first(function (dataItem) { return dataItem.name == "AssetId" });
                var signalRAssetId = signalRAssetIdDataItem.value;

                var asset = vm.assetInventory.first(function (vmAsset) { return +vmAsset.data.Id == signalRAssetId });

                var changeDescription =
                    signalRData.first(function (dataItemRow) {
                        return dataItemRow.name == "Date";
                    }).value +
                        "  Tag:" +
                        signalRData.first(function (dataItemRow) {
                            return dataItemRow.name == "TagName";
                        }).value.trim() +
                        "  Value:" +
                        signalRData.first(function (dataItemRow) {
                            return dataItemRow.name == "Value";
                        }).value;



                if (asset) {
                    $scope.$apply(function () {
                        asset.changeCounter++;
                        asset.lastChange = changeDescription;
                        vm.assets = vm.assetInventory.where(function(a) { return a.dataChangeCount > 0 });
                    });
                }


            });




        }

        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }




    }

    angular
			.module("app")
			.controller("ChangingAssetsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				ChangingAssetsCtrl
			]);



})();