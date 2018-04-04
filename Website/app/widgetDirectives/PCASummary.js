(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location) {

				var controller = function ($scope) {
					var vm = this;
					//console.log("PCA Summary Controller invoked");

					function GetHeadingExtraTitle() {
						//console.log("Getting site heading");
						if (vm.Asset && vm.Asset.Site && vm.Asset.ParentSystem) {						
							return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
						}
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-PLCLocalDate',
						alarmDataSortField: '-PLCLocalDate',
						warningsDataSortField: '-PLCLocalDate',
						headingExtraTitle: '',
						obscureGraphics: true,
						commLossTag: vm.commLossTag,
						headingSearchField: true

					}
					vm.scrolledToEnd = function () {
						//console.log("pca Data Scrolled to end");
					}


					vm.tagFilterFunction = function (element) {
						if ((vm.widget.searchText || '') != '') {
							return element.JBTStandardObservation.Name.toLowerCase().indexOf((vm.widget.searchText || '').toLowerCase()) > -1;
						} else {
							return true;
						}
					};

					vm.alarmFilterFunction = function (element) {
						return element.ValueWhenActive == element.Value;
					};



					vm.tagClicked = function(tag) {
						console.log("tag clicked = %O", tag);
					}


					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								//console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});


					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							//console.log("Saving widget resource........");
							//console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							//console.log("Changed WidgetResource = %O", possiblyChangedResource);
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


					vm.SetAlarmSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.alarmDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.alarmDataSortField == fieldName) {
							if (vm.widget.displaySettings.alarmDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.alarmDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.alarmDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.alarmDataSortField = fieldName;
						}
					}

					vm.SetWarningSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.warningDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.warningDataSortField == fieldName) {
							if (vm.widget.displaySettings.warningDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.warningDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.warningDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.warningDataSortField = fieldName;
						}
					}



					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						//console.log("Opening settings vm.Asset = %O", vm.Asset);

						if (!vm.pca) {

							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}


					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						//console.log("vm in vm.ProcessTagsToGraph = %O", vm);

						vm.dashboard.tagsToGraph = vm.tagsToGraphObjects.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						//console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
						if (vm.dashboard.tagsToGraph.length > 0) {
							$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
						} else {
							$rootScope.$broadcast("Dashboard.TagsToGraph", null);
						}

						return;

					}


					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						vm.pca = vm.Asset;
						//console.log("pcaSumary Asset = %O", vm.Asset);
						GetPCAAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});


					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.pca = null;
								SaveWidgetResourceObjectIfChanged();
								GetPCAAssetForGate();
							}
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
					vm.SetDefaultNavPillAlarms = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Alarms';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}
					vm.SetDefaultNavPillWarnings = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Warnings';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}

					//***G
					//++Get the Data
					//---G
					function GetPCAAssetForGate() {

						//console.log("Entry into GetPCAAssetForGate()");
						vm.pca = vm.JBTData
							.Assets
							.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });

						vm.Asset = vm.pca;
						//console.log("vm.pca = %O", vm.pca);


						vm.widget.WidgetResource.AssetId = vm.pca.Id;

						SaveWidgetResourceObjectIfChanged();
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

						//console.log("Getting tags into inventory");
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id).then(function () {

							//console.log("tags into inventory done");
							vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.pca.Id });


							vm.AssetGraphics.forEach(function (ag) {
								ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
								ag.showImage = false;
							});
							$timeout(function () {
								SetupSplitter();
								SetTabBodyHeight(5);
							}, 50);

							//console.log("Asset Graphics = %O", vm.AssetGraphics);
							vm.pca.Tags.forEach(function (tag) {
								UpdateGraphicsVisibilityForSingleTag(tag);
							});

							vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
							vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
							
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
							vm.GenerateTemperatureCharts();
							vm.GeneratePressureCharts();

							if (!vm.alarms) {
								vm.alarms = [];
							}
							if (!vm.warnings) {
								vm.warnings = [];
							}
							vm.pca.Tags = dataService.cache.tags.where(function (t) { return t.AssetId == vm.pca.Id });

							var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

							vm.alarms = vm.pca.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsAlarm && !commLossStandardObservationIds.any(function(a){ return a == dsTag.JBTStandardObservationId }) });
							vm.warnings = vm.pca.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsWarning });
							vm.commLossTag = vm.pca.Tags.first(function(t){return commLossStandardObservationIds.any(function(clso){ return clso == t.JBTStandardObservationId})});

							//console.log("PCA vm.alarms = %O", vm.alarms);
							//console.log("PCA vm.warnings = %O", vm.warnings);
							//console.log("PCA Tags for Asset = %O", vm.pca.Tags);
							//console.log("PCA Comm Loss Tag for Asset = %O", vm.commLossTag);

							vm.widget.displaySettings.commLossTag = vm.commLossTag;

							//console.log("PCA Tag Alarms = %O", vm.pca.Tags.select(function(t) {
							//	return {
							//		SName: t.JBTStandardObservation.Name,
							//		IsAlarm: t.IsAlarm
							//	}
							//}));

							SetHeadingBackground();

							$timeout(function () {
								vm.showWidget = true;
							}, 100);

							vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';

							$timeout(function() {
								$(function () {
									$('[data-toggle="tooltip"]').tooltip({html: true});
								})
							},50);

						});
					}
					//***G


					vm.alarmFilterFunction = function(element) {
						return element.ValueWhenActive == element.Value;
					};

					function SetTabBodyHeight(repeatCount) {
						displaySetupService.SetTabBodyHeightForWidget(vm.widget);

						$interval(function () {

							displaySetupService.SetTabBodyHeightForWidget(vm.widget);

						}, 50, repeatCount || 1);
						vm.showTags = true;
					}



					function SetHeadingBackground() {

						if (vm.alarms && vm.alarms.length > 0 && vm.alarms.any(function (a) { return a.ValueWhenActive == a.Value })) {

							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFDDDD)';
							//vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFFF00)';


							return;
						}
						//+Commented out the yellow header on warnings present - Can put back in if needed.
						//if(vm.warnings && vm.warnings.length > 0) {

						//	vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FFFF00, #FFFFee)';


						//	return;
						//}


						if (AtLeastOneGraphicIsVisible() && (!vm.commLossTag || vm.commLossTag.Value != "1")) {
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
											minSize: 0,
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
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						//displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});

					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {

						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						//console.log("Widget.AddTagsToGraph event at PCA Summary");

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
						SetHeadingBackground();
						return;


						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsAlarm || updatedTag.IsCritical) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Alarm Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.alarms) {
									vm.alarms.push(updatedTag);
								} else {
									vm.alarms = [];
									vm.alarms.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.alarms) {
									vm.alarms = vm.alarms.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}

						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsWarning) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Warning Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.warnings) {
									vm.warnings.push(updatedTag);
								} else {
									vm.warnings = [];
									vm.warnings.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.warnings) {
									vm.warnings = vm.warnings.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}
						



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
						//console.log("pcaSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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

					//+Generate the Primary 1 Compressor Pressure chart
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

					//+Generate the Primary 2 Compressor Pressure chart
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

					//+Generate the Secondary 1 Compressor Pressure chart
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

					//+Generate the Secondary 2 Compressor Pressure chart
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
					templateUrl: "app/widgetDirectives/pcaSummary.html",

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