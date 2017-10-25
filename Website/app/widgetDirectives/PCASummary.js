(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location) {

				var controller = function ($scope) {
					var vm = this;


					function GetHeadingExtraTitle() {
						if (vm.GateSystem) {
							var site = vm.JBTData.Sites.first(function (s) { return s.Id == vm.GateSystem.SiteId });
							return ' - ' + site.Name + ' Gate ' + vm.GateSystem.Name + (vm.pca.ModelGenericName ? ' - ' + vm.pca.ModelGenericName : '');
						}
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-LastObservationDate',
						headingExtraTitle: '',
						obscureGraphics: true
					}

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							console.log("Saving widget resource........");
							console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.tagsToGraph = [];

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("Initial vm.widget = %O", vm.widget);


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

								SaveWidgetResourceObjectIfChanged();
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

								SaveWidgetResourceObjectIfChanged();

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

								SaveWidgetResourceObjectIfChanged();

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

								SaveWidgetResourceObjectIfChanged();

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
						SetTabBodyHeight();
					}

					vm.GeneratePressureCharts = function () {
						//console.log("Generating...");
						GeneratePrimary1CompressorPressureChart();
						GeneratePrimary1CompressorSuctionChart();
						GeneratePrimary2CompressorPressureChart();
						GeneratePrimary2CompressorSuctionChart();
						GenerateSecondary1CompressorPressureChart();
						GenerateSecondary1CompressorSuctionChart();
						GenerateSecondary2CompressorPressureChart();
						GenerateSecondary2CompressorSuctionChart();
						SetTabBodyHeight();
					}


					vm.SetDefaultNavPillTemp = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Temp';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillPress = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Press';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillData = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Data';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}

					function GetAssetsForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;




							vm.pca = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });


							if (vm.widget.WidgetResource.GateSystemId) {

								vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

							}

							//console.log("vm.pca = %O", vm.pca);


							vm.widget.WidgetResource.AssetId = vm.pca.Id;

							SaveWidgetResourceObjectIfChanged();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id).then(function () {


								vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.pca.Id });


								vm.AssetGraphics.forEach(function (ag) {
									ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
									ag.showImage = false;
								});
								$timeout(function () {
									SetupSplitter();
									SetTabBodyHeight();
								}, 50);

								console.log("Asset Graphics = %O", vm.AssetGraphics);
								vm.pca.Tags.forEach(function (tag) {
									UpdateGraphicsVisibilityForSingleTag(tag);
								});

								vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
								vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
								SetHeadingBackground();
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								vm.GenerateTemperatureCharts();
								vm.GeneratePressureCharts();
								$timeout(function () {

									vm.showWidget = true;
								}, 100);


							});
						});
					}



					function SetTabBodyHeight() {
						$timeout(function () {

							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = widgetDimensions.height - tabDimensions.height - 9;
							//console.log("Height to set = " + heightToSet);
							$("#tab-content" + vm.widget.Id).css('height', heightToSet);

						}, 75);
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

					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
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

												SaveWidgetResourceObjectIfChanged();
											},

										});
									vm.splitterIsSetup = true;
								});


							});

						}


					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight();

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
						UpdatePrimary1CompressorSuctionChart(updatedTag);
						UpdatePrimary2CompressorChart(updatedTag);
						UpdatePrimary2CompressorSuctionChart(updatedTag);
						UpdateSecondary1CompressorChart(updatedTag);
						UpdateSecondary1CompressorSuctionChart(updatedTag);
						UpdateSecondary2CompressorChart(updatedTag);
						UpdateSecondary2CompressorSuctionChart(updatedTag);
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

												vv.showImage = +updatedTag.Value == +vv.ValueWhenVisible || updatedTag.Value == vv.ValueWhenVisible;
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
						if (vm.ambientDataTag && updatedTag.TagId == vm.ambientDataTag.TagId) {
							//console.log("Updating ambient value - ambient data tag = %O", vm.ambientDataTag);
							//console.log("Updating ambient value - updated tag = %O", updatedTag);
							if (+vm.ambientDataTag.Value > 250) {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value / 10;
							} else {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value;

							}
						}
					}

					function UpdateDischargeChart(updatedTag) {
						if (vm.dischargeDataTag && updatedTag.TagId == vm.dischargeDataTag.TagId) {
							//console.log("Updating discharge value");
							if (+vm.dischargeDataTag.Value > 250) {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value / 10;
							} else {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value;
							}
						}
					}

					function UpdateCabinChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.cabinDataTag && updatedTag.TagId == vm.cabinDataTag.TagId) {
							//console.log("Updating cabin value");
							if (+vm.cabinDataTag.Value > 250) {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value / 10;
							} else {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value;
							}
						}
					}

					function UpdatePrimary1CompressorChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary1CompressorDataTag && updatedTag.TagId == vm.primary1CompressorDataTag.TagId) {
							//console.log("Updating pri comp 1 value");
							vm.primary1CompressorPressure = +vm.primary1CompressorDataTag.Value;
						}
					}

					function UpdatePrimary1CompressorSuctionChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary1CompressorSuctionDataTag && updatedTag.TagId == vm.primary1CompressorSuctionDataTag.TagId) {
							//console.log("Updating pri comp 1 Suction value");
							vm.primary1CompressorSuction = +vm.primary1CompressorSuctionDataTag.Value;
						}
					}

					function UpdatePrimary2CompressorChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary2CompressorDataTag && updatedTag.TagId == vm.primary2CompressorDataTag.TagId) {
							//console.log("Updating pri comp 2 value");
							vm.primary2CompressorPressure = +vm.primary2CompressorDataTag.Value;
						}
					}

					function UpdatePrimary2CompressorSuctionChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary2CompressorSuctionDataTag && updatedTag.TagId == vm.primary2CompressorSuctionDataTag.TagId) {
							//console.log("Updating pri comp 1 Suction value");
							vm.primary2CompressorSuction = +vm.primary2CompressorSuctionDataTag.Value;
						}
					}

					function UpdateSecondary1CompressorChart(updatedTag) {
						if (vm.secondary1CompressorDataTag && updatedTag.TagId == vm.secondary1CompressorDataTag.TagId) {
							vm.secondary1CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}
					}

					function UpdateSecondary1CompressorSuctionChart(updatedTag) {
						if (vm.secondary1CompressorSuctionDataTag && updatedTag.TagId == vm.secondary1CompressorSuctionDataTag.TagId) {
							vm.secondary1CompressorSuction = +vm.secondary1CompressorSuctionDataTag.Value;
						}
					}

					function UpdateSecondary2CompressorChart(updatedTag) {
						if (vm.secondary2CompressorDataTag && updatedTag.TagId == vm.secondary2CompressorDataTag.TagId) {
							//console.log("Updating sec comp 2 value");
							vm.secondary2CompressorPressure = +vm.secondary2CompressorDataTag.Value;
						}
					}

					function UpdateSecondary2CompressorSuctionChart(updatedTag) {
						if (vm.secondary2CompressorSuctionDataTag && updatedTag.TagId == vm.secondary2CompressorSuctionDataTag.TagId) {
							vm.secondary2CompressorSuction = +vm.secondary2CompressorSuctionDataTag.Value;
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



						vm.ambientDataTag = vm.pca.Tags.where(function (tag) {
							return [4084].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ambientDataTag) {
							if (+vm.ambientDataTag.Value > 250) {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value / 10;
							} else {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value;

							}
						}


					}

					//+Generate the Discharge Temperature chart
					function GenerateDischargeTemperatureChart() {


						vm.dischargeDataTag = vm.pca.Tags.where(function (tag) {
							return [2736].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.dischargeDataTag) {
							if (+vm.dischargeDataTag.Value > 250) {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value / 10;
							} else {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value;
							}
						}

					}

					//+Generate the Cabin Temperature chart
					function GenerateCabinTemperatureChart() {


						vm.cabinDataTag = vm.pca.Tags.where(function (tag) {
							return [4063, 3920, 4342].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.where(function (t) { return +t.Value > 2 })
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.cabinDataTag) {
							if (+vm.cabinDataTag.Value > 250) {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value / 10;
							} else {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value;
							}
						}

					}

					//+Generate the Primary 1 Compressor chart
					function GeneratePrimary1CompressorPressureChart() {


						vm.primary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4076, 3908, 4053, 3848].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary1CompressorDataTag) {
							vm.primary1CompressorPressure = +vm.primary1CompressorDataTag.Value;
						}
					}

					//+Generate the Primary 1 Compressor Suction chart
					function GeneratePrimary1CompressorSuctionChart() {


						vm.primary1CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3912, 3987, 4019, 4057, 4080, 12306, 12310, 2863, 3731, 4695, 3797].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary1CompressorSuctionDataTag) {
							vm.primary1CompressorSuction = +vm.primary1CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Primary 2 Compressor chart
					function GeneratePrimary2CompressorPressureChart() {


						vm.primary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4077, 3909, 4079, 4054].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary2CompressorDataTag) {
							vm.primary2CompressorPressure = +vm.primary2CompressorDataTag.Value;
						}

					}


					//+Generate the Primary 2 Compressor Suction chart
					function GeneratePrimary2CompressorSuctionChart() {


						vm.primary2CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3913, 4020, 2253, 4081, 12297, 12299].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary2CompressorSuctionDataTag) {
							vm.primary2CompressorSuction = +vm.primary2CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Secondary 1 Compressor chart
					function GenerateSecondary1CompressorPressureChart() {


						vm.secondary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4078, 3910, 4664].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();
						if (vm.secondary1CompressorDataTag) {
							vm.secondary1CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}
					}

					//+Generate the Secondary 1 Compressor Suction chart
					function GenerateSecondary1CompressorSuctionChart() {


						vm.secondary1CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3914, 4666, 3849, 12304, 12308, 4082].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary1CompressorSuctionDataTag) {
							vm.secondary1CompressorSuction = +vm.secondary1CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Secondary 2 Compressor chart
					function GenerateSecondary2CompressorPressureChart() {


						vm.secondary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [3911].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary2CompressorDataTag) {
							vm.secondary2CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}

					}

					//+Generate the Secondary 2 Compressor Suction chart
					function GenerateSecondary2CompressorSuctionChart() {


						vm.secondary2CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [12298, 1874, 4083, 3915].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary2CompressorSuctionDataTag) {
							vm.secondary2CompressorSuction = +vm.secondary2CompressorSuctionDataTag.Value;
						}
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