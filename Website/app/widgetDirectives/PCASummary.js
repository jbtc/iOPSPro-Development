(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					vm.showSettings = true;
					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					console.log("vm.widget = %O", vm.widget);

					console.log("vm.user = %O", vm.user);
					//displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);



					var gaugeOptions = {

						chart: {
							type: 'solidgauge'
						},

						title: null,

						pane: {
							center: ['50%', '85%'],
							size: '140%',
							startAngle: -90,
							endAngle: 90,
							background: {
								backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
								innerRadius: '60%',
								outerRadius: '100%',
								shape: 'arc'
							}
						},

						tooltip: {
							enabled: false
						},

						// the value axis
						yAxis: {
							stops: [
								[0.1, '#55BF3B'], // green
								[0.5, '#DDDF0D'], // yellow
								[0.9, '#DF5353'] // red
							],
							lineWidth: 0,
							minorTickInterval: null,
							tickAmount: 2,
							title: {
								y: -70
							},
							labels: {
								y: 16
							}
						},

						plotOptions: {
							solidgauge: {
								dataLabels: {
									y: 5,
									borderWidth: 0,
									useHTML: true
								}
							}
						}
					};

					$timeout(function () {
						if (!vm.pca) {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();


							$("#widget-settings-" + vm.widget.WidgetResource.Id).css({ left: position.left + 20, top: position.top + 35, width: 500 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
						}
					}, 200);


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
								vm.pca = null;
								vm.widget.WidgetResource.TerminalSystemId = null;
								vm.widget.WidgetResource.ZoneSystemId = null;
								vm.widget.WidgetResource.GateSystemId = null;
								vm.widget.WidgetResource.$save();
								GetTerminalsForWidgetSite();
							}
						}
					});

					function GetTerminalsForWidgetSite() {
						if (vm.widget.WidgetResource.SiteId) {

							console.log("Getting the terminals for the widget site");

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
								vm.zones = null;
								vm.gates = null;
								vm.pca = null;
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
								.where(function (zoneSystem) { return vm.JBTData.Systems.any(function (s) { return s.Type == 'Gate' && s.ParentSystemId == zoneSystem.Id && s.Assets.any(function (gateSystemAsset) { return gateSystemAsset.Name == "PCA" }) }) }) //that have at least one gate system child
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
								vm.pca = null;
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
								.where(function (s) { return vm.JBTData.Assets.any(function (a) { return a.ParentSystemId == s.Id && a.Name == 'PCA' }) })
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
								vm.pca = null;
								vm.widget.WidgetResource.$save();
								$timeout(function () {
									if (vm.pca) {
										//Uncomment to cause the settings window to close after a short delay after gate selection
										//$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
									}
								}, 400);
							}
							GetAssetsForGate();
						}
					});



					function GetAssetsForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;




							vm.pca = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });




							console.log("vm.pca = %O", vm.pca);


							vm.widget.WidgetResource.AssetId = vm.pca.Id;
							vm.widget.WidgetResource.$save();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id).then(function () {

								dataService.GetIOPSResource("AssetGraphics")
									.filter("AssetId", vm.pca.Id)
									.filter("JBTStandardObservationId", "!=", null)
									.query()
									.$promise
									.then(function (data) {


										//Add a boolean on or off flag to each image. The view will use this to show the image or not.
										data.select(function (i) {
											i.showImage = false;
										});
										vm.AssetGraphics = data;

										//Just for simulation
										//if (vm.AssetGraphics && vm.AssetGraphics.length > 0) {
										//	vm.AssetGraphics[0].showImage = true;

										//}

										$timeout(function () {
											SetupAccordion();

										}, 50);

										console.log("Asset Graphics = %O", data);
										vm.pca.Tags.forEach(function(tag) {
											UpdateGraphicsVisibilityForSingleTag(tag);
										});
									});
							});



						});


					}



					function SetupAccordion() {
						$scope.$$postDigest(function () {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							$scope.$$postDigest(function () {
								$(function () {
									$("#accordion" + vm.widget.Id)
									  .accordion({
									  	header: "> div > h3",
									  	collapsible: true,
									  	heightStyle: "fill"

									  })
									  .sortable({
									  	axis: "y",
									  	handle: "h3",
									  	stop: function (event, ui) {
									  		// IE doesn't register the blur when sorting
									  		// so trigger focusout handlers to remove .ui-state-focus
									  		console.log("Stop Drag event = %O", event);
									  		console.log("Stop Drag ui = %O", ui);
									  		ui.item.children("h3").triggerHandler("focusout");

									  		// Refresh accordion to handle new order
									  		$(this).accordion("refresh");
									  	}
									  });





								});

								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerGraphics' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage, vm.widget.WidgetResource.SplitRightPercentage],
											minSize: 200,
											onDragEnd: function () {
												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];
												vm.widget.WidgetResource.$save();
												console.log("Split Sizes = %O", sizes);
											}
										});
								});


							});


						});


					}


					//Simulate values changing
					//var index = 0;
					//$interval(function () {
					//	//vm.showAssetModelImages = !vm.showAssetModelImages;
					//	if (vm.AssetGraphics && vm.AssetGraphics.length > 0) {
					//		if (vm.AssetGraphics[index]) {
					//			vm.AssetGraphics[index++].showImage = false;
					//			if (index == vm.AssetGraphics.length) {
					//				index = 0;
					//			}

					//		}
					//		vm.AssetGraphics[index].showImage = true;

					//	}


					//}, 400);




					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

						}
					});


					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						UpdateGraphicsVisibilityForSingleTag(updatedTag);
					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag) {
							//See if this is the asset to which the tag belongs
							if (updatedTag.AssetId == vm.pca.Id) {
								console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								vm.AssetGraphics
									.where(function (g) { return g.JBTStandardObservationId == updatedTag.JBTStandardObservationId })
									.forEach(function (g) {
										g.showImage = updatedTag.LastObservationTextValue == g.ValueWhenVisible;
									});
							}

						} 


					}
					//***G









					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("pcaSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						}
					});

					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});





					//vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

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