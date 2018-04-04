(function () {

	var app = angular.module('app');

	app.directive('siteActiveAlarms',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata) {

				var controller = function ($scope) {
					var vm = this;


					console.log("siteActiveAlarms directive controller invoked. vm = %O", vm);


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


					vm.user = Global.User;

					vm.canCloseAlarm = Global.User.AuthorizedActivities.any(function (aa) { return aa == "AuthorizedActivity.AdministerSystem" });


					vm.closeAlarm = function (alarm) {
						//Go and get a "pure" copy of the observation before closing
						alertify.set({
							labels: {
								ok: "Yes, Close this Alarm",
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to close this alarm?';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"

								return dataService.AddEntity("ChronologicalRawTagValueLogKepwareReceivers",
								{
									ObservationDateTime: utilityService.GetOdataUpdateableCurrentDateTime(),
									Value: "0",
									TagName: alarm.TagName

								});



							} else {
								// user clicked "no"
								toastr.info(location.Name, "Alarm was NOT closed!");
							}
						});


					}


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;


					vm.OpenSettingsIfNoTerminalAndCloseIfTerminalIsPresent = function () {

						console.log("Opening settings vm.terminalSystem = %O", vm.terminalSystem);


						if (!vm.terminalSystem) {
							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}




					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = vm.user.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
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
							GetAlarmTagsForSite();
							GetChartData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetAlarmTagsForSite();
								GetChartData();
							}
						}
						console.log("vm.widgetSite = %O", vm.widgetSite);
					});




					//Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.SiteId && vm.userSites) {

							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.SiteId });
							console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							if (oldValue != newValue) {
								vm.terminals = null;
								vm.terminalSystem = null;
								vm.widget.WidgetResource.$save();
								vm.activeAlarms = [];
								GetAlarmTagsForSite();
								GetChartData();
							}
						}
					});


					var fontFactor = .01;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {
							
							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("siteActiveAlarms Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					vm.chartDataInterval = $interval(function () {
						GetChartData();
					}, 300000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.chartDataInterval);
					});

					vm.tableDataInterval = $interval(function () {
						GetAlarmTagsForSite();
					}, 30000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.tableDataInterval);
					});


					//console.log("vm.diffDays = " + vm.diffDays);
					dataService.GetIOPSCollection("GSJBTStandardObservationIdExclusionListFromCurrentAlarms").then(function(data) {
						vm.exclusionList = data;
						console.log("vm.exclusionList = %O",vm.exclusionList);
					});

					function GetAlarmTagsForSite() {

						dataService.GetIOPSResource("Tags")
							.filter("SiteId", vm.widget.WidgetResource.SiteId)
							.filter($odata.Predicate.or([new $odata.Predicate("IsAlarm", true), new $odata.Predicate("IsCritical", true)]))
							.filter("LastObservationTextValue", "1")
							.expandPredicate("JBTStandardObservation")
								.expand("GSJBTStandardObservationIdExclusionListFromCurrentAlarms")
							.finish()
							.filter(new $odata.Func('indexof', 'Name', '|'), '>', 1)
							.query()
							.$promise
							.then(function (data) {

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								data = data.where(function (d) { return !d.JBTStandardObservation.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.length > 0 });


								//console.log("Raw Alarm Data = %O", data);

								dataService.PlaceTagsIntoInventory(data);
								if (!vm.activeAlarms) {
									vm.activeAlarms = [];
								}
								vm.activeAlarms = dataService.cache.tags.where(function (dsTag) { return data.any(function (dataItem) { return dataItem.Id == dsTag.TagId }) });
								console.log("Alarm tags = %O", vm.activeAlarms);

								$interval(function () {
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									SetChartSizeLine(vm.widget.Id, vm.chart);
									SetLargeFontSize();
								}, 25, 20);

								//$scope.$$postDigest(function () {
								//	$timeout(function() {

								//		var $table = $('#table' + vm.widget.Id);
								//		console.log("Identified table = %O", $table);
								//		$table.floatThead();
								//		//$table.floatThead({
								//		//	scrollContainer: function () {
								//		//		return $('#table-wrapper' + vm.widget.Id);
								//		//	}
								//		//});
								//	},250);
								//});



							});

					}

					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						if (updatedTag.SiteId == vm.widget.WidgetResource.SiteId &&
							(updatedTag.IsAlarm || updatedTag.IsCritical) &&
							updatedTag.TagName.indexOf('|') >= 3 && 
							!vm.exclusionList.any(function(ex){ return updatedTag.JBTStandardObservationId == ex.jbtStandardObservationId})
						) {
							//console.log("Alarm Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.activeAlarms) {
									vm.activeAlarms.push(updatedTag);
								} else {
									vm.activeAlarms = [];
									vm.activeAlarms.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.activeAlarms) {
									vm.activeAlarms = vm.activeAlarms.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}

						}

					});

					
					function GetChartData(refresh) {


						console.log("Getting chart data");

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "gSAlertCountByDay" : "gSAlertCountByHour")
							.query({
								siteId: vm.widget.WidgetResource.SiteId,
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate
							}, function (data) {
								console.log("gSAlertCountByxxxx initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.TimeStamp)).getTime(), item.AlarmCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							});
					}



					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (widgetBodyDimensions) {
							if (chart) {
								chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
							}
							
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						vm.chart = Highcharts.chart('containerSiteActiveAlarms' + vm.widget.Id, {
							chart: {
								type: 'spline',
								animation: false,
								marginRight: 10,
								events: {
									load: function () {

										// set up the updating of the chart each second
										vm.chartSeries = this.series[0];
									}
								}
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour',
								style: {
									fontSize: '.8em'
								}
							},
							xAxis: {
								type: 'datetime',
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
								}
							},
							yAxis: {
								title: {
									text: ''
								},
								plotLines: [{
									value: 0,
									width: 1,
									color: '#808080'
								}]
							},
							tooltip: {
								formatter: function () {

									//console.log("Current this = %O", this);
									return '<b>' + this.series.name + '</b><br/>' +
										Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
										+ '<br/>' +
										Highcharts.numberFormat(this.y, 0) + ' Alarms';
								}
							},
							legend: {
								enabled: false
							},
							exporting: {
								enabled: true
							},
							series: [{
								name: 'Alarms',
								data: vm.chartData
							}]
						});

					}


					//console.log("siteCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("siteCurrentAlarmsTable dashboard = %O", vm.dashboard);
					//console.log("siteActiveAlarms widgetId = %O", vm.widget.Id);





					vm.sortField = '-PLCLocalDate';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					//vm.chartUpdateInterval = $interval(function () {
					//	GetChartData();
					//}, 5000);

					//$scope.$on("$destroy", function () {
					//	$interval.cancel(vm.chartUpdateInterval);

					//});







				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteActiveAlarms.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());