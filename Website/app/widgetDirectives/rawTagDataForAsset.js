(function () {

	var app = angular.module('app');

	app.directive('rawTagDataForAsset',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.alarms = [];

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					vm.columnHideWidth1 = 980;
					vm.columnHideWidth2 = 600;




					$scope.$$postDigest(function () {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});
					
					function GetHeadingExtraTitle() {
						//console.log("Getting the title");
						//console.log("vm = %O", vm);
						if (vm.GateSystem && vm.Asset) {
							var site = vm.JBTData.Sites.first(function(s) { return s.Id == vm.GateSystem.SiteId });
							return ' - ' +site.Name +' Gate ' + vm.GateSystem.Name + ' - ' + vm.Asset.Name +  (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
						}
					}


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: 'TagName',
						headingExtraTitle: GetHeadingExtraTitle(),
						obscureGraphics: true
					}

					vm.tagsToGraph = [];

					uibButtonConfig.activeClass = 'radio-active';

					vm.headingUpdateInterval =	$interval(function() {
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					},500);


					$scope.$on("$destroy", function () {
						$interval.cancel(vm.headingUpdateInterval);

					});
					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}



					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//console.log("vm.tagsToGraphObjects = %O", vm.tagsToGraphObjects);



						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						vm.addTagsToGraphFunction()(vm.tagsToGraphObjects);




						return;
					}


					//Id the dashboard parameteres change, then reload the data based upon the date range.
					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboard.Id) {
							vm.dashboard = dashboard;

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
							if (oldValue != newValue) {
								vm.terminals = null;
								vm.zones = null;
								vm.gates = null;
								vm.assets = null;
								vm.Asset = null;
								vm.widget.WidgetResource.TerminalSystemId = null;
								vm.widget.WidgetResource.ZoneSystemId = null;
								vm.widget.WidgetResource.GateSystemId = null;
								vm.widget.WidgetResource.AssetId = null;
								vm.widget.WidgetResource.$save();
								GetTerminalsForWidgetSite();
							}
						}
					});

					function GetTerminalsForWidgetSite() {
						if (vm.widget.WidgetResource.SiteId) {

							//console.log("Getting the terminals for the widget site");

							vm.terminals = vm.JBTData
								.Systems
								.where(function (s) { return s.SiteId == vm.widget.WidgetResource.SiteId && s.Type == 'Terminal' });


							if (vm.terminals.length > 0) {
								GetZonesForWidgetTerminal();
							}



						}
					}

					//Start watching for terminal id changes	
					$scope.$watch("vm.widget.WidgetResource.TerminalSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TerminalSystemId) {

							console.log("vm.widget.WidgetResource.TerminalSystemId changed. Old = %O", oldValue);
							console.log("vm.widget.WidgetResource.TerminalSystemId changed. New = %O", newValue);
							if (newValue != oldValue) {
								vm.widget.WidgetResource.ZoneSystemId = null;
								vm.widget.WidgetResource.GateSystemId = null;
								vm.widget.WidgetResource.AssetId = null;
								vm.zones = null;
								vm.gates = null;
								vm.assets = null;
								vm.Asset = null;
								vm.widget.WidgetResource.$save();

							}

							GetZonesForWidgetTerminal();
						}
					});

					function GetZonesForWidgetTerminal() {
						if (vm.terminals && vm.widget.WidgetResource.TerminalSystemId) {

							console.log("Getting the zone (area system) for the widget terminal");

							vm.zones = vm.JBTData
								.Systems
								.where(function (s) { return s.Type == 'Zone' && s.ParentSystemId == vm.widget.WidgetResource.TerminalSystemId }) //children of this terminal
								.where(function (zoneSystem) { return vm.JBTData.Systems.any(function (s) { return s.Type == 'Gate' && s.ParentSystemId == zoneSystem.Id }) }) //that have at least one gate system child
								.orderBy(function (z) { return z.Name });



							console.log("vm.zones = %O", vm.zones);
							vm.widget.WidgetResource.$save();
							GetGatesForWidgetZone();

						}
					}



					//Start watching for zone id changes	
					$scope.$watch("vm.widget.WidgetResource.ZoneSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.ZoneSystemId) {

							console.log("vm.widget.WidgetResource.ZoneSystemId changed. Now = %O", vm.widget);
							if (newValue != oldValue) {
								vm.gates = null;
								vm.assets = null;
								vm.Asset = null;
								vm.widget.WidgetResource.GateSystemId = null;
								vm.widget.WidgetResource.$save();

							}
							GetGatesForWidgetZone();
						}
					});

					function GetGatesForWidgetZone() {
						if (vm.zones && vm.widget.WidgetResource.ZoneSystemId) {

							console.log("Getting the gate (gate system) for the widget zone");


							vm.gates = vm.JBTData
								.Systems
								.where(function (s) { return s.Type == 'Gate' })
								.where(function (s) { return s.ParentSystemId == vm.widget.WidgetResource.ZoneSystemId })
								.orderBy(function (s) { return s.Name });



							console.log("vm.gates = %O", vm.gates);


						}
					}


					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {

						
						if (vm.widget.WidgetResource.GateSystemId) {

							console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.Asset = null;
								vm.widget.WidgetResource.AssetId = null;
								vm.widget.WidgetResource.$save();

								dataService.GetEntityById("SystemGroups", newValue).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
									console.log("vm.GateSystem = %O", vm.GateSystem);
									GetAssetsForGate();
									
									return;
								});


							}
							GetAssetsForGate();
						}
					});



					function GetAssetsForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;

							if (vm.widget.WidgetResource.GateSystemId) {
								dataService.GetEntityById("SystemGroups", vm.widget.WidgetResource.GateSystemId).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
									vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								});

							}

							vm.assets = vm.JBTData
								.Assets
								.where(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId })
								.orderBy(function(a){return a.Name});



							if (vm.widget.WidgetResource.AssetId) {
								vm.Asset = vm.assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
							}



							vm.widget.WidgetResource.$save();


							if (vm.Asset) {
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								GetTagsForAsset();
							}




						});


					}

					//Start watching for asset id changes	
					$scope.$watch("vm.widget.WidgetResource.AssetId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {


							if (newValue != oldValue && newValue > 0) {
								vm.widget.WidgetResource.AssetId = +newValue;
								vm.widget.WidgetResource.$save();
								dataService.GetJBTData().then(function(data){
									vm.Asset = data.Assets.first(function(a) { return a.Id == +newValue });
									GetTagsForAsset();
								});
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();


							}

						}
					});








					function GetTagsForAsset() {
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.Asset.Id).then(function () {


							

							$timeout(function() {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							}, 50);


							console.log('======= Aircraft Docked = %O', vm.Asset.Tags.first(function(t){return t.JBTStandardObservationId == 12245}));
							console.log('======= Audible Warning = %O', vm.Asset.Tags.first(function(t){return t.JBTStandardObservationId == 3792}));




							console.log("Monitoring asset = %O", vm.Asset);
							
						});
					}

					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						console.log("Opening settings vm.Asset = %O", vm.Asset);


						if (!vm.Asset) {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id)
								.css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideDown();
						} else {
							
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
						}
					}



					vm.leastId = 0;





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

					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {


						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						console.log("Widget.AddTagsToGraph event at PCA Summary");

						//Clear the add tag checkbox buttons
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph = [];
					});



					vm.scrolledToEnd = function () {
						console.log("Scrolled to end fired");
						//var leastId = vm.alarms.min(function (d) { return d.Id });
						//GetData(leastId);

					}




				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/rawTagDataForAsset.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
						addTagsToGraphFunction: "&",
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