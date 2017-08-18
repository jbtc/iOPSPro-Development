/// <reference path="asset.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function AssetsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
        console.log("AssetsCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
			assetId: 10,
        	site: 10,
        	company: 7,
            building: 5,
            area: 5,
            gate: 6,
            name: 10,
            dataChange: 60,
            dataChangeCount: 15
        };

        displaySetupService.SetPanelDimensions();

        $scope.$on("dataService.ready", function (event, course) {
            LoadData();
        });

        if (dataService.IsReady) {
            LoadData();
        }


        function LoadData() {
            dataService.GetAssets().then(function (data) {
            	vm.assets = data;
            });


        }
        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }

    }

    angular
			.module("app")
			.controller("AssetsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				AssetsCtrl
			]);



})();