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
						if (vm.Asset) {
							return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + ' - ' + vm.Asset.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
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

					vm.headingUpdateInterval = $interval(function () {
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					}, 500);


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


					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;

						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						console.log("rawTagData Asset = %O", vm.Asset);
						GetTagsForAsset();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for asset id changes	
					$scope.$watch("vm.widget.WidgetResource.AssetId",
					function (newValue, oldValue) {

						console.log("AssetId changed - was " + oldValue + " now " + newValue);

						if (newValue != oldValue && newValue > 0) {
							console.log("Asset Id was different");
							vm.widget.WidgetResource.AssetId = +newValue;
							vm.widget.WidgetResource.$save();
							vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == +newValue });
							GetTagsForAsset();
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
						}
					});



					function GetTagsForAsset() {
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.widget.WidgetResource.AssetId).then(function () {

							$timeout(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							}, 50);

							console.log("Monitoring asset = %O", vm.Asset);

						});
					}




					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						console.log("Opening settings vm.Asset = %O", vm.Asset);


						if (!vm.Asset) {
							$state.go(".widgetSettings", { widget: vm.widget });
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