﻿(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveAlarmAreas',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveAlarmAreas controller invoked");

					


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {							
							$interval(function() {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								
							},50,20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsTopFiveAlarmAreas Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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
						var queryParameters = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};

						//console.log("vm.dashboard = %O", vm.dashboard);


						//console.log("queryParamters = %O", queryParameters);

						dataService.GetIOPSWebAPIResource("BHSAlarmAreaCount")
							.query(queryParameters, function (data) {
								data = data.orderByDescending(function (d) { return d.AlarmCount }).take(5).orderBy(function (d) { return d.Area });

								//console.log("BHSTop5AlarmTypes initial data = %O", data);
								var dataIndex = 0;

								if (updateOnly) {
									data
										.forEach(function (d) {

											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value


											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.BHSName + ' - ' + d.Area }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();
									//console.log("vm.chart = %O", vm.chart);

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

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetChartData();
					});




					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveAlarmAreas" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Areas',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.BHSName + ' - ' + item.Area }),
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
								pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b><br/>Click for details'
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
								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var filterBHSName = filterCategory.split(' - ')[0];
												var filterAreaName = filterCategory.split(' - ')[1];
												var chartThis = this;

												var queryParamters = {

												};


												dataService.GetIOPSWebAPIResource("BHSAlarmAreaCountDetails")
													.query({
														beginDate: vm.dashboard.webApiParameterStartDate,
														endDate: vm.dashboard.webApiParameterEndDate,
														bhsName: filterBHSName,
														area: filterAreaName,
														siteId: 81463
													}, function (data) {
														data = data.orderBy(function (d) { return d.ActiveDateTime });

														//console.log("data from OData Source = %O", angular.copy(data));
														var highSlideWindow = hs.htmlExpand(null, {
															pageOrigin: {
																x: e.pageX || e.clientX,
																y: e.pageY || e.clientY
															},
															headingText: chartThis.y + ' Total Alarms for ' + chartThis.category,
															maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																				"<thead>" +
																					"<th>Active Date</th>" +
																					"<th>Alarm</th>" +
																					"<th>Device</th>" +
																					"<th>Duration</th>" +
																				"</thead>" +
																				"<tbody>" +
																				data.select(function (d) {
																					return "<tr>" +
																						"<td>" +
																						utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ActiveDateTime) +
																						"</td>" +
																						"<td>" +
																						d.Alarm +
																						"</td>" +
																						"<td>" +
																						d.DeviceNameList +
																						"</td>" +
																						"<td>" +
																						utilityService.SecondsToString(d.duration) +
																						"</td>" +
																						"</tr>";

																				}).join("") +
																				"</tbody>" +
																"</table>",
															width: 800,
															height: window.outerHeight * .6
														});

													});



											}
										}
									},
									marker: {
										lineWidth: 1
									}

								}


							},
							series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
						};

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('bhsTopFiveAlarmAreas' + vm.widget.Id, chartOptions);
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveAlarmAreas.html?" + Date.now(),

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