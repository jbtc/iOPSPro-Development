(function () {

	var app = angular.module('app');

	app.directive('bhsPercentOfFailsafe',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					console.log("bhsPercentOfFailsafe controller invoked");



					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(false); //
						}
					});

					vm.state = $state;

				

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));





					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSPercentOfFailSafePerDay" : "BHSPercentOfFailSafePerHour")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTopFiveJamDevicesWithCount initial data = %O", data);
								console.log("data = %O", data);
								var formattedData = data.select(function(item) {

									return {
										BHSName: item.BHSName,
										TimeWindow: utilityService.GetLocalDateFromUTCDate(item.Hour || item.Day),
										NormalBagCount: item.PEBagCount - item.AlarmCount,
										FailsafeBagCount: item.AlarmCount,
										PercentFailsafe: item.Percent
									};

								})
								.orderBy(function (item) { return item.BHSName })
								.thenBy(function(item){return item.TimeWindow});

								console.log("FormattedData = %O", formattedData);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.DeviceName }).update(d.AlarmCount, false);
											//console.log("Updating the old data");
											//oldScanner.ChartObject.series[0].setData(newScannerData.Data.select(function (d) { return { y: d.GoodReads } }));
											//oldScanner.ChartObject.series[1].setData(newScannerData.Data.select(function (d) { return { y: d.BadReads } }));
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
								type: 'spline',
								renderTo: "bhsPercentOfFailsafe" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Percent of Failsafe Bags',
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

						vm.chart = Highcharts.chart('bhsPercentOfFailsafe' + vm.widget.Id, chartOptions);
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsPercentOfFailsafe.html?" + Date.now(),

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