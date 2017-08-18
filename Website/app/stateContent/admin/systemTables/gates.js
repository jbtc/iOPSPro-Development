/// <reference path="gate.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function GatesCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
        console.log("GatesCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            name: 50,
            address: 50
        };

        vm.buttonPanelWidth = 70;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();
        
        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready || dataService.cache.gates.length > 1) {
            LoadData();
        }

        function LoadData() {
            vm.gates = dataService.cache.gates;
        }

        if (!vm.gates) {
            dataService.GetGates().then(function(data) {
                vm.gates = data;
            });
        }

       vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }


        //$scope.$on("Olli Location Changed", function (event, course) {
        //	LoadData();

        //});


    }

    angular
			.module("app")
			.controller("GatesCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				GatesCtrl
			]);



})();