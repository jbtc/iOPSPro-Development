(function () {

	var app = angular.module('app');

	app.directive('tagGraph',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$q", "$rootScope",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $q, $rootScope) {

				var controller = function ($scope) {
					var vm = this;


					console.log("tagGraph controller invoked");


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-PLCLocalDate',
						alarmDataSortField: '-PLCLocalDate',
						warningsDataSortField: '-PLCLocalDate',
						headingExtraTitle: '',
						obscureGraphics: true
					}








					//***G
					//++Resizing
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
					}, 300);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						//console.log("Widget resize event");
						//Set a counter to increment with each resize event.
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							if (vm.pointCount < vm.pointCountResizeIntervalLevel) {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								console.log("set size");
							} else {
								vm.resizeEventCounter++;
							}
							//console.log("vm.pointCount = " + vm.pointCount);
						}
					});



					$scope.$on("$destroy", function () {
						$interval.cancel(vm.resizeInterval);
						$interval.cancel(vm.chartUpdateInterval);
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
									.then(function (data) {
										data[0].Id = -data[0].Id;
										data[0].$save().then(function () {
											//GetChartData();
										});


									});


							}
						});

					}


					//The function below will determine the data point with the highest density of points.
					function TemporallyNormalize() {


						var time0 = performance.now();
						var obsCount = 0;
						var tagSetWithEarliestValue;


						var earliestDate = new Date('1/1/2500');
						var latestDate = new Date('1/1/1971');

						vm.GraphTagsData.forEach(function (tagSet) {
							console.log("tagSet = %O", tagSet);
							if (tagSet.Observations) {



								tagSet.Observations.forEach(function (obs) {
									obsCount++;
									if (obs.Date < earliestDate) {
										earliestDate = obs.Date;
										tagSetWithEarliestValue = tagSet;
									}
									if (obs.Date > latestDate) {
										latestDate = obs.Date;
									}
								});

							}
						});

						var time1 = performance.now();


						console.log("Date Range = %O", { First: earliestDate, Last: latestDate });
						console.log("tagSetWithEarliestValue = %O", tagSetWithEarliestValue);
						console.log("bsCount = " + (time1 - time0));
						console.log("Time = " + (time1 - time0));


					}

					function toFixed(number, fractionSize) {
						if (number) {
							var returnNumber = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
							return returnNumber || number;
						}
					}





					function DisplayLoadingMessage(message) {
						vm.loadingMessageArray.push(message);
						console.log("ZZZ - " + message.message);
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
								vm.loadingMessageArray = [];
								console.log("Raw WidgetGraphTags Data = %O", graphTagsData);

								//The values that have to be pulled from observations start from midnight UTC.
								var endingMarginStartDate = new Date();
								endingMarginStartDate.setHours(0, 0, 0, 0);
								var oDataFilterTodayStartDate = utilityService.GetUTCQueryDate(endingMarginStartDate);

								console.log("dashboard = %O", vm.dashboard);
								var messageNumber = 0;


								$q.all(

									graphTagsData.select(function (gt) {

										DisplayLoadingMessage({ number: messageNumber++, message: "Loading Aggregated and Latest " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName});


										return dataService.GetIOPSResource("Observations")
											.filter("TagId", gt.Tag.Id)
											.filter("Date", ">", oDataFilterTodayStartDate)
											.filter("Date", "<", vm.dashboard.oDataFilterEndDate)
											.select(["Date", "FloatValue"])
											.orderBy("Date")
											.query()
											.$promise
											.then(function (data) {

												
												data.forEach(function (d) {
													d.Date = utilityService.GetLocalDateFromUTCDate(d.Date);
												});

												//Attach the observation data to the graphTagsData
												var graphTag = vm.GraphTagsData.first(function (td) { return td.TagId == gt.TagId });

												//Check the data to see if it is digital and set the property.
												vm.GraphTagsData
													.first(function (td) { return td.TagId == gt.TagId })
													.MarginObservations = data.select(
													function (obs) {
														return [obs.Date.getTime(), toFixed(obs.FloatValue, 1) || 0];

													}).orderBy(function (o) { return o.MillisecondsDate });

												DisplayLoadingMessage({ number: messageNumber++, message: "Latest Loaded " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + '  '  + data.length + ' pts'});

											});
										//Add the data queries for the daily aggregates
									}).concat(

										graphTagsData.select(function(gt) {
											return dataService.GetIOPSResource("ObservationAggregatedHighChartValues")
												.filter("TagId", gt.Tag.Id)
												.filter("Day", ">=", vm.dashboard.oDataFilterStartDate)
												.filter("Day", "<=", vm.dashboard.oDataFilterEndDate)
												.orderBy("Day")
												.query()
												.$promise
												.then(function(aggregateData) {

													DisplayLoadingMessage({ number: messageNumber++, message: "Aggregated Values Loaded " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName});


													var time0 = performance.now();
													var valuePairs = aggregateData
														.selectMany(function(d) {
															return d.TagValues
																.split('|')
																.where(function(v) { return v.length > 5 })
																.select(function(valuePair) {
																	var numericValuePair = valuePair.split(',');
																	return [+numericValuePair[0], +numericValuePair[1] || 0];
																});


														});

													gt.AggregateObservations = valuePairs;
													var time1 = performance.now();
													DisplayLoadingMessage({ number: messageNumber++, message: "Aggregated Value Pair Gen Time for: " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + " " + valuePairs.length + " pts = " + (time1 - time0)});
												});

										})




									)
								).then(function () {



									var digitalStepValue = 0.2;
									var digitalStepIncrement = 1.5;
									//TemporallyNormalize();



									vm.seriesData = vm.GraphTagsData.where(function (gt) { return gt.MarginObservations || gt.AggregateObservations }).select(function (gt) {

										DisplayLoadingMessage({ number: messageNumber++, message: "Generating Complete Series for: " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + " " + (time1 - time0)});
										var time0 = performance.now();

										var dataPairs = gt.AggregateObservations
											.concat(gt.MarginObservations)
											.orderBy(function(vp) { return vp[0] });

										console.log("DataPairs = %O", dataPairs);

										gt.isDigital = IsDataDigital(dataPairs);

										var seriesObject = {
											connectNulls: true,
											tagId: gt.Tag.Id,
											digitalStepValue: digitalStepValue,
											isDigital: gt.isDigital,
											//groupPixelWidth: 5,
											name: gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName,
											data: gt.AggregateObservations
												.concat(gt.MarginObservations)
												.orderBy(function(vp){return vp[0]})
												.select(function (o) {
												vm.pointCount++;
												return [o[0], gt.isDigital ? (o[1] || 0) + digitalStepValue : toFixed(o[1],1)];
												//return [o[0], gt.isDigital ? (o[1] || 0) + digitalStepValue : o[1]];
											})
										};


										seriesObject.name += ' (' + utilityService.FormatNumberWithCommas(seriesObject.data.length) +  ' points)';
										var time1 = performance.now();
										console.log("Series Object = %O", seriesObject);
										DisplayLoadingMessage({ number: messageNumber++, message: "Complete Series Generation Time for: " + seriesObject.name + " " + seriesObject.data.length + " pts = " + (time1 - time0)});


										if (gt.isDigital) {
											seriesObject.step = 'left';
											digitalStepValue = digitalStepValue += digitalStepIncrement;
										}

										return seriesObject;

									});

									vm.allDataIsDigital = vm.GraphTagsData.all(function (gt) { return gt.isDigital });

									console.log("WidgetGraphTags Data with observations = %O", vm.GraphTagsData);
									console.log("Series Data = %O", vm.seriesData);
									var pointCount = 0;

									vm.seriesData.forEach(function (sd) {
										pointCount += sd.data.length;
									});
									vm.pointCount = pointCount;
									//console.log("Number of points in chart = " + pointCount);
									vm.widget.displaySettings.headingExtraTitle = ' - ' + utilityService.FormatNumberWithCommas(pointCount) + ' Points in Chart';
									DisplayLoadingMessage({ number: messageNumber++, message: "Creating Chart" });

									CreateChart();
									$timeout(function () {
										displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

									}, 10);

									//Now we can start listening for changes to the data points - IF the time period is 7 days or less.
									console.log("vm.dashboard = %O", vm.dashboard);
									if (vm.dashboard.DashboardTimeScope.Days < 8) {
										
										$scope.$on("dataService.TagUpdate", function (event, newTag) {
											if (vm.GraphTagsData && vm.chart) {
												if (vm.GraphTagsData.any(function (t) { return t.TagId == newTag.TagId })) {

													//This is an update to one of our tags.
													//console.log("Tag Update from the Dataservice = %O", newTag);
													var chartSeriesForTag = vm.chart.series.first(function (s) { return s.options.tagId == newTag.TagId });
													//console.log("chartSeriesForTag = %O", chartSeriesForTag);


													//The chart series might have been removed by the user. Check for a non null value before proceding.
													if (chartSeriesForTag) {
														chartSeriesForTag.addPoint([newTag.ObservationLocalDate.getTime(), chartSeriesForTag.options.isDigital ? +newTag.Value + chartSeriesForTag.options.digitalStepValue : +newTag.Value], true, false);
														vm.chart.redraw();
														vm.chartDataUpdatePending = true;
													}
												}

											}
										});
									}
								});


							});




					}


					vm.chartDataUpdatePending = false;
					vm.chartUpdateInterval = $interval(function() {
						if (vm.chartDataUpdatePending) {						
							vm.chart.redraw();
							vm.chartDataUpdatePending = false;
						}

					}, 1000);




					GetChartData();

					function IsDataDigital(observations) {
						//This will do a distinct on the data, and see if it consists entirely of 0 and 1
						var distinctData = observations.take(100).distinct(function (a, b) { return (a[1] || 0) == (b[1] || 0) });
						console.log("distinctData = %O", distinctData);
						return distinctData.length == 2;
					}

					function IsAggregateDataDigital(observations) {
						//This will do a distinct on the data, and see if it consists entirely of 0 and 1
						var distinctData = observations.take(100).distinct(function (a, b) { return a.FloatValue || 0 == b.FloatValue || 0 });
						return distinctData.length <= 2;
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
						console.log("CreateChart called");
						var chartOptions = {

							chart: {
								zoomType: 'x'
							},

							rangeSelector: {
								enabled: true,
								allButtonsEnabled: true,
								buttons: [
									//{
									//	type: 'minute',
									//	count: 1,
									//	text: 'Min'
									//},
									//{
									//	type: 'hour',
									//	count: 1,
									//	text: 'Hour'
									//},
									//{
									//	type: 'day',
									//	count: 1,
									//	text: 'Day'
									//},
									//{
									//	type: 'week',
									//	count: 1,
									//	text: 'Week'
									//},
									//{
									//	type: 'month',
									//	count: 1,
									//	text: 'Month'
									//},
									{
										type: 'all',
										text: 'All'
									}
								],
								buttonTheme: {
									width: 60
								},
								selected: 5
							},
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},

							navigator: {
								enabled: false,
								handles: {
									backgroundColor: 'yellow',
									borderColor: 'red'
								},
								adaptToUpdatedData: false
							},

							legend: {
								enabled: true,
								//layout: 'vertical',
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
									turboThreshold: 1000,
									showInNavigator: true,
									marker: {
										enabled: false
									},
									states: {
										hover: {
											enabled: false
										}
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
									showInLegend: true,
									lineWidth: 1
								}
							},

							tooltip: {
								//pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
								pointFormatter: function () {
									//console.log("Formatter function this = %O", this);
									return '<span style="color:' + this.color + '">' + this.series.name + '</span>: <b>' +
											(this.series.options.isDigital ? this.y - this.series.options.digitalStepValue : utilityService.ToFixed(this.y, 1)) +
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

						vm.chart = Highcharts.stockChart('tagGraph' + vm.widget.Id, chartOptions);
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