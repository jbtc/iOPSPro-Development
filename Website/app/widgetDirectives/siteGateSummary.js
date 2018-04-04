(function () {

	var app = angular.module('app');

	app.directive('siteGateSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata) {

				var controller = function ($scope) {
					var vm = this;

					//console.log("Site Gate Summary directive invoked");

					function GetHeadingExtraTitle() {
						if (vm.widgetSite) {
							return ' - ' + vm.widgetSite.Name;
						}
					}



					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}

					vm.utilityService = utilityService;
					vm.showSettings = false;


					$timeout(function () {
						//vm.showSettings = true;
					}, 2000);

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

					//++A double click on the asset indicator will add a summary widget to the dashboard
					vm.AddToDashboard = function (asset, $event) {

						var widgetTypeId = asset.Name == 'PCA' ? 42 : asset.Name == 'PBB' ? 49 : asset.Name == 'GPU' ? 50 : 0;


						return dataService.GetEntityById("WidgetTypes", widgetTypeId).then(function (wt) {


							var gateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == asset.ParentSystemId });
							var zoneSystem = vm.JBTData.Systems.first(function (s) { return s.Id == gateSystem.ParentSystemId });
							var terminalSystem = vm.JBTData.Systems.first(function (s) { return s.Id == zoneSystem.ParentSystemId });
							var newPosition = GetNextWidgetRowColumn();
							//console.log("New Position calculation = %O", newPosition);

							return dataService.AddEntity("Widgets",
								{
									Name: wt.Name,
									WidgetTypeId: widgetTypeId,
									ParentDashboardId: vm.dashboard.Id,
									Width: wt.InitialWidth,
									Height: wt.InitialHeight,
									Row: newPosition.row - wt.InitialHeight+10,
									Col: newPosition.col,
									AssetId: asset.Id,
									DefaultNavPill: asset.Name == 'PCA' ? "Press" : asset.Name == 'GPU' ? "Amps" : "Data",
									SiteId: asset.SiteId,
									SplitLeftPercentage: 50,
									SplitRightPercentage: 50,
									SystemId: asset.ParentSystemId,
									GateSystemId: asset.ParentSystemId,
									ZoneSystemId: zoneSystem.Id,
									TerminalSystemId: terminalSystem.Id
								}).then(function (widget) {
									signalR.SignalAllClients("WidgetAdded", widget);
									return true;
								});
						});

					}

					//***G
					//++Adding a widget group
					//***G
					vm.AddWidgetGroupToDashboard = function (group) {
						//console.log("Summary Group to add = %O", group);

						//Collect the asset ids in a list and pre-load the tags into the cache first.
						var assetIdList = group.PBBAsset ? group.PBBAsset.Id.toString() + ',' : "";

						if (group.PCAAsset) {
							assetIdList += group.PCAAsset ? group.PCAAsset.Id.toString() + ',' : "";
						}
						if (group.GPUAsset) {
							assetIdList += group.GPUAsset ? group.GPUAsset.Id.toString() + ',' : "";
						}

						//console.log("AssetIdList = " + assetIdList);

						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetIdList, false).then(
							function() {
								vm.AddToDashboard(group.PBBAsset).then(function () {
									vm.AddToDashboard(group.PCAAsset).then(function () {
										vm.AddToDashboard(group.GPUAsset);
									});
								});
							});

					}


					function GetNextWidgetRowColumn() {


						var nonPopUpWidgets = vm.dashboard.widgets.where(function (w) { return !w.IsModalPopUp });
						//console.log("nonPopUpWidgets = %O", vm.dashboard.widgets);

						var lowestPoint = nonPopUpWidgets.max(function (w) { return w.row + w.sizeY });
						//console.log("Lowest point = %O", lowestPoint);

						var lowestPointWidgets = nonPopUpWidgets.where(function (w) { return (w.row + w.sizeY) == lowestPoint });
						//console.log("lowestPointWidgets = %O", lowestPointWidgets);

						var furthestRightPoint = lowestPointWidgets.max(function (w) { return (w.col + w.sizeX) });
						//console.log("furthestRightPoint = %O", furthestRightPoint);



						var col = +furthestRightPoint;



						if (col >= 30) {
							col = 0;
						}

						return {
							row: lowestPoint,
							col: col
						}

					}

					//***G
					//++Opening a summary widget popup.
					//---G
					vm.OpenSummaryWidget = function (asset, $event) {
						//console.log("Opening summary widget for asset  %O", asset);

						//console.log("vm.dashboard = %O", vm.dashboard);



						//+Add the child widget if not already in the database.
						var subWidget = vm.gateTagGroups.subWidgets.first(function (sw) { return sw.AssetId == asset.Id });
						if (subWidget) {

							//console.log("Subwidget in cache = %O", subWidget);

							CreateChildWidgetFromDataAndOpenPopup(subWidget, asset);

							return;
						}






						//console.log("sub widget was not in cache - getting from oData");
						dataService.GetIOPSResource("Widgets")
							.filter("ParentWidgetId", vm.widget.Id)
							.filter("AssetId", asset.Id)
							.query()
							.$promise
							.then(function (data) {
								if (data.length == 1) {

									//console.log("Existing child widget = %O", data);

									var w = data[0];

									CreateChildWidgetFromDataAndOpenPopup(w, asset);

								} else {
									//The child widget does not yet exist. Create one and add it to the database,
									dataService.GetIOPSResource("SystemGroups")
										.filter("Id", asset.ParentSystemId)
										.expandPredicate("Parent")
										.expand("Parent")
										.finish()
										.query()
										.$promise
										.then(function(systemChainData) {

											var gateSystem = systemChainData[0];
											//console.log("Gate System Chain = %O", gateSystem);

											var newChildWidget = {
												Name: asset.ParentSystem.Name + ' - ' + asset.Name + ' Summary',
												WidgetTypeId: asset.Name == 'PCA' ? 42 : asset.Name == 'GPU' ? 50 : asset.Name == 'PBB' ? 49 : 0,
												ParentDashboardId: vm.dashboard.Id,
												AssetId: asset.Id,
												SystemId: asset.ParentSystemId,
												SiteId: asset.SiteId,
												Width: 0,
												Height: 0,
												Row: 0,
												Col: 0,
												TerminalSystemId: gateSystem.Parent.Parent.Id,
												ZoneSystemId: gateSystem.Parent.Id,
												GateSystemId: gateSystem.Id,
												SplitLeftPercentage: 50,
												SplitRightPercentage: 50,
												ParentWidgetId: vm.widget.Id,
												IsModalPopUp: true
											}


											dataService.AddEntity("Widgets", newChildWidget).then(function(w) {

												CreateChildWidgetFromDataAndOpenPopup(w, asset);

											});


										});


								}



							});


					};


					function CreateChildWidgetFromDataAndOpenPopup(w, asset) {
						vm.childWidget = {
							sizeX: w.Width,
							sizeY: w.Height,
							row: w.Row,
							col: w.Col,
							prevRow: w.Row,
							prevCol: w.Col,
							Id: w.Id,
							Name: w.Name,
							WidgetResource: w,
							HasChanged: false
						}


						vm.dashboard.summaryPopup = {
							widget: vm.childWidget,
							asset: asset,
							site: asset.Site
							
						};



						//console.log("vm.dashboard.summaryPopup = %O",vm.dashboard.summaryPopup);

						return;


					}


					//---G


					vm.OpenSettingsIfNoSiteAndCloseIfSiteIsPresent = function () {

						//console.log("Opening settings vm.widgetSite = %O",vm.widgetSite);


						if (!vm.widgetSite) {


							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}




					//---G
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
							//console.log("User only has a single Site");
							vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
							vm.widgetSite = vm.userSites[0];
							GetData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.JBTData.Sites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetData();
							}
						}
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});

					//***G
					//++Data Loading.....
					//---G
					function GetData() {
						vm.showWidget = true;

						var standardIdsToLoad = [12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245];


						console.log("SiteId" + vm.widget.WidgetResource.SiteId + " Requesting Tags for standard Ids  12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245.");


						//+Subwidgets will be populated as well. This is cached at the dataService to provide quick dashboard changes.
						dataService.GetSiteAllGateSummaryDataStructure(vm.widget.WidgetResource.SiteId, vm.widget.Id).then(function(data) {

							vm.gateTagGroups = data;

							vm.gateTagGroups.forEach(function (gtg) {
								SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.PBBAsset);
								SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.PCAAsset);
								SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.GPUAsset);
								FormatZeroBlankDisplayValueForTag(gtg.DischargeTemperatureTag);
								FormatZeroBlankDisplayValueForTag(gtg.AverageAmpsOutTag);
							});


							//+Delay this until after the next digest cycle. The data might already be loaded in cache and be instantly available.
							//+When this happens, the display is not been rendered before the sizing function will run.
							$interval(function() {								
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								vm.showWidget = true;
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
							},25,4);

						});


						

					}
					//***G

					


					//---B

					function FormatDurationValue(tag) {
						if (tag) {
							tag.DisplayValue = utilityService.SecondsToString(+tag.LastObservationTextValue);
							//if (+tag.LastObservationTextValue > 0) {
							//	tag.DisplayValue = utilityService.ToFixed(+tag.LastObservationTextValue, 1);
							//} else {
							//	tag.DisplayValue = '';
							//}
						}

					}

					//---B
					function FormatZeroBlankDisplayValueForTag(tag) {
						if (tag) {
							if (+tag.Value > 0) {
								tag.DisplayValue = utilityService.ToFixed(+tag.Value, 1);
							} else {
								tag.DisplayValue = '0.0';
							}
						}

					}



					//---B

					//Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.SiteId && vm.userSites) {

							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
							//console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							if (oldValue != newValue) {
								vm.widget.WidgetResource.$save();
								GetData();
							}
						}
					});


					//---B
					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

					//---B
					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});


					//***G
					//++Data Service Tag Updates
					//---G
					//+The data service is tracking all signalR pushed tag value updates in real-time.
					//+The data service will keep an inventory of all such updates as they happen.
					//+When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//+We will watch for it here and set the appropriate graphics flag.
					//---G

					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						if (vm.gateTagGroups) {

							//Set the alarmIsActive attribute to the assets so that the display can place the correct red box around it's indicator.
							if (updatedTag.IsAlarm) {
								vm.gateTagGroups.forEach(function (tg) {

								
									//console.log("Alarm tag update. updatedTag = %O", updatedTag);
									if (tg.PBBAsset && tg.PBBAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.PBBAsset);
									}

									if (tg.PCAAsset && tg.PCAAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.PCAAsset);
									}

									if (tg.GPUAsset && tg.GPUAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.GPUAsset);
									}


								});
							}
						}


					});

					//set the alarmActive for the asset if any of the alarm tag ValueWhenActive=Value
					function SetAlarmActiveForAssetBasedUponAlarmTagConditions(asset) {
						asset.alarmActive = false;
						asset.alarmActive = asset.AlarmTags.any(function (aTag) { return (aTag.ValueWhenActive + "") == (aTag.Value + "") });
					}


					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.gateTagGroups) {
							//console.log("Updated Tag For widget - %O", updatedTag);



							//if (updatedTag.SiteId == 81473 && updatedTag.TagName.indexOf("Counter") == -1) {

							//	console.log("Test Tag " + updatedTag.Asset.Name + " - " + updatedTag.JBTStandardObservation.Name + " - " + updatedTag.Value + " = %O", updatedTag);
							//}

							vm.gateTagGroups.forEach(function (tg) {

								var tgUpdateTag = tg.PCAUnitOnTag && tg.PCAUnitOnTag.TagId == updatedTag.TagId ? tg.PCAUnitOnTag :
													tg.GPUAircraftDockedTag && tg.GPUAircraftDockedTag.TagId == updatedTag.TagId ? tg.GPUAircraftDockedTag :
													tg.GPUUnitOnTag && tg.GPUUnitOnTag.TagId == updatedTag.TagId ? tg.GPUUnitOnTag :
													tg.PBBUnitOnTag && tg.PBBUnitOnTag.TagId == updatedTag.TagId ? tg.PBBUnitOnTag :
													tg.DischargeTemperatureTag && tg.DischargeTemperatureTag.TagId == updatedTag.TagId ? tg.DischargeTemperatureTag :
													tg.AverageAmpsOutTag && tg.AverageAmpsOutTag.TagId == updatedTag.TagId ? tg.AverageAmpsOutTag :
													tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.TagId == updatedTag.TagId ? tg.HookupDurationSecondsTag : null;

								if (tgUpdateTag) {

									




									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									//if (tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.TagId == updatedTag.TagId) {
									//	FormatDurationValue(tg.HookupDurationSecondsTag);
									//}

								}
							});
						}
					}

					//***G
					vm.state = $state;





					//+Update the duration counters each second until the next hard update from signalR
					vm.durationInterval = $interval(function () {
						if (vm.gateTagGroups) {

							vm.gateTagGroups.forEach(function (tg) {

								if (tg.HookupDurationSecondsTag && +tg.HookupDurationSecondsTag.LastObservationTextValue > 0) {
									tg.HookupDurationSecondsTag.LastObservationTextValue = +tg.HookupDurationSecondsTag.LastObservationTextValue;
									tg.HookupDurationSecondsTag.LastObservationTextValue += 1;
									FormatDurationValue(tg.HookupDurationSecondsTag);


								}
							});
						}

					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.durationInterval);

					});





					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


					function UpdateSelectedGateTagFromSignalR(gateTag, updatedTag) {
						//console.log("===========================================================");
						//console.log("Tag Update from SignalR = ", updatedTag.TagName + " StdObsId = " + updatedTag.JBTStandardObservationId + " Val=" + updatedTag.Value);
						//console.log("TG Item identified = %O", gateTag);

						gateTag.LastObservationTextValue = updatedTag.Value;
						gateTag.LastObservationId = updatedTag.LastObservationId;
						gateTag.LastObservationDate = updatedTag.LastObservationDate;

						//console.log("===========================================================");

					}

				};




				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteGateSummary.html?" + Date.now(),

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