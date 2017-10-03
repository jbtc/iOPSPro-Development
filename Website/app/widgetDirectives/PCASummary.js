(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					function GetHeadingExtraTitle() {
						if (vm.GateSystem) {
							return ' - Gate ' + vm.GateSystem.Name + ' - ' + vm.pca.ModelGenericName;
						}
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#7e7e7e, #fefefe)';


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#7e7e7e, #fefefe)',
						tagDataSortField: '-LastObservationDate',
						headingExtraTitle: '',
						obscureGraphics: true
					}



					vm.tagsToGraph = [];

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

					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						console.log("Opening settings vm.Asset = %O", vm.Asset);


						if (!vm.pca) {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id)
								.css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideDown();
						} else {

							$("#gridster" + vm.widget.Id).css('z-index', '2');
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
						}
					}



					//$timeout(function () {
					//	if (!vm.pca) {

					//		var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
					//		var position = $(element).offset();
					//		position.width = $(element).width();

					//		$("#gridster" + vm.widget.Id).css('z-index', '35');
					//		$("#widget-settings-" + vm.widget.WidgetResource.Id).css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
					//		$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
					//	}
					//}, 200);



					vm.CloseSettings = function () {
						$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
					}

					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						vm.addTagsToGraphFunction()(vm.tagsToGraphObjects);

						return;

					}





					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = vm.user.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

						//console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function (site) {
							return userSiteCodes.any(function (sc) { return sc == site.Name })
						});

						//console.log("vm.userSites = %O", vm.userSites);

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

							//console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
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

							//console.log("vm.widget.WidgetResource.TerminalSystemId changed. Old = %O", oldValue);
							//console.log("vm.widget.WidgetResource.TerminalSystemId changed. New = %O", newValue);
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

							//console.log("Getting the zone (area system) for the widget terminal");

							vm.zones = vm.JBTData
								.Systems
								.where(function (s) { return s.Type == 'Zone' && s.ParentSystemId == vm.widget.WidgetResource.TerminalSystemId }) //children of this terminal
								.where(function (zoneSystem) { return vm.JBTData.Systems.any(function (s) { return s.Type == 'Gate' && s.ParentSystemId == zoneSystem.Id && s.Assets.any(function (gateSystemAsset) { return gateSystemAsset.Name == "PCA" }) }) }) //that have at least one gate system child
								.orderBy(function (z) { return z.Name });



							//console.log("vm.zones = %O", vm.zones);
							vm.widget.WidgetResource.$save();
							GetGatesForWidgetZone();

						}
					}



					//Start watching for zone id changes	
					$scope.$watch("vm.widget.WidgetResource.ZoneSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.ZoneSystemId) {

							//console.log("vm.widget.WidgetResource.ZoneSystemId changed. Now = %O", vm.widget);
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

							//console.log("Getting the gate (gate system) for the widget zone");


							vm.gates = vm.JBTData
								.Systems
								.where(function (s) { return s.Type == 'Gate' })
								.where(function (s) { return s.ParentSystemId == vm.widget.WidgetResource.ZoneSystemId })
								.where(function (s) { return vm.JBTData.Assets.any(function (a) { return a.ParentSystemId == s.Id && a.Name == 'PCA' }) })
								.orderBy(function (s) { return s.Name });



							//console.log("vm.gates = %O", vm.gates);



						}
					}


					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.pca = null;
								vm.widget.WidgetResource.$save();

								dataService.GetEntityById("SystemGroups", newValue).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
									//vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								});

								$timeout(function () {
									if (vm.pca) {
										//Uncomment to cause the settings window to close after a short delay after gate selection
										if (Global.User.Username != 'markzzzz') {
											$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
										}
									}
								}, 400);
							}
							GetAssetsForGate();
						}
					});

					vm.GenerateTemperatureCharts = function () {
						//console.log("Generating...");
						GenerateAmbientTemperatureChart();
						GenerateDischargeTemperatureChart();
						GenerateCabinTemperatureChart();
						DestroyChartIfItExists(vm.primary1CompressorChart);
						vm.primary1CompressorChart = null;
						DestroyChartIfItExists(vm.primary2CompressorChart);
						vm.primary2CompressorChart = null;
						DestroyChartIfItExists(vm.secondary1CompressorChart);
						vm.secondary1CompressorChart = null;
						DestroyChartIfItExists(vm.secondary2CompressorChart);
						vm.secondary2CompressorChart = null;
					}

					vm.GeneratePressureCharts = function () {
						//console.log("Generating...");
						GeneratePrimary1CompressorPressureChart();
						GeneratePrimary2CompressorPressureChart();
						GenerateSecondary1CompressorPressureChart();
						GenerateSecondary2CompressorPressureChart();
						DestroyChartIfItExists(vm.ambientChart);
						vm.ambientChart = null;
						DestroyChartIfItExists(vm.dischargeChart);
						vm.dischargeChart = null;
						DestroyChartIfItExists(vm.cabinChart);
						vm.cabinChart = null;
					}

					function DestroyChartIfItExists(chart) {
						if (chart) {
							chart.destroy();
						}
					}



					function GetAssetsForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;




							vm.pca = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });


							if (vm.widget.WidgetResource.GateSystemId) {
								dataService.GetEntityById("SystemGroups", vm.widget.WidgetResource.GateSystemId).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
								});

							}

							console.log("vm.pca = %O", vm.pca);


							vm.widget.WidgetResource.AssetId = vm.pca.Id;
							vm.widget.WidgetResource.$save();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id).then(function () {




								dataService.GetIOPSResource("AssetGraphics")
									.filter("AssetId", vm.pca.Id)
									.expandPredicate("AssetGraphicVisibleValues")
										.filter("JBTStandardObservationId", "!=", null)
									.finish()
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
											SetupSplitter();
											SetTabBodyHeight();
										}, 50);

										console.log("Asset Graphics = %O", data);
										vm.pca.Tags.forEach(function (tag) {
											UpdateGraphicsVisibilityForSingleTag(tag);
										});

										vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
										vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
										SetHeadingBackground();
										vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
										vm.showWidget = true;

									});
							});
						});
					}



					function SetTabBodyHeight() {
						var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
						var heightToSet = widgetDimensions.height - tabDimensions.height - 9;
						//console.log("Height to set = " + heightToSet);
						$("#tab-content" + vm.widget.Id).css('height', heightToSet);

					}


					function SetHeadingBackground() {
						if (AtLeastOneGraphicIsVisible()) {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';
						} else {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';
						}
					}

					function AtLeastOneGraphicIsVisible() {
						if (vm.AssetGraphics) {
							return vm.AssetGraphics.any(function (ag) { return ag.showImage });
						}
						return false;
					}

					function SetupSplitter() {
						$scope.$$postDigest(function () {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
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
											$interval(function() {

												SetTemperatureChartsToContainerSize();
												SetPressureChartsToContainerSize();
											},25, 20);
										},
										onDrag: function () {
											$timeout(function() {
												
												SetTemperatureChartsToContainerSize();
												SetPressureChartsToContainerSize();
											})
										}

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
							SetTabBodyHeight();
							SetTemperatureChartsToContainerSize();
							SetPressureChartsToContainerSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight();
								SetTemperatureChartsToContainerSize();
								SetPressureChartsToContainerSize();

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




					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						UpdateAmbientChart(updatedTag);
						UpdateDischargeChart(updatedTag);
						UpdateCabinChart(updatedTag);
						UpdatePrimary1CompressorChart(updatedTag);
						UpdatePrimary2CompressorChart(updatedTag);
						UpdateSecondary1CompressorChart(updatedTag);
						UpdateSecondary2CompressorChart(updatedTag);
					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.pca) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.pca.Id) {
								//console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								if (vm.AssetGraphics) {


									vm.AssetGraphics.forEach(function (ag) {

										//Set the "showImage" flag on each appropriately.
										ag.AssetGraphicVisibleValues.forEach(function (vv) {
											if (vv.JBTStandardObservationId == updatedTag.JBTStandardObservationId) {
												vv.showImage = updatedTag.LastObservationTextValue == vv.ValueWhenVisible;
											}
										});


										//Set the upper AssetGraphic flag if ALL of the lower flags are set.
										ag.showImage = ag.AssetGraphicVisibleValues.length > 0 && ag.AssetGraphicVisibleValues.all(function (av) {
											return av.showImage;
										});



									});



								}
							}

						}
						//console.log("vm.widget = %O", vm.widget);

						vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
						SetHeadingBackground();


					}

					function UpdateAmbientChart(updatedTag) {

						//If we have not yet built the ambient chart the ignore it
						if (vm.ambientDataTag && updatedTag.TagId == vm.ambientDataTag.TagId && vm.ambientChart) {
							//console.log("Updating ambient value - ambient data tag = %O", vm.ambientDataTag);
							//console.log("Updating ambient value - updated tag = %O", updatedTag);
							if (vm.ambientChart) {							
								vm.ambientChart.series[0].data.first().update(+vm.ambientDataTag.Value);
							}
						}
					}

					function UpdateDischargeChart(updatedTag) {
						//If we have not yet built the discharge chart the ignore it
						if (vm.dischargeDataTag && updatedTag.TagId == vm.dischargeDataTag.TagId && vm.dischargeChart) {
							//console.log("Updating discharge value");
							if (vm.dischargeChart) {							
								vm.dischargeChart.series[0].data.first().update(+vm.dischargeDataTag.Value);
							}
						}
					}

					function UpdateCabinChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.cabinDataTag && updatedTag.TagId == vm.cabinDataTag.TagId && vm.cabinChart) {
							//console.log("Updating cabin value");
							if (vm.cabinChart) {							
								vm.cabinChart.series[0].data.first().update(+vm.cabinDataTag.Value);
							}
						}
					}

					function UpdatePrimary1CompressorChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.primary1CompressorDataTag && updatedTag.TagId == vm.primary1CompressorDataTag.TagId && vm.primary1CompressorChart) {
							//console.log("Updating pri comp 1 value");
							if (vm.primary1CompressorChart) {							
								vm.primary1CompressorChart.series[0].data.first().update(+vm.primary1CompressorDataTag.Value);
							}
						}
					}

					function UpdatePrimary2CompressorChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.primary2CompressorDataTag && updatedTag.TagId == vm.primary2CompressorDataTag.TagId && vm.primary2CompressorChart) {
							//console.log("Updating pri comp 2 value");
							if (vm.primary2CompressorChart) {							
								vm.primary2CompressorChart.series[0].data.first().update(+vm.primary2CompressorDataTag.Value);
							}
						}
					}

					function UpdateSecondary1CompressorChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.secondary1CompressorDataTag && updatedTag.TagId == vm.secondary1CompressorDataTag.TagId && vm.secondary1CompressorChart) {
							//console.log("Updating sec comp 1 value");
							if (vm.secondary1CompressorChart) {							
								vm.secondary1CompressorChart.series[0].data.first().update(+vm.secondary1CompressorDataTag.Value);
							}
						}
					}

					function UpdateSecondary2CompressorChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.secondary2CompressorDataTag && updatedTag.TagId == vm.secondary2CompressorDataTag.TagId && vm.secondary2CompressorChart) {
							//console.log("Updating sec comp 2 value");
							if (vm.secondary2CompressorChart) {							
								vm.secondary2CompressorChart.series[0].data.first().update(+vm.secondary2CompressorDataTag.Value);
							}
						}
					}


					//***G

					vm.tagOrderByLastChange = true;

					vm.SetTagOrderByLastChange = function () {
						vm.tagOrderByLastChange = true;
						vm.tagOrderByCustom = false;

					}

					vm.SetTagOrderByCustom = function () {
						vm.tagOrderByLastChange = false;
						vm.tagOrderByCustom = true;

					}





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


					//+Generate the Ambient Temperature chart
					function GenerateAmbientTemperatureChart() {

						$scope.$$postDigest(function () {
							var plotBands = [
								{ from: 0, to: 32, color: 'rgba(103,103,255,.35)' },
								{ from: 32, to: 42, color: 'rgba(50,255,50,.35)' },
								{ from: 42, to: 100, color: 'rgba(255,103,103,.35)' }
							];

							vm.ambientDataTag = vm.pca.Tags.where(function (tag) {
								return [3771, 4084, 4335, 4717].any(function (soId) { return soId == tag.JBTStandardObservationId });

							}).first();







							console.log("Ambient Data Tag = %O", vm.ambientDataTag);
							if (!vm.ambientDataTag) {
								console.log("Ambient not found for pca = %O", vm.pca);
							}

							if (vm.ambientDataTag) {
								var options = GetChartOptions('ambient-container' + vm.widget.Id,
									'Ambient',
									0,
									120,
									'deg',
									null,
									+vm.ambientDataTag.Value,
									null);

								console.log("chart options = %O", options);

								vm.ambientChart = new Highcharts.Chart(options);
							}
						});
					}


					//+Generate the Discharge Temperature chart
					function GenerateDischargeTemperatureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 0, to: 32, color: 'rgba(103,103,255,.35)' },
									{ from: 32, to: 42, color: 'rgba(50,255,50,.35)' },
									{ from: 42, to: 100, color: 'rgba(255,103,103,.35)' }
								];

								vm.dischargeDataTag = vm.pca.Tags.where(function (tag) {
									return [4086, 4064, 3826].any(function (soId) { return soId == tag.JBTStandardObservationId });

								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();





								console.log("Discharge Data Tag = %O", vm.dischargeDataTag);
								if (!vm.dischargeDataTag) {
									console.log("Discharge tag not found for pca = %O", vm.pca);
								}

								if (vm.dischargeDataTag) {
									var options = GetChartOptions('discharge-container' + vm.widget.Id,
										'Discharge',
										0,
										120,
										'deg',
										null,
										+vm.dischargeDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.dischargeChart = new Highcharts.Chart(options);
								}
							});
					}

					//+Generate the Cabin Temperature chart
					function GenerateCabinTemperatureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 0, to: 32, color: 'rgba(103,103,255,.35)' },
									{ from: 32, to: 42, color: 'rgba(50,255,50,.35)' },
									{ from: 42, to: 100, color: 'rgba(255,103,103,.35)' }
								];

								vm.cabinDataTag = vm.pca.Tags.where(function (tag) {
									return [4063, 3920].any(function (soId) { return soId == tag.JBTStandardObservationId });
								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();





								console.log("Cabin Data Tag = %O", vm.cabinDataTag);
								if (!vm.cabinDataTag) {
									console.log("Cabin tag not found for pca = %O", vm.pca);
								}

								if (vm.cabinDataTag) {
									var options = GetChartOptions('cabin-container' + vm.widget.Id,
										'Cabin',
										0,
										120,
										'deg',
										null,
										+vm.cabinDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.cabinChart = new Highcharts.Chart(options);
								}
							});
					}

					//+Generate the Primary 1 Compressor chart
					function GeneratePrimary1CompressorPressureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 50, to: 100, color: 'rgba(103,103,255,.35)' },
									{ from: 100, to: 400, color: 'rgba(50,255,50,.35)' },
									{ from: 400, to: 600, color: 'rgba(255,103,103,.35)' }
								];

								vm.primary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
									return [4076, 3908, 4053, 3848].any(function (soId) { return soId == tag.JBTStandardObservationId });

								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();


								console.log("Primary 1 Compressor Data Tag = %O", vm.primary1CompressorDataTag);
								if (!vm.primary1CompressorDataTag) {
									console.log("Primary 1 Compressor tag not found for pca = %O", vm.pca);
								}

								if (vm.primary1CompressorDataTag) {
									var options = GetChartOptions('primary-1-compressor-container' + vm.widget.Id,
										'Pri 1 Comp',
										50,
										600,
										'psi',
										plotBands,
										+vm.primary1CompressorDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.primary1CompressorChart = new Highcharts.Chart(options);
								}
							});
					}

					//+Generate the Primary 2 Compressor chart
					function GeneratePrimary2CompressorPressureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 50, to: 100, color: 'rgba(103,103,255,.35)' },
									{ from: 100, to: 400, color: 'rgba(50,255,50,.35)' },
									{ from: 400, to: 600, color: 'rgba(255,103,103,.35)' }
								];

								vm.primary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
									return [4077, 3909, 4079, 4054].any(function (soId) { return soId == tag.JBTStandardObservationId });
								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();


								console.log("Primary 2 Compressor Data Tag = %O", vm.primary2CompressorDataTag);
								if (!vm.primary2CompressorDataTag) {
									console.log("Primary 2 Compressor tag not found for pca = %O", vm.pca);
								}

								if (vm.primary2CompressorDataTag) {
									var options = GetChartOptions('primary-2-compressor-container' + vm.widget.Id,
										'Pri 2 Comp',
										50,
										600,
										'psi',
										plotBands,
										+vm.primary2CompressorDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.primary2CompressorChart = new Highcharts.Chart(options);
								}
							});
					}

					//+Generate the Secondary 1 Compressor chart
					function GenerateSecondary1CompressorPressureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 50, to: 100, color: 'rgba(103,103,255,.35)' },
									{ from: 100, to: 400, color: 'rgba(50,255,50,.35)' },
									{ from: 400, to: 600, color: 'rgba(255,103,103,.35)' }
								];

								vm.secondary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
									return [4078, 3910, 4664].any(function (soId) { return soId == tag.JBTStandardObservationId });
								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();


								console.log("Secondary 1 Compressor Data Tag = %O", vm.secondary1CompressorDataTag);
								if (!vm.secondary1CompressorDataTag) {
									console.log("Secondary 1 Compressor tag not found for pca = %O", vm.pca);
								}

								if (vm.secondary1CompressorDataTag) {
									var options = GetChartOptions('secondary-1-compressor-container' + vm.widget.Id,
										'Sec 1 Comp',
										50,
										600,
										'psi',
										plotBands,
										+vm.secondary1CompressorDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.secondary1CompressorChart = new Highcharts.Chart(options);
								}
							});
					}

					//+Generate the Secondary 2 Compressor chart
					function GenerateSecondary2CompressorPressureChart() {

							$scope.$$postDigest(function () {
								var plotBands = [
									{ from: 50, to: 100, color: 'rgba(103,103,255,.35)' },
									{ from: 100, to: 400, color: 'rgba(50,255,50,.35)' },
									{ from: 400, to: 600, color: 'rgba(255,103,103,.35)' }
								];

								vm.secondary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
									return [3911].any(function (soId) { return soId == tag.JBTStandardObservationId });
								})
									.orderByDescending(function (t) { return t.PLCLocalDate })
									.first();


								console.log("Secondary 2 Compressor Data Tag = %O", vm.secondary2CompressorDataTag);
								if (!vm.secondary2CompressorDataTag) {
									console.log("Secondary 2 Compressor tag not found for pca = %O", vm.pca);
								}

								if (vm.secondary2CompressorDataTag) {
									var options = GetChartOptions('secondary-2-compressor-container' + vm.widget.Id,
										'Sec 2 Comp',
										50,
										600,
										'psi',
										plotBands,
										+vm.secondary2CompressorDataTag.Value,
										null);

									console.log("chart options = %O", options);

									vm.secondary2CompressorChart = new Highcharts.Chart(options);
								}
							});
					}


					function SetTemperatureChartsToContainerSize() {
						SetChartSizeToContainer(vm.ambientChart, 'ambient-container' + vm.widget.Id);
						SetChartSizeToContainer(vm.dischargeChart, 'discharge-container' + vm.widget.Id);
						SetChartSizeToContainer(vm.cabinChart, 'cabin-container' + vm.widget.Id);
					}
					function SetPressureChartsToContainerSize() {
						//console.log("Setting pressure chart size");
						SetChartSizeToContainer(vm.primary1CompressorChart, 'primary-1-compressor-container' + vm.widget.Id);
						SetChartSizeToContainer(vm.primary2CompressorChart, 'primary-2-compressor-container' + vm.widget.Id);
						SetChartSizeToContainer(vm.secondary1CompressorChart, 'secondary-1-compressor-container' + vm.widget.Id);
						SetChartSizeToContainer(vm.secondary2CompressorChart, 'secondary-2-compressor-container' + vm.widget.Id);
					}

					vm.graphContainerAdjustmentWidth = -7;
					vm.graphContainerAdjustmentHeight = 0;

					function SetChartSizeToContainer(chart, container) {
						if (chart) {
							//console.log("Container dimensions = %O",containerDimensions );
							$interval(function() {
								var containerDimensions = displaySetupService.GetDivDimensionsById(container);							
								chart.setSize((containerDimensions.width) + vm.graphContainerAdjustmentWidth, (containerDimensions.height + vm.graphContainerAdjustmentHeight), false);
							},50,3);

						}
					}


					function GetChartOptions(container, category, min, max, units, plotBandsArray, initialDataValue, targetDataValue) {
						var options = {
							chart: {
								renderTo: container,
								type: 'column',
								inverted: false,
								events: {
									load: function (event) {
										var chart = this;
										$interval(function () {
											var containerDimensions = displaySetupService.GetDivDimensionsById(container);
											if (chart) {
												try {
													chart.setSize((containerDimensions.width) + vm.graphContainerAdjustmentWidth, (containerDimensions.height + vm.graphContainerAdjustmentHeight), false);
	
												} catch (e) {

												}
											}

										}, 20, 30);
									}
								},
								backgroundColor: '#F5F5F5'
							},
							credits: { enabled: false },
							exporting: { enabled: false },
							legend: { enabled: false },
							title: { text: '' },
							xAxis: {
								tickLength: 0,
								lineColor: '#999',
								lineWidth: 1,
								labels: {
									style: {
										fontWeight: 'bold',
										fontSize: '.8em',
										fontFamily: 'Segoe UI'
									}
								},
								categories: [category]
							},
							yAxis: {
								min: min,
								max: max,
								minPadding: 0,
								maxPadding: 0,
								tickColor: '#ccc',
								tickWidth: 1,
								tickLength: 3,
								gridLineWidth: 0,
								endOnTick: true,
								title: { text: '' },
								labels: {
									y: 10,
									style: {
										fontSize: '8px'
									},
									formatter: function () {
										if (this.isLast) {
											return this.value + '';
										} else {
											return this.value + '';
										}
									}
								}
							},
							tooltip: {
								enabled: true,
								backgroundColor: 'rgba(255, 255, 255, .85)',
								borderWidth: 0,
								shadow: true,
								style: { fontSize: '10px', padding: 2 },
								formatter: function () {
									return "<strong>" + Highcharts.numberFormat(this.y, 2) + "</strong> " + this.series.name;
								}
							},
							series: [{ name: units, pointWidth: 15, data: [initialDataValue] }],
							plotOptions: {
								column: {
									color: '#000',
									shadow: false,
									borderWidth: 0
								},
								line: {
									animation: false
								},
								scatter: {
									marker: {
										symbol: 'line',
										lineWidth: 3,
										radius: 15,
										lineColor: '#000'
									}
								},
								series: {
									animation: false
								}
							}
						};

						if (targetDataValue) {
							options.series.push({ name: 'Target', type: 'scatter', data: [targetDataValue] });
						}

						if (plotBandsArray) {
							options.yAxis.plotBands = plotBandsArray;
						}

						return options;
					}
				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/pcaSummary.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						addTagsToGraphFunction: "&",
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