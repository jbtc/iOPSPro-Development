(function () {

	var app = angular.module('app');

	app.directive('bhsPercentBagsToCbra',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("BHSPercentCBRAPerDay controller invoked");




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
						//console.log("BHSPercentCBRAPerDay Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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
						dataService.GetIOPSWebAPIResource("BHSPercentCBRAPerDay")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								console.log("BHSPercentCBRAPerDay initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.BHSName }).update(d.TotalCBRABags, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											$timeout(function () {
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
								renderTo: "bhsPercentBagsToCbra" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Percent Bags to CBRA',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.BHSName }),
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
								pointFormat: 'CBRA Bags : <b>{point.y:.0f} </b><br/>Click for details'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
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
												var chartThis = this;
												dataService.GetIOPSWebAPIResource("BHSPercentCBRAPerDay")
                                                               .query({
                                                               	beginDate: vm.dashboard.webApiParameterStartDate,
                                                               	endDate: vm.dashboard.webApiParameterEndDate,
                                                               	siteId: 81463
                                                               }, function (data) {
                                                               	console.log("data from OData Source = %O", angular.copy(data));


                                                               	hs.htmlExpand(null, {
                                                               		pageOrigin: {
                                                               			x: e.pageX || e.clientX,
                                                               			y: e.pageY || e.clientY
                                                               		},

                                                               		headingText: 'CBRA Percent of Bags',
                                                               		maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																					   "<thead>" +
																						   "<th>Area-Date</th>" +
																						   "<th>Total Bag Count</th>" +
																						   "<th>CBRA Bags</th>" +
																						   "<th>CBRA Percent</th>" +

																						"</thead>" +
																						"<tbody>" +
																							data.select(function (d) {
																								return "<tr>" +
																							   "<td>"
																							   + d.BHSName +
																							   "<td>"
																							   + d.TokenCount +
																								"<td>"
																							   + d.TotalCBRABags +
																								"<td>"
																							   + d.CBRAPercentOfTotal + "%" +
																							   "</tr>";
																							}).join("") +
																					   "</tbody>" +
																					"</table>",


                                                               		width: 500,
                                                               		height: window.outerHeight * .3


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
							series: [{ data: data.select(function (item) { return item.TotalCBRABags }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsPercentBagsToCbra' + vm.widget.Id, chartOptions);

						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsPercentBagsToCbra.html?" + Date.now(),

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