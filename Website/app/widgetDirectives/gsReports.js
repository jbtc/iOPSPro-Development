(function () {

	var app = angular.module('app');

	app.directive('gsReports',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.alarms = [];

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetHeadingExtraTitle() {
							return ' - ' + vm.widgetSite.Name;
					}

					

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}


					vm.columnwidths = {
						Name: 30,
						Description: 10,
						LastRunDate: 10,
						Run: 12
					}

					vm.RunReport = function (report) {



						var timeZoneOffsetHoursFromUTC = (new Date().getTimezoneOffset()) / 60;

						window.open(report.RSURL + '&accessToken=' + encodeURIComponent(Global.User.ODataAccessToken) + '&offset=' + timeZoneOffsetHoursFromUTC + '&siteId=' + vm.widget.WidgetResource.SiteId);
						window.open(report.RSURL);


						if (report.GSReportRuns.length == 0) {
							//Record the fact the the report has been run.
							dataService.AddEntity("GSReportRuns",
								{
									Date: utilityService.GetOdataUpdateableCurrentDateTime(),
									UserId: Global.User.Id,
									GSReportId: report.Id
								}).then(function(newReportRun) {

									report.GSReportRuns.push(newReportRun);
									SetLastRunDatePropertyForCollection(vm.reports);

							});
						} else {

							//Get the report run from the database to update it
							dataService.GetEntityById("GSReportRuns", report.GSReportRuns[0].Id).then(function(dbReportRun) {
								dbReportRun.Date = utilityService.GetOdataUpdateableCurrentDateTime();
								dbReportRun.$save();
								report.GSReportRuns[0] = dbReportRun;
								SetLastRunDatePropertyForCollection(vm.reports);

							});

						}

					}


					$scope.$on("GSReports", function (event, r) {
						r = dataService.GetJsonFromSignalR(r);
						console.log("GSReports event. GSReport = %O", r);
						GetData();

					});
					//GetData();




					vm.sortField = 'Name';

					vm.SetSortField = function (fieldName) {

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


					function GetData() {

						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

						dataService.GetIOPSResource("GSReports")
							.expandPredicate("GSReportRuns")
								.filter("UserId", Global.User.Id)
							.finish()
							.query()
							.$promise
							.then(function (data) {

								SetLastRunDatePropertyForCollection(data);
								vm.reports = data;

								console.log("Report Data = %O", data);

								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

								$scope.$$postDigest(function () {
									$timeout(function () {
										displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									}, 1);

								});

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();


							})




					}

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
							GetData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								GetData();
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
								GetData();
							}
						}
					});

					function SetLastRunDatePropertyForCollection(collection) {
						collection.forEach(function(r) {
							r.LastRunDate = r.GSReportRuns.length > 0 ? r.GSReportRuns[0].Date : null;
						});
						
					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});



					vm.scrolledToEnd = function () {
						//console.log("Scrolled to end fired");
						//var leastId = vm.alarms.min(function (d) { return d.Id });
						//GetData(leastId);

					}




				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/gsReports.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
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