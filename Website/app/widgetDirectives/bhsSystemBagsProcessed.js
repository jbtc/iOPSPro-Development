(function () {

	var app = angular.module('app');

	app.directive('bhsSystemBagsProcessed',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsSystemBagsProcessed controller invoked. dashboard = %O", vm.dashboard);




					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

							GetChartData(true); //
						}
					});


					function GetQueryParametersObject() {

						var obj = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};
						//console.log("Query Parameters Object = %O", obj);

						return obj;

					}







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
					//console.log("Derived start date translated to utc = %O", utilityService.GetUTCDateFromLocalDate(vm.dashboard.derivedStartDate));

					function GetChartData(refresh) {


						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
							.query(GetQueryParametersObject(), function (data) {
								//console.log("BHSTotalSystemThroughputController initial data = %O", data);
								//Compile a list of the distinct sections found and key them by section.

								vm.data = data;
								//console.log("vm.data = %O", vm.data);

								if (refresh) {
									UpdateChartWithNewData(data);

								} else {
									RenderChart();

								}
							});

					}


					GetChartData();



					function RenderChart() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {

						var chartOptions = {
							chart: {
								type: 'column'
							},
							colors: ['#e5e04c', '#849d8c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								},
								categories: vm.data.select(function (d) { return d.Location }).distinct()
							},
							yAxis: {
								allowDecimals: false,
								min: 0,
								title: {
									text: ''
								},

								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold',
										"font-size": ".8em",
										color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								}


							},
							plotOptions: {
								column: {
									stacking: 'normal',
									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, 1)',
										//borderWidth: 1,
										//borderColor: '#FFF',
										style: {
											fontSize: '.75em',
											fontWeight: 'normal'
										},
										formatter: function () {
											if (this.y != 0) {
												return this.y;
											} else {
												return null;
											}
										}
									}
								},
								legend: {
									enabled: true
								},
								tooltip: {
									enabled: false,
									headerFormat: '<b>{point.x}</b><br/>',
									pointFormat: '{series.name}:<br/>Bags: {point.stackTotal}'
								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var chartThis = this;

												hs.htmlExpand(null, {
													pageOrigin: {
														x: e.pageX || e.clientX,
														y: e.pageY || e.clientY
													},
													headingText: 'Data Details',
													maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																		"<thead>" +
																			"<th>System</th>" +
																			"<th>Array</th>" +
																			"<th>Count</th>" +
																		"</thead>" +
																		"<tbody>" +
																		vm.data.select(function (d) {
																			return "<tr>" +
																				"<td>" +
																					d.BHSName +
																				"</td>" +
																				"<td>" +
																				d.Location +
																				"</td>" +
																				"<td>" +
																				d.BagCount +
																				"</td>" +
																				"</tr>";

																		}).join("") +
																		"</tbody>" +
														"</table>",
													width: 800
												});


											}
										}
									},
									marker: {
										lineWidth: 1
									}
								}

							},
							series: vm.data
										.select(function (d) { return d.BHSName })
										.distinct()
											.select(function (bhs) {
												return {
													name: bhs,
													data: vm.data.where(function (d1) { return d1.BHSName == bhs }).select(function (d1) { return d1.BagCount })
												};
											})

						}

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('bhsSystemBagsProcessed' + vm.widget.Id, chartOptions);

					}

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						RefreshData();
					});





					function RefreshData() {

						//console.log("Refreshing Data");

						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
												.query(GetQueryParametersObject(),
													function (data) {
														if (vm.data.length == data.length) {
															vm.data = data;
															UpdateChartWithNewData(data);
														} else {
															vm.data = data;
															RenderChart();
														}
													});

					}


					function UpdateChartWithNewData(data) {
						//console.log("vm.chart = %O", vm.chart);
						vm.data = data;
						vm.locationCategoryIndex = 0;
						vm.bhsCounter = 0;
						vm.data
							.select(function (d) { return d.Location })
							.distinct()
							.forEach(function (location) {
								vm.data.select(function (d) { return d.BHSName }).distinct().forEach(function (bhs) {
									var matchingDataRow = vm.data.first(function (d1) { return d1.Location == location && d1.BHSName == bhs });
									var countForDataRow = matchingDataRow ? matchingDataRow.BagCount : 0;

									//console.log("location = " + location + "   BHSName = " + bhs);
									var seriesData = vm.chart.series[vm.bhsCounter++].data[vm.locationCategoryIndex];


									seriesData.update(countForDataRow, false);

								});
								vm.bhsCounter = 0;
								vm.locationCategoryIndex++;
							});



						vm.chart.redraw();
						vm.bhsCounter = 0;
						vm.locationCategoryIndex = 0;
					}






				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsSystemBagsProcessed.html?" + Date.now(),

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