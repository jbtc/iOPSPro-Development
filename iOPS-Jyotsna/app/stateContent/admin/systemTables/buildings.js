/// <reference path="building.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function BuildingsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
        console.log("BuildingsCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            site: 25,
            name: 60
        };

        vm.buttonPanelWidth = 20;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();


        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready || dataService.cache.buildings.length > 1) {
            LoadData();
        }

        function LoadData() {
            vm.buildings = dataService.cache.buildings;
        }

        if (!vm.buildings) {
            dataService.GetBuildings().then(function(data) {
                vm.buildings = data;
            });
        }


        vm.delete = function (building) {

            //Go and get a "pure" copy of the building before deleting
            dataService.GetBuilding(building.Id).then(function (building) {
                alertify.set({
                    labels: {
                        ok: "Yes, Delete the Building",
                        cancel: "Cancel, I don't want to do this"
                    },
                    buttonFocus: "cancel"
                });
                var message = 'Are you SURE you want to delete this building? ';

                alertify.confirm(message, function (e) {
                    if (e) {
                        // user clicked "ok"
                        airport.$delete().then(function () {
                            signalR.SignalAllClients("Building Changed", null);

                        });



                        toastr.success(location.Name, "Building was deleted!");

                    } else {
                        // user clicked "no"
                        toastr.info(location.Name, "Building was NOT deleted!");
                    }
                });
            });

        }


        vm.save = function (building) {
            dataService.GetBuilding(building.Id).then(function (odataBuilding) {
                odataBuilding.$update().then(function () {
                    signalR.SignalAllClients("Building Changed", null);
                });

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
			.controller("BuildingsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				BuildingsCtrl
			]);



})();