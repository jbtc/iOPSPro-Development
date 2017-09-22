(function () {
	;

	var app = angular.module('app');

	app.directive('bhsReadRatesSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsReadRatesSummary vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});

					var fontFactor = .003;
					var fontMax = 3;

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("readRatesSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

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

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetData() {
						dataService.GetIOPSWebAPIResource("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange initial data = %O", data);
								vm.scannerReadRates = data.skip(1);
								vm.overallGoodReadRate = (data[0].PercentGoodReads || 0) + '% - ' + (data[0].GoodReads || 0) + ' Reads';
								vm.overallFailedReadRate = (data[0].PercentFailedReads || 0) + '% - ' + (data[0].BadReads || 0) + ' Reads';
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
								if (vm.largeTextSize > fontMax) {
									vm.largeTextSize = fontMax;
								}
								vm.data = data;
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							});
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
					}

					GetData();

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetData();
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
								vm.data.forEach(function (item) {
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
									vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
									if (vm.largeTextSize > fontMax) {
										vm.largeTextSize = fontMax;
									}
								});
								
							},50,20);
						}
					});

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsReadRatesSummary.html?" + Date.now(),

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