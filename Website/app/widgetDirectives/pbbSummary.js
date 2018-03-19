(function () {

	var app = angular.module('app');

	app.directive('pbbSummary',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					function GetHeadingExtraTitle() {
						if (vm.Asset && vm.Asset.Site && vm.Asset.ParentSystem && vm.Asset.ParentSystem.Name) {
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
						headingSearchField: true

					}

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							//console.log("Saving widget resource........");
							//console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							//console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

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
					vm.SetDefaultNavPillData = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Data';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}

					vm.alarmFilterFunction = function (element) {
						return element.ValueWhenActive == element.Value;
					};



				
					vm.tagFilterFunction = function (element) {
						if ((vm.widget.searchText || '') != '' && element.JBTStandardObservation && element.JBTStandardObservation.Name) {

							return element.JBTStandardObservation.Name.toLowerCase().indexOf((vm.widget.searchText || '').toLowerCase()) > -1;
						} else {
							if (element.JBTStandardObservation) {
								return true;
							} else {
								return false;
							}
						}
					};




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


					vm.scrolledToEnd = function () {
						console.log("pbb Data Scrolled to end");
					}


					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						//console.log("Opening settings vm.Asset = %O", vm.Asset);
						if (!vm.pbb) {
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
						console.log("vm in vm.ProcessTagsToGraph = %O", vm);

						vm.dashboard.tagsToGraph = vm.tagsToGraphObjects.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
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
						vm.pbb = vm.Asset;
						//console.log("pbbSummary Asset = %O", vm.Asset);
						GetPBBAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.pbb = null;

								SaveWidgetResourceObjectIfChanged();

								dataService.GetEntityById("SystemGroups", newValue).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
								});
								GetPBBAssetForGate();

							}
						}
					});



					//***G
					//++Get the Data
					//---G
					function GetPBBAssetForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;




							vm.pbb = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PBB' });


							vm.Asset = vm.pbb;

							if (vm.widget.WidgetResource.GateSystemId) {

								vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

							}

							//console.log("vm.pbb = %O", vm.pbb);


							vm.widget.WidgetResource.AssetId = vm.pbb.Id;
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							SaveWidgetResourceObjectIfChanged();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pbb.Id).then(function () {

								vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.pbb.Id });

								vm.AssetGraphics.forEach(function (ag) {
									ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
									ag.showImage = false;
								});
								$timeout(function () {
									SetupSplitter();
									SetTabBodyHeight(5);
								}, 100);





								//console.log("Asset Graphics = %O", vm.AssetGraphics);
								vm.pbb.Tags.forEach(function (tag) {
									UpdateGraphicsVisibilityForSingleTag(tag);
								});

								vm.pbb.Tags = vm.pbb.Tags.distinct(function(a, b) { return a.TagId == b.TagId });

								vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
								vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

								if (!vm.alarms) {
									vm.alarms = [];
								}
								if (!vm.warnings) {
									vm.warnings = [];
								}

								vm.pbb.Tags = dataService.cache.tags.where(function (t) { return t.AssetId == vm.pbb.Id });
								var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

								vm.alarms = vm.pbb.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsAlarm && !commLossStandardObservationIds.any(function (a) { return a == dsTag.JBTStandardObservationId }) });
								vm.warnings = vm.pbb.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsWarning });
								vm.commLossTag = vm.pbb.Tags.first(function (t) { return commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });



								vm.widget.displaySettings.commLossTag = vm.commLossTag;
								console.log("PBB vm.alarms = %O", vm.alarms);
								//console.log("PBB vm.warnings = %O", vm.warnings);
								//console.log("PBB vm.pbb.Tags = %O", vm.pbb.Tags);
								//console.log("PBB CommLossTag = %O", vm.commLossTag);

								vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
								
								SetHeadingBackground();

								$timeout(function() {
									vm.showWidget = true;
								}, 100);

							});
						});
					}
					//***G


					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								if (vm.widget.WidgetResource.IsModalPopUp) {
									heightToSet = widgetDimensions.height - tabDimensions.height - 20;
								} else {
									heightToSet = widgetDimensions.height - tabDimensions.height - 3;
								}

								//console.log("Height to set = " + heightToSet);
								$("#tab-content" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-alarms" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-warnings" + vm.widget.Id).css('height', heightToSet);
								vm.showTags = true;
							}

						}, 50, repeatCount);
					}




					function SetHeadingBackground() {

						if (vm.alarms && vm.alarms.length > 0 && vm.alarms.any(function (a) { return a.ValueWhenActive == a.Value })) {

							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFDDDD)';


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

									try {
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
													//$interval(function() {

													//	SetTemperatureChartsToContainerSize();
													//	SetPressureChartsToContainerSize();
													//},25, 20);
												},
												onDrag: function () {
													//$timeout(function() {

													//	SetTemperatureChartsToContainerSize();
													//	SetPressureChartsToContainerSize();
													//});
												}

											});

									} catch (e) {

									}

								});

								vm.splitterIsSetup = true;
							});
						}


					}


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
							//SetTemperatureChartsToContainerSize();
							//SetPressureChartsToContainerSize();
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);
								//SetTemperatureChartsToContainerSize();
								//SetPressureChartsToContainerSize();

							}, 200);
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
							console.log("Warning Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
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

						if (updatedTag && vm.pbb) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.pbb.Id) {
								//console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								if (vm.AssetGraphics) {


									vm.AssetGraphics.forEach(function (ag) {

										//Set the "showImage" flag on each appropriately.
										ag.AssetGraphicVisibleValues.forEach(function (vv) {
											if (+vv.JBTStandardObservationId == +updatedTag.JBTStandardObservationId) {
												vv.showImage = (+updatedTag.Value == +vv.ValueWhenVisible || updatedTag.Value == vv.ValueWhenVisible);
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

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/pbbSummary.html",

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