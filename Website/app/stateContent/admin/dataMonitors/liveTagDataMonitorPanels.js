/// <reference path="tag.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/moment.min.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
(function () {
    "use strict";


    function LiveTagDataMonitorPanelsCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout, utilityService) {
        console.log("LiveTagDataMonitorPanelsCtrl conroller invoked.");
        var vm = this;

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

        function LoadData() {
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
                vm.tags = data
                    .where(function (t) { return t.Metadata.UpdateCountDowns.FiveMinute > 0 })
                    .orderBy(function (t) { return t.Name });
            });
        }
    }

    angular
            .module("app")
            .controller("LiveTagDataMonitorPanelsCtrl", ["$scope","$state","$stateParams","displaySetupService","dataService","signalR","$interval","$timeout","utilityService",LiveTagDataMonitorPanelsCtrl
            ]);



})();