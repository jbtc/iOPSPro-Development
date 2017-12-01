(function () {

	var app = angular.module('app');

	app.directive('gsTopFiveAlarmTypes',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					console.log("gsTopFiveAlarmTypes controller invoked. vm = %O", vm);
					function GetHeadingExtraTitle() {
					    vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });

					    if (vm.widgetSite) {
					        return ' - ' + vm.widgetSite.Name;
					    }
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


					vm.widget.displaySettings = {
					    headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
					    headingExtraTitle: '',
					    obscureGraphics: true
					}

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
						console.log("gsTopFiveAlarmTypes Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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

			

				    //Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
					    vm.JBTData = JBTData;
					    var userSiteCodes = Global.User.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

					    console.log("user site codes = %O", userSiteCodes);

					    vm.userSites = vm.JBTData.Sites.where(function (site) {
					        return userSiteCodes.any(function (sc) { return sc == site.Name })
					    });

					    console.log("vm.userSites = %O", vm.userSites);
					    
					    if (vm.userSites.length == 1) {
					        console.log("User only has a single Site");
					        vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
					        vm.widgetSite = vm.userSites[0];
					        GetChartData();
					    } else {

					        if (vm.widget.WidgetResource.SiteId) {
					            GetChartData();
					        }
					    }
					    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});


				    //Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


					function GetChartData(updateOnly) {
					    dataService.GetIOPSWebAPIResource("top5ObservationExceptions")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId:  vm.widget.WidgetResource.SiteId
							}, function (data) {
								console.log("GSTop5AlarmTypes initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and gs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.AlarmType }).update(d.AlarmCount, false);
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
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

					}

					

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetChartData();
					});


					function CreateChart(data) {
					   

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "gsTopFiveAlarmTypes" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Types',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.AlarmType }),
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
												var chartThis = this;

												dataService.GetIOPSResource("GSAlarmHistories")
																			.orderBy("Id", "desc")

																			.filter("AlarmTime", "!=", null)
																			.filter("AlarmTime", ">", vm.dashboard.webApiParameterStartDate)
																			.filter("AlarmTime", "<", vm.dashboard.webApiParameterEndDate)
																			.filter("JBTStandardObservationName", filterCategory)
																			.query().$promise.then(function (data) {

																				//console.log("data from OData Source = %O", angular.copy(data));
																				hs.htmlExpand(null, {
																					pageOrigin: {
																						x: e.pageX || e.clientX,
																						y: e.pageY || e.clientY
																					},
																					headingText: chartThis.y + ' ' + chartThis.category + 's',
																					maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																										"<thead>" +
																											"<th>Alarm Date Time</th>" +
																											"<th>Cleared Date Time</th>" +
                                                                                                            														"<th>Alarm Text</th>" +
                                                                                                            														"<th>Gate</th>" +
                                                                                                            														"<th>Equipment</th>" +
																										"</thead>" +
																										"<tbody>" +
																										data.select(function (d) {
																											return "<tr>" +
																												"<td>" +
																												utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.AlarmTime) +
																												"<td>" +
																												utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.CloseDate || "") +
                                                                                                               														        "<td>" +
                                                                                                                														d.JBTStandardObservationName +
                                                                                                                														"<td>" +
                                                                                                                														d.GateName +
                                                                                                                														"<td>" +
                                                                                                                														d.AssetName +
																												"</tr>";

																										}).join("") +
																										"</tbody>" +
																						"</table>",
																					width: 700,
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

						console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('gsTopFiveAlarmTypes' + vm.widget.Id, chartOptions);
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/gsTopFiveAlarmTypes.html?" + Date.now(),

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
