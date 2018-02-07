(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveAlarmDurations',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveAlarmDurations controller invoked");



					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							}, 50, 20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource("BHSTop5AlarmTypeLongestDuration")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("bhsTopFiveAlarmDurations initial data = %O", data);

								if (updateOnly) {
									data
										.forEach(function (d) {
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.AlarmType + ' (' + d.DeviceNameList + ')' }).update(d.MaxDurationSec, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
										}, 100);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					vm.updateInterval = $interval(function() {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});

					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveAlarmDurations" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Durations',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.AlarmType + ' (' + item.DeviceNameList + ')' }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								tickInterval: 3600,
								labels: {
									formatter: function () {
										var hours = this.value / 3600;

										return hours == 0 ? '' : hours + ' Hr';
									}
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Longest Duration: <b>{point.y:.0f} seconds</b>'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {

									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										//shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, .5)',
										borderWidth: 1,
										borderColor: '#aaa',
										style: {
											fontSize: '.85em',
											fontWeight: 'normal'
										},
										formatter: function () {
											//this.percentage	Stacked series and pies only. The point's percentage of the total.
											//this.point	The point object. The point name, if defined, is available through this.point.name.
											//this.series:	The series object. The series name is available through this.series.name.
											//this.total	Stacked series only. The total value at this point's x value.
											//this.x:	The x value.
											//this.y:	The y value.
											return utilityService.SecondsToString(this.y);
										}
									}

								}
							},
							series: [{ data: data.select(function (item) { return item.MaxDurationSec }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveAlarmDurations' + vm.widget.Id, chartOptions);
						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveAlarmDurations.html?" + Date.now(),

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