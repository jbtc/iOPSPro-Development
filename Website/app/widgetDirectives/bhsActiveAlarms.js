(function () {

	var app = angular.module('app');

	app.directive('bhsActiveAlarms',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//Used for header font sizes
					var fontFactor = .01;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {

							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsActiveAlarms Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					//console.log("vm.diffDays = " + vm.diffDays);

					function GetChartData(refresh) {

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds" : "BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.AlarmDay || item.AlarmHour)).getTime(), item.AlarmCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							});
					}


					GetChartData();

					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (chart && widgetBodyDimensions) {
							chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						try {
							vm.chart = Highcharts.chart('containerBhsActiveAlarms' + vm.widget.Id, {
								chart: {
									type: 'spline',
									animation: false,
									marginRight: 10,
									events: {
										load: function () {

											// set up the updating of the chart each second
											vm.chartSeries = this.series[0];
										}
									}
								},
								animation: false,
								credits: { enabled: false },
								title: {
									text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour',
									style: {
										fontSize: '.8em'
									}
								},
								xAxis: {
									type: 'datetime',
									dateTimeLabelFormats: {
										day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
										month: '%b \'%y'
									},
									labels: {
										autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
										style: {
											fontSize: '10px',
											fontFamily: 'Verdana, sans-serif'
										}
									}
								},
								yAxis: {
									title: {
										text: ''
									},
									plotLines: [{
										value: 0,
										width: 1,
										color: '#808080'
									}]
								},
								tooltip: {
									formatter: function () {

										//console.log("Current this = %O", this);
										return '<b>' + this.series.name + '</b><br/>' +
											Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
											+ '<br/>' +
											Highcharts.numberFormat(this.y, 0) + ' Alarms';
									}
								},
								legend: {
									enabled: false
								},
								exporting: {
									enabled: true
								},
								series: [{
									name: 'Alarms',
									data: vm.chartData
								}]
							});

						} catch (e) {

						}

					}


					//console.log("bhsCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("bhsCurrentAlarmsTable dashboard = %O", vm.dashboard);
					//console.log("bhsActiveAlarms widgetId = %O", vm.widget.Id);

					$scope.$on("BHS.CurrentAlarm", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm event. Alarm = %O", a);
						formatAlarm(a);
						calculateAlarmDuration(a);
						vm.alarms = [a].concat(vm.alarms).distinct(function (a, b) { return +a.Id == +b.Id }).where(function (a) { return a.TransactionType != 'Inactive' && (!a.Hide || a.Hide == 0) });

						GetChartData(true);

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


													vm.alarms = data.where(function (a) { return a.TransactionType != 'Inactive' && a.Hide == 0 });

													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


													$interval(function () {
														SetChartSizeLine(vm.widget.Id, vm.chart);

													}, 50, 20);

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






				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsActiveAlarms.html?" + Date.now(),

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