/// <reference path="tag.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/moment.min.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
(function () {
    "use strict";


    function LiveRawKepwareDataMonitorCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout, utilityService, $stateParams) {
        console.log("LiveRawKepwareDataMonitorCtrl conroller invoked.");
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


        if ($stateParams.NoDropOff) {
            vm.subTitle ="Updated in Real-Time Ten Times Per Second. Changes flash in green. Items will never drop off.";        
        } else {
            vm.subTitle ="Updated in Real-Time Ten Times Per Second. Changes flash in green. Items will drop off after 15 seconds of inactivity.";        
        }


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
        vm.searchTerm = "";

        function LoadData() {
            console.log("Load Data");

            //Set up interval that re-loads the vm tags. They will update that often.
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

        vm.updateInterval = $interval(function() {
            GetFormattedTags();
        },100);

        function GetFormattedTags() {
            if (dataService.IsReady) {

                dataService.GetRawKepwareTags().then(function(data) {
                    vm.totalChangeCount = 0;
                    vm.tags =
                        data
                        //.where(function(d) {
                        //    return (vm.searchTerm == "" ||
                        //            d.Name.toUpperCase().indexOf(vm.searchTerm.toUpperCase()) > -1) &&
                        //        (d.StaleCountDown > 0 || $stateParams.NoDropOff);
                        //})
                        .select(function(t) {
                            vm.totalChangeCount += t.Metadata.Statistics.ChangeCount;
                           return t;
                        }).orderBy(function(k) { return k.Name });
                });
            }
        }




        vm.scrolledToEnd = function () {
            //console.log("scrolled to end");
        }

    }

    angular
            .module("app")
            .controller("LiveRawKepwareDataMonitorCtrl", [
                "$scope",
                "$state",
                "displaySetupService",
                "dataService",
                "signalR",
                "$interval",
                "$timeout",
                "utilityService",
                "$stateParams",
                LiveRawKepwareDataMonitorCtrl
            ]);



})();