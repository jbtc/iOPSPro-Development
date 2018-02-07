(function () {
	;

	var app = angular.module('app');

	app.directive('bhsBagDimensionerReadAccuracySummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsBagDimensionerReadAccuracySummary vm.dashboard = %O", vm.dashboard);


					var fontFactor = .0055;
					var fontMax = 3;


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsBagDimensionerReadAccuracySummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

						//+Only react if this dashboard change signal is the one we are on.
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							vm.overallGoodReadRate = null;
							vm.overallFailedReadRate = null;
							vm.scannerReadRates = null;
							GetData();
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetData() {
						dataService.GetIOPSWebAPIResource("BHSBagDimensionerPercentReadRateReportGroupedByDateRange")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSBagDimensionerPercentReadRateReportGroupedByDateRange initial data = %O", data);
								vm.detailReadRates = data.take(data.length - 1);
								vm.summaryReadRates = data.skip(data.length - 1).first();

								vm.totalInGaugeReadsMessage = (vm.summaryReadRates.PercentInGaugeReads || 0) + "% In";
								vm.totalOutOfGaugeReadsMessage = (vm.summaryReadRates.PercentOutOfGaugeReads || 0) + "% Out";
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								if (vm.widgetDimensions) {

									vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
									if (vm.largeTextSize > fontMax) {
										vm.largeTextSize = fontMax;
									}

									$timeout(function () {
										displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									}, 100);
								}

							});
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
					}



					GetData();

					vm.updateInterval = $interval(function() {
						GetData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
								if (vm.largeTextSize > fontMax) {
									vm.largeTextSize = fontMax;
								}
							},50,20);
						}
					});



				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsBagDimensionerReadAccuracySummary.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());