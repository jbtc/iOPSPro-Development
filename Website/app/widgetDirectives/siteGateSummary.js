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


					$timeout(function() {
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

					//a double click on the asset indicator will add a summary widget to the dashboard
					vm.AddToDashboard = function (tag, $event) {

						console.log("Double Click tag = %O", tag);

						var widgetTypeId = tag.AssetName == 'PCA' ? 42 : tag.AssetName == 'PBB' ? 49 : tag.AssetName == 'GPU' ? 50 : 0;


						return dataService.GetEntityById("WidgetTypes", widgetTypeId).then(function (wt) {


							var gateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == tag.Asset.ParentSystemId });
							var zoneSystem = vm.JBTData.Systems.first(function (s) { return s.Id == gateSystem.ParentSystemId });
							var terminalSystem = vm.JBTData.Systems.first(function (s) { return s.Id == zoneSystem.ParentSystemId });
							var newPosition = GetNextWidgetRowColumn();
							console.log("New Position calculation = %O", newPosition);

							return dataService.AddEntity("Widgets",
								{
									Name: wt.Name,
									WidgetTypeId: widgetTypeId,
									ParentDashboardId: vm.dashboard.Id,
									Width: wt.InitialWidth,
									Height: wt.InitialHeight,
									Row: newPosition.row + 100,
									Col: newPosition.col,
									AssetId: tag.AssetId,
									DefaultNavPill: tag.AssetName == 'PCA' ? "Press" : tag.AssetName == 'GPU' ? "Amps" : "Data",
									SiteId: tag.SiteId,
									SplitLeftPercentage: 50,
									SplitRightPercentage: 50,
									SystemId: tag.Asset.ParentSystemId,
									GateSystemId: tag.Asset.ParentSystemId,
									ZoneSystemId: zoneSystem.Id,
									TerminalSystemId: terminalSystem.Id
								}).then(function (widget) {
									signalR.SignalAllClients("WidgetAdded", widget);
									return true;
							});
						});

					}

					vm.AddWidgetGroupToDashboard = function(group) {
						vm.AddToDashboard(group.PBBUnitOnTag).then(function() {					
							vm.AddToDashboard(group.PCAUnitOnTag).then(function() {
								vm.AddToDashboard(group.GPUUnitOnTag);
							});
						});
					}


					function GetNextWidgetRowColumn() {


						var nonPopUpWidgets = vm.dashboard.widgets.where(function(w) { return !w.IsModalPopUp });
						console.log("nonPopUpWidgets = %O", vm.dashboard.widgets);

						var lowestPoint = nonPopUpWidgets.max(function (w) { return w.row + w.sizeY });
						console.log("Lowest point = %O", lowestPoint);

						var lowestPointWidgets = nonPopUpWidgets.where(function (w) { return (w.row + w.sizeY) == lowestPoint });
						console.log("lowestPointWidgets = %O", lowestPointWidgets);

						var furthestRightPoint = lowestPointWidgets.max(function (w) { return (w.col + w.sizeX) });
						console.log("furthestRightPoint = %O", furthestRightPoint);



						var col = +furthestRightPoint;



						if (col >= 30) {
							col = 0;
						}

						return {
							row: lowestPoint,
							col: col
						}

					}



					vm.OpenSummaryWidget = function(tag, $event) {
						console.log("Opening summary widget for tag  %O", tag);
						
						//Add the child widget if not already in the database.


						dataService.GetIOPSResource("Widgets")
							.filter("ParentWidgetId", vm.widget.Id)
							.filter("AssetId", tag.AssetId)
							.query()
							.$promise
							.then(function(data) {
								console.log("Existing child widget = %O", data);
								if (data.length == 1) {


									var w = data[0];

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

									switch (tag.AssetName) {
									case "PCA":
										$state.go(".pcaSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
										break;

									case "GPU":
										$state.go(".gpuSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
										break;

									case "PBB":
										$state.go(".pbbSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
										break;

									}

								} else {
									//The child widget does not yet exist. Create one and add it to the database,
									dataService.GetIOPSResource("SystemGroups")
										.filter("Id", tag.Asset.ParentSystemId)
										.expandPredicate("Parent")
											.expand("Parent")
										.finish()
										.query()
										.$promise
										.then(function (systemChainData) {

											var gateSystem = systemChainData[0];
											console.log("Gate System Chain = %O", gateSystem);

											var newChildWidget = {
												Name: tag.GateName + ' - ' + tag.AssetName + ' Summary',
												WidgetTypeId: tag.AssetName == 'PCA' ? 42 :
																tag.AssetName == 'GPU' ? 50 :
																tag.AssetName == 'PBB' ? 49 : 0,
												ParentDashboardId: vm.dashboard.Id,
												AssetId: tag.Asset.Id,
												SystemId: tag.Asset.ParentSystemId,
												SiteId: tag.SiteId,
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


												switch (tag.AssetName) {
												case "PCA":
													$state.go(".pcaSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
													break;

												case "GPU":
													$state.go(".gpuSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
													break;

												case "PBB":
													$state.go(".pbbSummaryModal", { widget: vm.childWidget, assetId: tag.AssetId, dashboard: vm.dashboard });
													break;

												default:

												}


											});

											

										})



								}



							});


					};


					vm.OpenSettingsIfNoSiteAndCloseIfSiteIsPresent = function () {

						//console.log("Opening settings vm.widgetSite = %O",vm.widgetSite);


						if (!vm.widgetSite) {


							$state.go(".widgetSettings", { widget: vm.widget});
						}
					}





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
							GetData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.JBTData.Sites.first(function(s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetData();
							}
						}
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});


					function GetData() {

						dataService.GetIOPSResource("JBTStandardObservations")
							.filter("Id", 12374)
							.expandPredicate("Tags")
								.filter("SiteId", vm.widget.WidgetResource.SiteId)
								.expandPredicate("Asset")
									.expandPredicate("Tags")
										//.filter("JBTStandardObservationId", 2736)
										.filter($odata.Predicate.or([new $odata.Predicate("JBTStandardObservationId", 2736),new $odata.Predicate("JBTStandardObservationId", 1942), new $odata.Predicate("JBTStandardObservationId", 12484)]))
									.finish()
								.finish()
							.finish()
							.query()
							.$promise
							.then(function (data) {

								data = data[0].Tags.orderBy(function(t){return t.Name});
								//console.log("siteGateSummary data = %O", data);


								vm.gateTagGroups = data
									.select(function (t) {
										t.dischargeTemperatureTag = t.Asset.Tags.where(function(t2){return t2.JBTStandardObservationId == 2736}).orderByDescending(function(tt) { return tt.LastObservationDate }).first();
										t.averageAmpsOutTag = t.Asset.Tags.where(function(t2){return t2.JBTStandardObservationId == 1942}).orderByDescending(function(tt) { return tt.LastObservationDate }).first();
										t.hookupDurationSecondsTag = t.Asset.Tags.where(function(t2){return t2.JBTStandardObservationId == 12484}).orderByDescending(function(tt) { return tt.LastObservationDate }).first();

										return t;
									})
									.groupBy(function(t) { return t.GateName })
									.select(function (g) {

										var pcaForGate = g.where(function (t2) { return t2.AssetName == 'PCA' }).orderByDescending(function (t2) { return t2.LastReportedDate }).first();
										var gpuForGate = g.where(function (t2) { return t2.AssetName == 'GPU' }).orderByDescending(function (t2) { return t2.LastReportedDate }).first();

										var outputObject = {
											GateName: g.key,
											GateSystem: vm.JBTData.Systems.first(function(s){return s.SiteId == vm.widget.WidgetResource.SiteId && s.TypeId == 3 && s.Name == g.key}),
											PCAUnitOnTag: g.where(function (t2) { return t2.AssetName == 'PCA' }).orderByDescending(function (t2) { return t2.LastReportedDate }).first(),
											DischargeTemperatureTag: pcaForGate ?  pcaForGate.dischargeTemperatureTag : null,
											GPUUnitOnTag: g.where(function(t2){return t2.AssetName == 'GPU'}).orderByDescending(function(t2){return t2.LastReportedDate}).first(),
											AverageAmpsOutTag: gpuForGate ? gpuForGate.averageAmpsOutTag : null,
											HookupDurationSecondsTag: gpuForGate ? gpuForGate.hookupDurationSecondsTag : null,
											PBBUnitOnTag: g.where(function(t2){return t2.AssetName == 'PBB' && t2.JBTStandardObservationId == 12374}).orderByDescending(function(t2){return t2.LastReportedDate}).first()
										}

										FormatZeroBlankDisplayValueForTag(outputObject.DischargeTemperatureTag);
										FormatZeroBlankDisplayValueForTag(outputObject.AverageAmpsOutTag);
										FormatDurationValue(outputObject.HookupDurationSecondsTag);
										return outputObject;

									})
									.orderBy(function(group){ return group.GateName});
								vm.showWidget = true;
								//console.log("vm.gateTagGroups = %O", vm.gateTagGroups);
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
							});



					}

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
					
					function FormatZeroBlankDisplayValueForTag(tag) {
						if (tag) {
								tag.DisplayValue = utilityService.ToFixed(+tag.LastObservationTextValue, 1);
								//if (+tag.LastObservationTextValue > 0) {
								//	tag.DisplayValue = utilityService.ToFixed(+tag.LastObservationTextValue, 1);
								//} else {
								//	tag.DisplayValue = '';
								//}
							}
							
						}
					



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


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

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
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.gateTagGroups) {
							//console.log("Updated Tag For widget - %O", updatedTag);



							vm.gateTagGroups.forEach(function (tg) {

								var tgUpdateTag = tg.PCAUnitOnTag && tg.PCAUnitOnTag.Id == updatedTag.TagId ? tg.PCAUnitOnTag :
													tg.GPUUnitOnTag && tg.GPUUnitOnTag.Id == updatedTag.TagId ? tg.GPUUnitOnTag :
													tg.PBBUnitOnTag && tg.PBBUnitOnTag.Id == updatedTag.TagId ? tg.PBBUnitOnTag :
													tg.DischargeTemperatureTag && tg.DischargeTemperatureTag.Id == updatedTag.TagId ? tg.DischargeTemperatureTag :
													tg.AverageAmpsOutTag && tg.AverageAmpsOutTag.Id == updatedTag.TagId ? tg.AverageAmpsOutTag :
													tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.Id == updatedTag.TagId ? tg.HookupDurationSecondsTag : null;
												
								if (tgUpdateTag) {
									UpdateSelectedGateTagFromSignalR(tgUpdateTag, updatedTag);
									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									if (tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.Id == updatedTag.TagId) {									
										FormatDurationValue(tg.HookupDurationSecondsTag);
									}

								}
							});
						}
					}

					//***G
					vm.state = $state;





					//Update the duration counters each second until the next hard update from signalR
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