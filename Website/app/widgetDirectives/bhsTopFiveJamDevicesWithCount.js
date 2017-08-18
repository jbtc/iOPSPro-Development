(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveJamDevicesWithCount',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveJamDevicesWithCount controller invoked");


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveJamDevicesWithCount Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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
						dataService.GetIOPSWebAPIResource("BHSTop5JamDevicesWithCount")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTopFiveJamDevicesWithCount initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.DeviceName }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											$timeout(function() {
													displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
													displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

												},
												50);
										}, 50);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetChartData();
					});


					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveJamDevicesWithCount" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Jam Alarm Devices - With Count',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.DeviceName }),
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
								//tickInterval: 3600,
								//labels: {
								//	formatter: function () {
								//		var hours = this.value / 3600;

								//		return hours == 0 ? '' : hours + ' Hr';
								//	}
								//}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b>'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
										//formatter: function () {
										//	//this.percentage	Stacked series and pies only. The point's percentage of the total.
										//	//this.point	The point object. The point name, if defined, is available through this.point.name.
										//	//this.series:	The series object. The series name is available through this.series.name.
										//	//this.total	Stacked series only. The total value at this point's x value.
										//	//this.x:	The x value.
										//	//this.y:	The y value.
										//	return utilityService.SecondsToString(this.y);
										//}
									}

								}

							},
							series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
						};

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('bhsTopFiveJamDevicesWithCount' + vm.widget.Id, chartOptions);
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveJamDevicesWithCount.html?" + Date.now(),

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