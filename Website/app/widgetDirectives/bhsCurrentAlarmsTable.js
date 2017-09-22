(function () {

	var app = angular.module('app');

	app.directive('bhsCurrentAlarmsTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data



					//console.log("bhsCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("bhsCurrentAlarmsTable dashboard = %O", vm.dashboard);
					console.log("bhsCurrentAlarmsTable widgetId = %O", vm.widget.Id);

					$scope.$on("BHS.CurrentAlarm", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm event. Alarm = %O", a);
						formatAlarm(a);
						calculateAlarmDuration(a);
						vm.alarms = [a].concat(vm.alarms).distinct(function (a, b) { return +a.Id == +b.Id }).where(function(a){return a.TransactionType != 'Inactive'});
					});

					$scope.$on("BHS.CurrentAlarm.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});

					function GetData() {
						dataService.GetIOPSResource("BHSCurrentAlarms")
												.query().$promise.then(function (data) {


													//console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {


														formatAlarm(a);
														calculateAlarmDuration(a);

													});


													vm.alarms = data.where(function(a){return a.TransactionType != 'Inactive'});

													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
												});
					}

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

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								calculateAlarmDuration(a);

							});

						}
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.secondInterval);

					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								
							},50,20);
						}
					});





				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsCurrentAlarmsTable.html?" + Date.now(),

					scope: {

						widget: "=",
						dashboard: "=",
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