(function () {

	var app = angular.module('app');

	app.directive('bhsJamAlarmsTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					GetData();

					vm.sortField = '-AlarmDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;
								vm.alarms = vm.alarms.orderBy(function (alarm) {
									return alarm[fieldName];
								});


							} else {
								vm.sortField = "-" + fieldName;
								vm.alarms = vm.alarms.orderByDescending(function (alarm) {
									return alarm[fieldName];
								});
								
							}
						} else {
							vm.sortField = fieldName;
							vm.alarms = vm.alarms.orderBy(function (alarm) {
								return alarm[fieldName];
							});

						}
					}


					function GetData() {
						dataService.GetIOPSResource("BHSJamAlarms")
												.orderBy("Id", "desc")
												.take(100)
												.query().$promise.then(function (data) {


													console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {



														a.AlarmDateTime = utilityService.GetLocalDateFromUTCDateString(a.AlarmDateTime);

														if (a.ReturnToNormalTime) {
															a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

														}
														//console.log("a.ReturnToNormalTime = %O", a.ReturnToNormalTime);

														if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {
															if (a.ReturnToNormalTime && a.ReturnToNormalTime.getTime() < 1000) {
																a.ReturnToNormalTime = null;
																if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {
																	a.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
																}
															} else {
																a.Duration = moment.utc(moment(a.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss").diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
															}
														}

													});


													vm.alarms = data;
													//console.log("vm.alarms = %O", angular.copy(vm.alarms));
													//displaySetupService.SetPanelDimensions();
													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
												});
					}


					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {

									if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
										a.ReturnToNormalTime = null;
										a.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss")
											.diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
									} else {
										a.Duration = moment.utc(moment(a.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss")
											.diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
									}
								}

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


					$scope.$on("BHS.JamAlarm", function (event, signalRData) {
						var jamAlarmData = dataService.GetJsonFromSignalR(signalRData);

						jamAlarmData.AlarmDateTime = utilityService.GetLocalDateFromUTCDateString(jamAlarmData.AlarmDateTime);
						jamAlarmData.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(jamAlarmData.ReturnToNormalTime);

						if (jamAlarmData.TransactionType == 'Alarm Active' || jamAlarmData.TransactionType == 'Alarm Acknowledge') {
							if (jamAlarmData.ReturnToNormalTime.getTime() < 1000) {
								jamAlarmData.ReturnToNormalTime = null;
								jamAlarmData.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(jamAlarmData.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
							} else {
								jamAlarmData.Duration = moment.utc(moment(jamAlarmData.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss").diff(moment(jamAlarmData.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
							}

						}


						vm.alarms = [jamAlarmData].concat(vm.alarms).distinct(function (a, b) { return a.Id == b.Id }).orderByDescending(function (a) { return a.Id });

					});

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsJamAlarmsTable.html?" + Date.now(),

					scope: {

						imageKeys: "=",
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