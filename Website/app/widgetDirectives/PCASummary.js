(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;

					vm.showSettings = true;
					vm.bootstrapLabelColumns = 3;
					vm.bootstrapInputColumns = 9;

					//Get a copy of the user record to determine privs
					console.log("=========== PCA Summary Directive ================================================");
					vm.user = Global.User;
					console.log("vm.widget = %O", vm.widget);

					console.log("vm.user = %O", vm.user);

					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function(JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = vm.user.ReaderOf.where(function(s) { return s.split('.')[0] == 'Site' })
							.select(function(s) { return s.split('.')[1] });

						console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function(site) {
							return userSiteCodes.any(function(sc) { return sc == site.Name })
						});

						console.log("vm.userSites = %O", vm.userSites);

						if (vm.userSites.length == 1) {
							console.log("User only has a single Site");
							vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
							vm.widgetSite = vm.userSites[0];
							GetTerminalsForWidgetSite();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								GetTerminalsForWidgetSite();
							}
						}
					});

					//Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.SiteId && vm.userSites) {

							console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.SiteId });
							vm.terminals = null;
							vm.zones = null;
							vm.gates = null;
							vm.pca = null;
							GetTerminalsForWidgetSite();
						}
					});

					function GetTerminalsForWidgetSite() {
						if (vm.widget.WidgetResource.SiteId) {

							console.log("Getting the terminals for the widget site");

							vm.terminals = vm.JBTData
								.Systems
								.where(function(s) { return s.SiteId == vm.widget.WidgetResource.SiteId && s.Type == 'Terminal' });


							if (vm.terminals.length > 0) {								
								vm.widget.WidgetResource.TerminalSystemId = vm.terminals[0].Id;
								vm.widgetTerminal = vm.terminals[0];
								GetZonesForWidgetTerminal();
							}

						}
					}

					//Start watching for terminal id changes	
					$scope.$watch("vm.widget.WidgetResource.TerminalSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TerminalSystemId) {

							console.log("vm.widget.WidgetResource.TerminalSystemId changed. Now = %O", vm.widget);
							vm.widget.WidgetResource.ZoneSystemId = null;
							vm.widget.WidgetResource.GateSystemId = null;
							vm.zones = null;
							vm.gates = null;
							vm.pca = null;
							GetZonesForWidgetTerminal();
						}
					});

					function GetZonesForWidgetTerminal() {
						if (vm.terminals && vm.widget.WidgetResource.TerminalSystemId) {

							console.log("Getting the zone (area system) for the widget terminal");

							vm.zones = vm.JBTData
								.Systems
								.where(function(s){return s.Type == 'Zone' && s.ParentSystemId == vm.widget.WidgetResource.TerminalSystemId});

							console.log("vm.zones = %O", vm.zones);
							if (vm.zones.length == 1) {
								vm.widget.WidgetResource.ZoneSystemId = vm.zones[0].Id;
								vm.widgetZone = vm.zones[0];
							}
							GetGatesForWidgetZone();

						}
					}



					//Start watching for zone id changes	
					$scope.$watch("vm.widget.WidgetResource.ZoneSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.ZoneSystemId) {

							console.log("vm.widget.WidgetResource.ZoneSystemId changed. Now = %O", vm.widget);
							vm.gates = null;
							vm.pca = null;
							GetGatesForWidgetZone();
						}
					});

					function GetGatesForWidgetZone() {
						if (vm.zones && vm.widget.WidgetResource.ZoneSystemId) {

							console.log("Getting the gate (gate system) for the widget zone");

							vm.gates = vm.JBTData
								.Systems
								.where(function (s) { return s.Type == 'Gate' && s.ParentSystemId == vm.widget.WidgetResource.ZoneSystemId && vm.JBTData.Assets.any(function(a){return a.ParentSystemId == s.Id && a.Name == 'PCA'})});

							console.log("vm.gates = %O", vm.gates);
							if (vm.gates.length == 1) {
								vm.widget.WidgetResource.GateSystemId = vm.gates[0].Id;
								vm.widgetGate = vm.gates[0];
							}


						}
					}


					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);
							vm.pca = null;
							GetAssetsForGate();
						}
					});



					function GetAssetsForGate() {


						vm.pca = vm.JBTData
							.Assets
							.first(function(a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });

						console.log("vm.pca = %O", vm.pca);
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id);

					}
					



					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

						}
					});

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("pcaSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						}
					});

					vm.state = $state;


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					//var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					//vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					//console.log("vm.diffDays = " + vm.diffDays);


					//console.log("pcaSummary widget = %O", vm.widget);
					//console.log("pcaSummary dashboard = %O", vm.dashboard);
					//console.log("pcaSummary widgetId = %O", vm.widget.Id);

					//$scope.$on("BHS.CurrentAlarm", function (event, a) {
					//	a = dataService.GetJsonFromSignalR(a);


					//});



					//$scope.$on("WidgetResize", function (event, resizedWidgetId) {
					//	if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
					//		displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
					//	}
					//});





				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/pcaSummary.html?" + Date.now(),

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