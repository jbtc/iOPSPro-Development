(function () {

	var app = angular.module('app');

	app.directive('bhsAlarmHistoryTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.alarms = [];

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
				

					$scope.$on("BHS.AlarmHistory", function (event, a) {
						GetData();
					});

					$scope.$on("Dashboard", function (event, a) {
						GetData();
					});


					vm.columnwidths = {
						ActiveDateTime: 10,
						BHSName: 10,
						Location: 12,
						Alarm: 20,
						AcknowledgeDateTime: 10,
						InactiveDateTime: 10,
						DurationActiveToAcknowledgeSeconds: 10,
						DurationActiveToInactiveSeconds: 10


                    }




					$scope.$on("BHS.AlarmHistory.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});
					GetData();


                    

					vm.sortField = '-ActiveDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}


					//Id the dashboard parameteres change, then reload the data based upon the date range.
					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboard.Id) {
							vm.dashboard = dashboard;

						}

					});


					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeDateTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeDateTime);

						if (a.InactiveDateTime) {
							a.InactiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.InactiveDateTime);

						}
						a.DurationActiveToAcknowledge = utilityService.SecondsToString(a.DurationActiveToAcknowledgeSeconds);
						a.DurationActiveToInactive = utilityService.SecondsToString(a.DurationActiveToInactiveSeconds);
						
					}


					vm.leastId = 0;

					function GetData(lessThanId) {

						if (!lessThanId) {
							lessThanId = 999999999999;
						}

						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


						dataService.GetIOPSWebAPIResource("BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds")
							.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									siteId: 81463,
									alarmType: "%"
								},
								function(data) {
									vm.data = data;

									data.forEach(function (a) {


										formatAlarm(a);

									});


									vm.alarms = data;
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

									$scope.$$postDigest(function () {
										$timeout(function () {
											displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
										}, 1);

									});



								});


						
					}




					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});





					vm.scrolledToEnd = function () {
						console.log("Scrolled to end fired");
						//var leastId = vm.alarms.min(function (d) { return d.Id });
						//GetData(leastId);

					}




				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsAlarmHistoryTable.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
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