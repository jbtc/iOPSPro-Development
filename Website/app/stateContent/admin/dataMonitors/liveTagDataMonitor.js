/// <reference path="tag.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/moment.min.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
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
            }, 100);

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

                //data.select(function(t) {
                //    vm.totalChangeCount += t.Statistics.ChangeCount;
                //});


                vm.tags = data
                    .where(function(t) {
                        return (t.Metadata.UpdateCountDowns.TenSecond > 0 && !$stateParams.NoDropOff) || $stateParams.NoDropOff;
                    });

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