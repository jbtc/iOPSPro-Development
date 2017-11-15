(function () {

	var app = angular.module('app');

	app.directive('gpuSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					function GetHeadingExtraTitle() {
						return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-LastObservationDate',
						headingExtraTitle: '',
						obscureGraphics: true
					}

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
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
					console.log("Initial vm.widget = %O", vm.widget);


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


						if (!vm.gpu) {
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
						vm.addTagsToGraphFunction()(vm.tagsToGraphObjects);

						return;

					}





					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						vm.gpu = vm.Asset;
						console.log("gpuSummary Asset = %O", vm.Asset);
						GetGPUAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.gpu = null;

								SaveWidgetResourceObjectIfChanged();
								

							}
							GetGPUAssetForGate();
						}
					});

					vm.SetDefaultNavPill = function (defaultValue) {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = defaultValue;
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}


					vm.GenerateAmpsCharts = function () {
						//console.log("Generating...");
						GeneratePhaseAAmpsOutLinearMeter();
						GeneratePhaseBAmpsOutLinearMeter();
						GeneratePhaseCAmpsOutLinearMeter();
						GenerateAmpsInAverageLinearMeter();
						GenerateAmpsOutAverageLinearMeter();
					}

					vm.GenerateVoltsCharts = function () {
						//console.log("Generating...");
						GeneratePhaseAVoltsOutLinearMeter();
						GeneratePhaseBVoltsOutLinearMeter();
						GeneratePhaseCVoltsOutLinearMeter();
						GenerateVoltsInAverageLinearMeter();
						GenerateVoltsOutAverageLinearMeter();
					}

					function GetGPUAssetForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;

							vm.gpu = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'GPU' });


							vm.Asset = vm.gpu;

							if (vm.widget.WidgetResource.GateSystemId) {

								vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

							}

							console.log("vm.gpu = %O", vm.gpu);

							vm.widget.WidgetResource.AssetId = vm.gpu.Id;

							SaveWidgetResourceObjectIfChanged();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.gpu.Id).then(function () {


								vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.gpu.Id });


								vm.AssetGraphics.forEach(function (ag) {
									ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
									ag.showImage = false;
								});
								$timeout(function () {
									SetupSplitter();
									SetTabBodyHeight();
								}, 50);

								console.log("Asset Graphics = %O", vm.AssetGraphics);
								vm.gpu.Tags.forEach(function (tag) {
									UpdateGraphicsVisibilityForSingleTag(tag);
								});

								vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
								vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
								SetHeadingBackground();
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								vm.GenerateVoltsCharts();
								vm.GenerateAmpsCharts();
								vm.showWidget = true;


							});
						});
					}



					function SetTabBodyHeight() {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								if (vm.widget.WidgetResource.IsModalPopUp) {
									heightToSet = widgetDimensions.height - tabDimensions.height - 20;
								} else {
									heightToSet = widgetDimensions.height - tabDimensions.height - 9;
								}

								//console.log("Height to set = " + heightToSet);
								$("#tab-content" + vm.widget.Id).css('height', heightToSet);
							}

						}, 50, 40);
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
							return vm.AssetGraphics.any(function (ag) { return ag.showImage }) || vm.gpu.Tags.where(function (t) { return t.JBTStandardObservationId == 12246 }).any(function (t) { return +t.Value == 1 });
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
											}

										});
									vm.splitterIsSetup = true;

								});


							});

						}


					}





					//console.log("vm.dashboard = %O", vm.dashboard);

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

						console.log("Widget.AddTagsToGraph event at GPU Summary");

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
						UpdatePhaseAAmpsOutLinearMeter(updatedTag);
						UpdatePhaseBAmpsOutLinearMeter(updatedTag);
						UpdatePhaseCAmpsOutLinearMeter(updatedTag);
						UpdateAmpsInAverageLinearMeter(updatedTag);
						UpdateAmpsOutAverageLinearMeter(updatedTag);

						UpdatePhaseAVoltsOutLinearMeter(updatedTag);
						UpdatePhaseBVoltsOutLinearMeter(updatedTag);
						UpdatePhaseCVoltsOutLinearMeter(updatedTag);
						UpdateVoltsInAverageLinearMeter(updatedTag);
						UpdateVoltsOutAverageLinearMeter(updatedTag);
					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.gpu) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.gpu.Id) {
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




					//***G




					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("gpuSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
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



					vm.meterRanges = {
						ampsIn: {
							min: 0,
							max: 400,
							lowStart: 0,
							lowEnd: 10,
							highStart: 300,
							HighEnd: 400
						},
						ampsOut: {
							min: 0,
							max: 400,
							lowStart: 0,
							lowEnd: 10,
							highStart: 300,
							HighEnd: 400
						},
						voltsIn: {
							min: 0,
							max: 600,
							lowStart: 0,
							lowEnd: 10,
							highStart: 500,
							HighEnd: 600
						},
						voltsOut: {
							min: 0,
							max: 150,
							lowStart: 0,
							lowEnd: 50,
							highStart: 130,
							HighEnd: 150
						}
					}


					//+Generate the Amps In Average Linear Meter
					function GenerateAmpsInAverageLinearMeter() {

						vm.ampsInAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [2242].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ampsInAverageDataTag) {
							vm.ampsInAverage = +vm.ampsInAverageDataTag.Value;
						}
					}

					function UpdateAmpsInAverageLinearMeter(updatedTag) {

						if (vm.ampsInAverageDataTag && updatedTag.TagId == vm.ampsInAverageDataTag.TagId) {
							vm.ampsInAverage = +vm.ampsInAverageDataTag.Value;
						}
					}


					//+Generate the Amps Out Average Linear Meter
					function GenerateAmpsOutAverageLinearMeter() {

						vm.ampsOutAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [1942].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ampsOutAverageDataTag) {
							vm.ampsOutAverage = +vm.ampsOutAverageDataTag.Value;
						}
					}

					function UpdateAmpsOutAverageLinearMeter(updatedTag) {

						if (vm.ampsOutAverageDataTag && updatedTag.TagId == vm.ampsOutAverageDataTag.TagId) {
							vm.ampsOutAverage = +vm.ampsOutAverageDataTag.Value;
						}
					}


					//+Generate the Phase A Amps Out Linear Meter
					function GeneratePhaseAAmpsOutLinearMeter() {

						vm.phaseAAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1857, 4439].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						console.log("vm.phaseAAmpsOutDataTag = %O", vm.phaseAAmpsOutDataTag);
						if (vm.phaseAAmpsOutDataTag) {
							vm.phaseAAmpsOut = +vm.phaseAAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseAAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseAAmpsOutDataTag && updatedTag.TagId == vm.phaseAAmpsOutDataTag.TagId) {
							vm.phaseAAmpsOut = +vm.phaseAAmpsOutDataTag.Value;
						}
					}


					//+Generate the Phase B Amps Out Linear Meter
					function GeneratePhaseBAmpsOutLinearMeter() {

						vm.phaseBAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1858, 4441, 2754].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseBAmpsOutDataTag) {
							vm.phaseBAmpsOut = +vm.phaseBAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseBAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseBAmpsOutDataTag && updatedTag.TagId == vm.phaseBAmpsOutDataTag.TagId) {
							vm.phaseBAmpsOut = +vm.phaseBAmpsOutDataTag.Value;
						}
					}



					//+Generate the Phase C Amps Out Linear Meter
					function GeneratePhaseCAmpsOutLinearMeter() {

						vm.phaseCAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1859, 4443].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseCAmpsOutDataTag) {
							vm.phaseCAmpsOut = +vm.phaseCAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseCAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseCAmpsOutDataTag && updatedTag.TagId == vm.phaseCAmpsOutDataTag.TagId) {
							vm.phaseCAmpsOut = +vm.phaseCAmpsOutDataTag.Value;
						}
					}

					//+Generate the Volts In Average Linear Meter
					function GenerateVoltsInAverageLinearMeter() {

						vm.voltsInAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [2244].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.voltsInAverageDataTag) {
							vm.voltsInAverage = +vm.voltsInAverageDataTag.Value;
						}
					}

					function UpdateVoltsInAverageLinearMeter(updatedTag) {

						if (vm.voltsInAverageDataTag && updatedTag.TagId == vm.voltsInAverageDataTag.TagId) {
							vm.voltsInAverage = +vm.voltsInAverageDataTag.Value;
						}
					}


					//+Generate the Volts Out Average Linear Meter
					function GenerateVoltsOutAverageLinearMeter() {

						vm.voltsOutAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [1935].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.voltsOutAverageDataTag) {
							vm.voltsOutAverage = +vm.voltsOutAverageDataTag.Value;
						}
					}

					function UpdateVoltsOutAverageLinearMeter(updatedTag) {

						if (vm.voltsOutAverageDataTag && updatedTag.TagId == vm.voltsOutAverageDataTag.TagId) {
							vm.voltsOutAverage = +vm.voltsOutAverageDataTag.Value;
						}
					}


					//+Generate the Phase A Volts Out Linear Meter
					function GeneratePhaseAVoltsOutLinearMeter() {

						vm.phaseAVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4440, 1860].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						console.log("vm.phaseAVoltsOutDataTag = %O", vm.phaseAVoltsOutDataTag);
						if (vm.phaseAVoltsOutDataTag) {
							vm.phaseAVoltsOut = +vm.phaseAVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseAVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseAVoltsOutDataTag && updatedTag.TagId == vm.phaseAVoltsOutDataTag.TagId) {
							vm.phaseAVoltsOut = +vm.phaseAVoltsOutDataTag.Value;
						}
					}


					//+Generate the Phase B Volts Out Linear Meter
					function GeneratePhaseBVoltsOutLinearMeter() {

						vm.phaseBVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4442, 1861].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseBVoltsOutDataTag) {
							vm.phaseBVoltsOut = +vm.phaseBVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseBVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseBVoltsOutDataTag && updatedTag.TagId == vm.phaseBVoltsOutDataTag.TagId) {
							vm.phaseBVoltsOut = +vm.phaseBVoltsOutDataTag.Value;
						}
					}



					//+Generate the Phase C Volts Out Linear Meter
					function GeneratePhaseCVoltsOutLinearMeter() {

						vm.phaseCVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4444, 1862].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseCVoltsOutDataTag) {
							vm.phaseCVoltsOut = +vm.phaseCVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseCVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseCVoltsOutDataTag && updatedTag.TagId == vm.phaseCVoltsOutDataTag.TagId) {
							vm.phaseCVoltsOut = +vm.phaseCVoltsOutDataTag.Value;
						}
					}




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/gpuSummary.html?" + Date.now(),

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