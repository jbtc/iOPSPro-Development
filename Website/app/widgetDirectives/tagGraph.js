(function () {

	var app = angular.module('app');

	app.directive('tagGraph',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$q", "$rootScope",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $q, $rootScope) {

				var controller = function ($scope) {
					var vm = this;


					console.log("tagGraph controller invoked");




					//***G
					//+Resizing
					//The graph of a lot of tags can result in slow resizes if they are allowed to happen as fast as resize events come it.
					//Create a counter that will show the resize events coming in.
					//If the chart has more than 5000 points, then use the resize interval, not real-time.
					vm.resizeEventCounter = 0;
					vm.pointCount = 0;
					vm.pointCountResizeIntervalLevel = 50000;
					vm.resizeInterval = $interval(function () {
						if (vm.resizeEventCounter > 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							vm.resizeEventCounter = 0;
						}
					}, 500);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						//console.log("Widget resize event");
						//Set a counter to increment with each resize event.
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							if (vm.pointCount < vm.pointCountResizeIntervalLevel) {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							} else {
								vm.resizeEventCounter++;
							}
							//console.log("vm.pointCount = " + vm.pointCount);
						}
					});


					


					$scope.$on("$destroy", function () {
						$interval.cancel(vm.resizeInterval);

					});
					//***G



					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveJamDevicesWithLongestDuration Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});



					$scope.$on("Dashboard.TagsToGraph", function (event, tagsToGraph) {
						vm.widget.tagsToGraph = tagsToGraph;

					});

					$scope.$on("Widget.AddTagsToGraph", function (event, widget) {
						//See if the widget selected is us
						if (widget.Id == vm.widget.Id) {
							//Add all of the tag ids to the WidgetGraphTag table
							$q.all(vm.widget.tagsToGraph.select(function (t) {
								return dataService.AddEntity("WidgetGraphTags", { WidgetId: vm.widget.Id, TagId: t.TagId });

							})).then(function () {

								//This will cause all graph selecting widgets to clear their local collection of tags to graph, causing all of the buttons depressed to reset.
								$rootScope.$broadcast("GraphWidgetAdded", vm.widget);
								vm.widget.tagsToGraph = null;

								//Clear out the selection of tag to graph
								vm.dashboard.tagsToGraph = [];
								GetChartData();
							});

						}


					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.AskUserCheckForDeleteSeries = function (series) {
						alertify.set({
							labels: {
								ok: "Just Hide Tag",
								cancel: "Remove Tag From Chart"
							},
							buttonFocus: "ok"
						});

						var message = series.name;

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "hide"

								console.log("hide");




							} else {
								// user clicked "no"
								console.log("remove");
								var tagId = series.options.tagId;
								series.remove();
								dataService.GetIOPSResource("WidgetGraphTags")
									.filter("TagId", tagId)
									.filter("WidgetId", vm.widget.Id)
									.query()
									.$promise
									.then(function(data) {
										data[0].Id = -data[0].Id;
										data[0].$save();


									});


							}
						});

					}


					//The function below will determine the data point with the highest density of points.
					function TemporallyNormalize() {
						var earliestStartDate = new Date('1/1/2500');
						//console.log("Data To Analyze = %O", data);
						vm.GraphTagsData.forEach(function (tagSet) {
							console.log("tagSet = %O", tagSet);
							tagSet.Observations.forEach(function(obs) {
								if (obs.Date < earliestStartDate) {
									earliestStartDate = obs.Date;
								}
							});
						});

						console.log("Earliest Start Date = %O", earliestStartDate);
					}



					function GetChartData(updateOnly) {


						var graphTagObservations = [];
						console.log();
						var startDate = (new Date(vm.dashboard.derivedStartDate));
						startDate = utilityService.GetUTCQueryDate(startDate);

						var endDate = (new Date(vm.dashboard.derivedEndDate));
						endDate = utilityService.GetUTCQueryDate(endDate);

						dataService.GetIOPSResource("WidgetGraphTags")
							.filter("WidgetId", vm.widget.Id)
							.expandPredicate("Tag")
								.expandPredicate("Asset")
									.expand("Site")
									.expand("System")
								.finish()
								.select(["Id", "JBTStandardObservationName"])
							.finish()
							.query()
							.$promise
							.then(function (graphTagsData) {

								vm.GraphTagsData = graphTagsData;
								console.log("Raw WidgetGraphTags Data = %O", graphTagsData);
								$q.all(
									graphTagsData.select(function (gt) {
										return dataService.GetIOPSResource("Observations")
											.filter("TagId", gt.Tag.Id)
											.filter("Date", ">", utilityService.GetUTCQueryDate(vm.dashboard.derivedStartDate))
											.filter("Date", "<", utilityService.GetUTCQueryDate(vm.dashboard.derivedEndDate))
											.query()
											.$promise
											.then(function (data) {
												data.forEach(function (d) {
													d.Date = utilityService.GetLocalDateFromUTCDate(d.Date);
												});

												//Attach the observation data to the graphTagsData
												var graphTag = vm.GraphTagsData.first(function (td) { return td.TagId == gt.TagId });

												//Check the data to see if it is digital and set the property.
												graphTag.isDigital = IsDataDigital(data);
												vm.GraphTagsData.first(function (td) { return td.TagId == gt.TagId }).Observations = data;
												
											});
									})
								).then(function () {


									var digitalStepValue = 0;
									TemporallyNormalize();



									vm.seriesData = vm.GraphTagsData.where(function (gt) { return gt.Observations }).select(function (gt) {
										var seriesObject = {
											tagId: gt.Tag.Id,
											digitalStepValue: digitalStepValue,
											isDigital: gt.isDigital,
											name: gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName,
											data: gt.Observations.orderBy(function (o) { return o.Date }).select(function (o) {
												vm.pointCount++;
												return [o.Date.getTime(), gt.isDigital ? o.FloatValue + digitalStepValue : o.FloatValue];
											})
										};

										if (gt.isDigital) {
											seriesObject.step = 'left';
											digitalStepValue += 1.5;
										}

										return seriesObject;

									});

									vm.allDataIsDigital = vm.GraphTagsData.all(function (gt) { return gt.isDigital });

									console.log("WidgetGraphTags Data with observations = %O", vm.GraphTagsData);
									console.log("Series Data = %O", vm.seriesData);
									CreateChart();
									$timeout(function () {
										displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

									}, 10);

								});


							});




						$scope.$on("dataService.TagUpdate", function (event, newTag) {
							if (vm.GraphTagsData && vm.chart) {
								if (vm.GraphTagsData.any(function (t) { return t.TagId == newTag.TagId })) {

									//This is an update to one of our tags.
									console.log("Tag Update from the Dataservice = %O", newTag);
									var chartSeriesForTag = vm.chart.series.first(function (s) { return s.options.tagId == newTag.TagId });
									console.log("chartSeriesForTag = %O", chartSeriesForTag);


									//The chart series might have been removed by the user. Check for a non null value before proceding.
									if (chartSeriesForTag) {

										chartSeriesForTag.addPoint([newTag.LastObservationDate.getTime(), chartSeriesForTag.options.isDigital ? +newTag.LastObservationTextValue + chartSeriesForTag.options.digitalStepValue : +newTag.LastObservationTextValue], true, false);
										vm.chart.redraw();										
									}
								}

							}
						});
					}

					GetChartData();

					function IsDataDigital(observations) {
						//This will do a distinct on the data, and see if it consists entirely of 0 and 1
						var distinctData = observations.distinct(function (a, b) { return a.FloatValue == b.FloatValue });
						return distinctData.length == 2;
					}



					function GetChartYAxisTypeBasedOnValueSpread() {
						var highValue = 0;
						var lowValue = 9999999999999;

						vm.GraphTagsData.where(function (gt) { return gt.Observations }).forEach(function (gt) {
							gt.Observations.forEach(function (o) {

								if (o.FloatValue > highValue) {
									highValue = o.FloatValue;
								}
								if (o.FloatValue < lowValue) {
									lowValue = o.FloatValue;
								}

							});
						});

						if ((highValue - lowValue) > 20) {
							return 'logarithmic';
						} else {
							return 'linear';
						}


					}


					function CreateChart() {

						var chartOptions = {

							chart: {
								zoomType: 'x'
							},
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},
							rangeSelector: {
								selected: 4,
								inputEnabled: false,
								buttonTheme: {
									visibility: 'hidden'
								},
								labelStyle: {
									visibility: 'hidden'
								}

							},
							navigator: {
								adaptToUpdatedData: false
							},

							legend: {
								enabled: true,
								layout: 'vertical',
								labelFormatter: function () {
									return this.name;
								}

							},
							credits: { enabled: false },
							yAxis: {
								type: GetChartYAxisTypeBasedOnValueSpread(),
								labels: {
									enabled: !vm.allDataIsDigital,
									formatter: function () {
										return this.value;
									}
								},
								plotLines: [{
									value: 0,
									width: 2,
									color: 'silver'
								}]
							},

							xAxis: {
								type: 'datetime',
								visible: !vm.allDataIsDigital
							},

							plotOptions: {
								series: {
									showInNavigator: true,
									marker: {
										enabled: false
									}

								},
								line: {

									events: {
										legendItemClick: function () {
											console.log('%O', this);
											if (this.visible) {
												vm.AskUserCheckForDeleteSeries(this);
											}
											
										}
									},
									showInLegend: true
								}
							},

							tooltip: {
								//pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
								pointFormatter: function () {
									//console.log("Formatter function this = %O", this);
									return '<span style="color:' + this.color + '">' + this.series.name + '</span>: <b>' +
											(this.series.options.isDigital ? this.y - this.series.options.digitalStepValue : this.y) +
										'</b><br/></span>';

								},
								valueDecimals: 2,
								split: true,
								shared: false
							},

							series: vm.seriesData
						};

						if (vm.allDataIsDigital) {

							chartOptions.yAxis.gridLineWidth = 0;
							chartOptions.yAxis.minorGridLineWidth = 0;

						}

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('tagGraph' + vm.widget.Id, chartOptions);
						//console.log("vm.chart = %O", vm.chart);
					}
				};





				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/tagGraph.html?" + Date.now(),

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