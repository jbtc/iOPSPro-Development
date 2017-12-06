/// <reference path="area.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function AreasCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout) {
        console.log("AreasCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            company: 10,
            building: 10,
            name: 80
        };
        vm.buttonPanelWidth = 70;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();


        if ($stateParams.BuildingId) {

            vm.previousScreenName = "Buildings";
            vm.building = dataService.cache.buildings.first(function (b) { return b.Id == $stateParams.BuildingId });


        }



        //$scope.$on("dataService.cache.ready", function (event, course) {
        //    LoadData();

        //});

        //if (dataService.cache.ready || dataService.cache.areas.length > 1) {
        //    LoadData();
        //}

        function LoadData() {
            dataService.GetAreas().then(function (data) {
                vm.areas = data.where(function (a) {
                    return !$stateParams.BuildingId || a.BuildingId == $stateParams.BuildingId
                });

                $timeout(function () {
                    displaySetupService.SetPanelDimensions();
                });
                displaySetupService.SetPanelDimensions();
                console.log("vm.areas = %O", vm.areas);
            });
        }

        LoadData();

        //if (!vm.areas) {
        //    dataService.GetAreas().then(function (data) {
        //        vm.areas = data;
        //    });
        //}


        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }

    }

    angular
			.module("app")
			.controller("AreasCtrl", [
				"$scope",
				"$state",
                "$stateParams",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				AreasCtrl
			]);



})();