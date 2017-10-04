(function () {

	var app = angular.module('app');

	app.directive('terminalOverview',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					console.log("Terminal Overview directive invoked");

					function GetHeadingExtraTitle() {
						if (vm.terminalSystem) {
							return ' - ' + vm.terminalSystem.Site.Name + ' Terminal ' + vm.terminalSystem.Name;
						}
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#7e7e7e, #fefefe)';


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#7e7e7e, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}




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


					vm.OpenSettingsIfNoTerminalAndCloseIfTerminalIsPresent = function () {

						console.log("Opening settings vm.terminalSystem = %O", vm.terminalSystem);


						if (!vm.terminalSystem) {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id)
								.css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideDown();
						} else {

							console.log("Closing settings.....");

							$("#gridster" + vm.widget.Id).css('z-index', '2');
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
						}
					}




					vm.CloseSettings = function () {
						$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
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

							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.SiteId });
							console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							if (oldValue != newValue) {
								vm.terminals = null;
								vm.terminalSystem = null;
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

						}
					}

					//Start watching for terminal id changes	
					$scope.$watch("vm.widget.WidgetResource.TerminalSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TerminalSystemId) {
							console.log("vm.widget.WidgetResource.TerminalSystemId changed. Old = %O", oldValue);
							console.log("vm.widget.WidgetResource.TerminalSystemId changed. New = %O", newValue);
							if (newValue != oldValue) {
								vm.widget.WidgetResource.$save();
								//GetGraphicActivationTagsForTerminal();
							}

							GetTerminalSystemWithGraphics();


						}
					});




					function GetTerminalSystemWithGraphics() {

						dataService.GetIOPSWebAPIResource("TerminalOverviewGraphicsAndTags")
							.query({
								terminalSystemId: vm.widget.WidgetResource.TerminalSystemId
							}, function (data) {

								vm.terminalGraphics = data;
								data.forEach(function (tag) {
									if (tag.LastObservationTextValue == tag.ValueWhenVisible) {
										tag.showImage = true;
									} else {
										tag.showImage = false;
									}

								});

								vm.terminalSystem = vm.JBTData.Systems.first(function(s){return s.Id == vm.widget.WidgetResource.TerminalSystemId});
								console.log("vm.terminalSystem = %O", vm.terminalSystem);
								console.log("TerminalOverviewGraphicsAndTags initial data = %O", data);
								dataService.PlaceTerminalGraphicsTagsIntoInventory(data);
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();


								vm.showWidget = true;

							});


					}


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

						if (updatedTag && vm.terminalGraphics) {
							//See if this is the asset to which the tag belongs

							//console.log("Updated Tag For widget - %O", updatedTag);



							vm.terminalGraphics.forEach(function (tg) {
								//console.log("TG = %O", tg);
								//Set the "showImage" flag on each appropriately.
								if (tg.JBTStandardObservationId == updatedTag.JBTStandardObservationId && updatedTag.TagId == tg.TagId) {


									tg.LastObservationTextValue = updatedTag.LastObservationTextValue;
									tg.LastObservationId = updatedTag.LastObservationId;
									tg.LastObservationDate = updatedTag.LastObservationDate;
									if (updatedTag.LastObservationTextValue == tg.ValueWhenVisible) {
										tg.showImage = true;
									} else {
										tg.showImage = false;
									}

									if (tg.showImage) {
										console.log("Tag set to visible = %O", tg);
									}
								}
							});
						}
					}

					//***G
					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/terminalOverview.html?" + Date.now(),

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