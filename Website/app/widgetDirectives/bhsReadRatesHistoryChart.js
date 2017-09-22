(function () {
	;

	var app = angular.module('app');

	app.directive('bhsReadRatesHistoryChart',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsReadRatesHistoryChart vm.dashboard = %O", vm.dashboard);

					function CalculateDateRange() {
						var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
						vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						//console.log("vm.diffDays = " + vm.diffDays);
					}
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					CalculateDateRange();


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsReadRatesHistoryChart Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

						//+Only react if this dashboard change signal is the one we are on.
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							CalculateDateRange();
							GetChartData(true);
						}
					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							vm.data.forEach(function (item) {
								SetChartSize(item);
							});
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								vm.data.forEach(function (item) {
									SetChartSize(item);
								});
								
							},50,20);
						}
					});

					vm.state = $state;



					function SetChartSize(dataItem) {
						//Set the bar chart to be 40% high, 60% wide
						var containerDimensions = displaySetupService.GetDivDimensionsById(dataItem.ChartContainerId);
						if (dataItem.ChartObject) {
							dataItem.ChartObject.setSize(containerDimensions.width, containerDimensions.height - 30, false);
						}
					}


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetChartData(refresh) {


						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay" : "BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour")
								.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									siteId: 81463
								}, function (data) {
									//console.log("BHSAutomaticTokenReaderPercentReadRateReportGroupedByxxx initial data = %O", data);



									var formattedData = data
											.groupBy(function (t) { return t.Location })
												.orderBy(function(t){return t.key})
												.select(function (group) {

													var scannerData = {
														Scanner: group.key,
														ChartObject: null,
														ChartContainerId: "chartContainer-" + vm.widget.Id + "-" + group.key,
														Data: group
															.orderBy(function (item) { return item.ScanHour || item.ScanDay })
															.select(function (item) {

																return {
																	TimeWindow: utilityService.GetLocalDateFromUTCDate(item.ScanHour || item.ScanDay),
																	TimeWindowAsString: "",
																	BadReads: item.BadReads,
																	GoodReads: item.GoodReads,
																	PercentFailedReads: item.PercentFailedReads,
																	PercentGoodReads: item.PercentReads,
																	TotalReads: item.TotalReads
																};
															})
													};

													//console.log("Scanner Data Grouped = %O", scannerData);

													//Caclculate the total good and bad for the chart being generated and add it as properties to the group.
													scannerData.totalGoodReads = scannerData.Data.sum(function(item) { return item.GoodReads });
													scannerData.totalBadReads = scannerData.Data.sum(function(item) { return item.BadReads });

													if (!vm.data || refresh) {

														$timeout(function () {
															displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
															scannerData.ChartObject = CreateChart(scannerData);
															SetChartSize(scannerData);
														});
													}


													return scannerData;

												});




									if (!vm.data || refresh) {
										vm.data = formattedData;
									} else {
										//The chart already exists.
										//Just update the data content of the vm.data object, and run the setData() method on the chart to keep it updated.
										vm.data.forEach(function (oldScanner) {
											//Find the chart and data collection to update.
											var newScannerData = formattedData.first(function (sd) { return sd.Scanner == oldScanner.Scanner });
											oldScanner.Data = newScannerData.Data;
											//console.log("Updating the old data");
											oldScanner.ChartObject.series[0].setData(newScannerData.Data.select(function (d) { return { y: d.GoodReads } }));
											oldScanner.ChartObject.series[1].setData(newScannerData.Data.select(function (d) { return { y: d.BadReads } }));
										});


									}

								});

					}


					function CreateChart(scannerData) {


						//If the chart object is already there then just refresh the data.

						//console.log("Chart regen = %O", scannerData.Data.select(function (d) { return { y: d.GoodReads } }));
						return Highcharts.chart(scannerData.ChartContainerId,
						{
							chart: {
								type: 'area'

							},
							title: {
								text: scannerData.Scanner + " - Read Rate " + (vm.diffDays > 5 ? "Per Day" : "Per Hour") + ' - ' + scannerData.totalGoodReads + ' Good Reads - ' + scannerData.totalBadReads + ' Bad Reads',
								style: {
									fontSize: '.8em'
								}
							},
							animation: false,
							credits: { enabled: false },
							xAxis: {
								//type: 'datetime',
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
								},
								//These are the date or hour entries
								categories: scannerData.Data.select(function (sd) {
									return vm.diffDays > 5 ? moment(sd.TimeWindow).format("MM/DD") : moment(sd.TimeWindow).format("MM/DD HH:00");
								}),
								tickmarkPlacement: 'on',
								title: {
									enabled: false
								}
							},
							yAxis: {
								title: {
									text: ''
								},
								visible: false
							},
							tooltip: {
								pointFormat: '<span>{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} Times)<br/>',
								split: true,
								hideDelay: 2000
							},
							plotOptions: {
								series: {
									animation: false
								},
								area: {
									stacking: 'percent',
									lineColor: '#ffffff',
									lineWidth: 1,
									marker: {
										lineWidth: 1,
										lineColor: '#ffffff'
									}
								}
							},
							legend: {
								enabled: false
							},
							series: [
								{
									name: 'Good Reads',
									data: scannerData.Data.select(function (d) { return { y: d.GoodReads } }),
									color: {
										linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
										stops: [
											[0, '#bbbbbb'],
											[1, '#ffffff']
										]
									}
								},
								{
									name: 'Failed Reads',
									data: scannerData.Data.select(function (d) { return { y: d.BadReads } }),
									color: {
										linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
										stops: [
											[0, '#ff0000'],
											[1, '#f4a4a4']
										]
									},

								}
							]

						});

					}


					GetChartData(false);

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetChartData(false);
					});




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsReadRatesHistoryChart.html?" + Date.now(),

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