(function () {

	var app = angular.module('app');

	app.directive('ticketCounterThroughput',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$q",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $q) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("vm.dashboard = %O", vm.dashboard);

					function SetDiffDays() {
						var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
						vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					}

					SetDiffDays();
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);



					function GetQueryParametersObject() {

						var obj = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};
						//console.log("Query Parameters Object = %O", obj);

						return obj;

					}


					dataService.GetIOPSWebAPIResource("BHSLocationThroughput")
						.query({
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							location: "TicketCounter"
						},
							function (data) {
								//console.log("BHSLocationThroughput initial data = %O", data);
								vm.data = data;
								vm.chartData = data.orderBy(function (item) { return item.Section }).select(function (item) {
									return [item.Section, item.BagCount];
								});
								vm.totalBags = vm.data.sum(function (item) { return item.BagCount });
								//console.log("Rendering charts");
								RenderChartPie();
								RenderChartBar();
							});


					dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
						.query(GetQueryParametersObject(),
							function (data) {
								//console.log("BHSTotalSystemThroughputController initial data = %O", data);
								//Compile a list of the distinct sections found and key them by section.

								vm.accurateTicketCounterThroughput = data.where(function (d) { return d.Location == "TicketCounter" }).sum(function (d) { return d.BagCount });
								//console.log("vm.accurateTicketCounterThroughput = " + vm.accurateTicketCounterThroughput);
								if (vm.chartPie) {
									vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });
								} else {
									if (vm.chartPie) {
										
										$interval(function () {
											vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });

										}, 200, 20);
									}
								}

								return data;
							});





					vm.sparklineYAxisMax = 0;



					function GetSparklineChartData() {


						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSLocationThroughputHistoryByDay" : "BHSLocationThroughputHistoryByHour")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								location: "TicketCounter"
							},
								function (data) {

									//Compile a list of the distinct sections found and key them by section.
									vm.sectionsGrouped = data
										.groupBy(function (t) { return t.Section })
										.select(function (group) {
											return {
												Name: group.key,
												Data: group.select(function (item) {
													if (item.BagCount > vm.sparklineYAxisMax) {
														vm.sparklineYAxisMax = item.BagCount;
													}
													return {
														Day: utilityService.GetLocalDateFromUTCDate(item.ThroughputDay || item.ThroughputHour),
														BagCount: item.BagCount
													};
												})
											};

										});


									//Create a chart for each section
									$timeout(function () {
										vm.sectionsGrouped.forEach(function (section) {
											try {
												
												section.Chart = new Highcharts.Chart(GetHighChartConfigSparkline(section));
											} catch (e) {
												//console.log("Error");
											}
										});

										//console.log("Sections Grouped = %O", vm.sectionsGrouped);


									},
										10);


								}
							);



					}

					GetSparklineChartData();

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("ticketCounterThroughput Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							SetDiffDays();
							RefreshData();
							vm.sparklineYAxisMax = 0;
							GetSparklineChartData();
						}
					});




					var dimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					//console.log("Panel Dimensions = %O", dimensions);

					function GetHighChartConfigSparkline(section) {
						return {
							chart: {
								renderTo: "sparkLineContainer" + vm.widget.Id + section.Name,
								backgroundColor: null,
								borderWidth: 0,
								type: 'area',
								margin: 0,
								marginRight: 0,
								marginBottom: -5,
								style: {
									overflow: 'visible'
								},

								// small optimalization, saves 1-2 ms each sparkline
								skipClone: true
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},

							xAxis: {
								type: 'datetime',
								labels: {
									enabled: false
								},
								lineWidth: 0,
								gridLineWidth: 0,
								minorGridLineWidth: 0,
								lineColor: 'transparent',
								title: {
									text: null
								},
								startOnTick: false,
								endOnTick: false,
								tickPositions: []
							},
							yAxis: {
								max: vm.sparklineYAxisMax,
								gridLineWidth: 0,
								minorGridLineWidth: 0,
								lineColor: 'transparent',
								endOnTick: false,
								startOnTick: false,
								labels: {
									enabled: false
								},
								title: {
									text: null
								},
								tickPositions: [0]
							},
							legend: {
								enabled: false
							},
							tooltip: {

								formatter: function () {
									//console.log("Current this = %O", this);
									return Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.point.x)
										+ '<br/>' +
										Highcharts.numberFormat(this.y, 0, '.', ',') + ' Bags';
								},
								hideDelay: 0

							},
							plotOptions: {
								series: {
									animation: false,
									lineWidth: 1,
									shadow: false,
									states: {
										hover: {
											lineWidth: 1
										}
									},
									marker: {
										radius: 1,
										states: {
											hover: {
												radius: 2
											}
										}
									},
									fillOpacity: 0.25
								},
								column: {
									negativeColor: '#910000',
									borderColor: 'silver'
								}
							},
							exporting: {
								enabled: false
							},
							series: [
							{
								name: 'Throughput',
								animation: false,



								data: section.Data.select(function (point) {
									return [new Date(point.Day).getTime(), point.BagCount];
								}),
								pointStart: 1,
								dataLabels: {
									enabled: false

								}
							}]





						}
					}

					function GetHighChartConfigBar() {
						return {
							chart: {
								type: 'column',
								renderTo: "containerTicketCounterThroughputBar" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: ''
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Throughput: <b>{point.y:.0f} bags</b>'
							},
							series: GetCounts()
						}
					}

					function GetHighChartConfigPie() {
						return {
							chart: {
								type: 'pie',
								renderTo: "containerTicketCounterThroughputPie" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: vm.accurateTicketCounterThroughput || '... ' + ' Bags',
								style: {
									fontSize: '1.75em',
									fontWeight: 'bold'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: 'Throuput (bags)'
								}
							},
							legend: {
								enabled: true
							},
							tooltip: {
								pointFormat: 'Throughput: <b>{point.y:.0f} bags</b>'
							},
							exporting: {
								enabled: false
							},
							series: GetCounts()
						}
					}

					function GetCounts() {
						return [
						{
							name: 'Throughput',
							animation: false,



							data: vm.chartData,
							dataLabels: {
								enabled: false,
								rotation: 0,
								color: '#FFFFFF',
								align: 'right',
								fontSize: '.7em',
								format: '{point.y:.0f}', // one decimal
								y: 10, // 10 pixels down from the top
								style: {
									fontSize: '13px',
									fontFamily: 'Verdana, sans-serif'
								}
							}
						}
						];
					}

					function SetChartSizeBar(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						chart.setSize((widgetBodyDimensions.width * .75) - 45, (widgetBodyDimensions.height * .25) - 10, false);
					}

					function SetChartSizePie(widgetId, chart) {
						//Set the pie chart to be 40% high, 30% wide
						//console.log("widgetId = " + widgetId);
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						chart.setSize((widgetBodyDimensions.width * .25) + 40, (widgetBodyDimensions.height * .25), false);
					}

					function RenderChartPie() {
						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								vm.chartPie = new Highcharts.Chart(GetHighChartConfigPie());

								SetChartSizePie(vm.widget.Id, vm.chartPie);
							},
								100);
						});
					}

					function RenderChartBar() {
						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								vm.chartBar = new Highcharts.Chart(GetHighChartConfigBar());
								SetChartSizeBar(vm.widget.Id, vm.chartBar);
							});
						});
					}


					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						RefreshData();
						vm.sparklineYAxisMax = 0;
						GetSparklineChartData();
					});

					function RefreshData() {

						//console.log("Refreshing Data");


						dataService.GetIOPSWebAPIResource("BHSLocationThroughput")
							.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									location: "TicketCounter"
								},
								function(data) {
									vm.data = data;

									//Must have separate collections of chart data to update each chart.
									var chartData = vm.data.orderBy(function (item) { return item.Section }).select(function (tc) {
										return [tc.Section, tc.BagCount];
									});
									vm.chartPie.series[0].setData(chartData);

									//Separate one for the bar chart. Using it in the chart above seems to destroy it.
									chartData = vm.data.orderBy(function (item) { return item.Section }).select(function (tc) {
										return [tc.Section, tc.BagCount];
									});
									vm.chartBar.series[0].setData(chartData);
									vm.totalBags = vm.data.sum(function (item) { return item.BagCount });


								});


						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
							.query(GetQueryParametersObject(),
								function(data) {
									//console.log("BHSTotalSystemThroughputController initial data = %O", data);
									//Compile a list of the distinct sections found and key them by section.

									vm.accurateTicketCounterThroughput = data.where(function(d) { return d.Location == "TicketCounter" }).sum(function(d) { return d.BagCount });
									if (vm.chartPie) {
										vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });
									} else {
										$interval(function () {
											vm.accurateTicketCounterThroughput = vm.data.where(function(d) { return d.Location == "TicketCounter" });
												vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });

											},200,20);
									}
								});


					}


				

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							SetChartSizePie(vm.widget.Id, vm.chartPie);
							SetChartSizeBar(vm.widget.Id, vm.chartBar);
						}
					});



				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/ticketCounterThroughput.html?" + Date.now(),
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