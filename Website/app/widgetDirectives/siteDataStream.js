(function () {

	var app = angular.module('app');

	app.directive('siteDataStream',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					vm.columnWidths = {

						company: 4,
						terminal: 4,
						zone: 4,
						gate: 4,
						equipment: 4,
						tagId: 5,
						tagName: 40,
						observationName: 25,
						date: 20,
						value: 80,
						dataChangeCount: 15
					};

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);


					vm.dataService = dataService;

					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = Global.User.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

						console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function (site) {
							return userSiteCodes.any(function (sc) { return sc == site.Name })
						});

						console.log("vm.userSites = %O", vm.userSites);
						LoadData();

					});


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



					vm.buttonPanelWidth = 20;

					vm.state = $state;
					displaySetupService.SetPanelDimensions();
					vm.tags = [];



					function LoadData() {
						console.log("Load Data");

						//Set up interval that re-loads the vm tags. They will update that often.
						vm.updateInterval = $interval(function () {
							GetFormattedTags();
						}, 1000);

						$scope.$on("$destroy",
							function () {
								$interval.cancel(vm.updateInterval);
							});


						//Load the first time for responsiveness.
						GetFormattedTags();

						$scope.$$postDigest(function () {
							displaySetupService.SetPanelDimensions();
						});
					}

					function GetFormattedTags() {
						dataService.GetTags().then(function (data) {
							vm.totalChangeCount = 0;

							var upperSearchText;
							if (vm.searchText) {
								upperSearchText = vm.searchText.toUpperCase();
							}



							vm.tags = data
								.where(function(t){return vm.userSites.any(function(s){ return t.SiteId == s.Id})})
								.where(function (t) {
									if (vm.searchText == '' || !vm.searchText) {
										return true;
									}


									return t.TagName.toUpperCase().indexOf(upperSearchText) >= 0 || t.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) >= 0 || t.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) >= 0;
								})
								.orderByDescending(function (t) { return t.PLCUTCDateMS })
								.take(100);

							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


							//console.log("vm.tags = %O", vm.tags);


						});
					}

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteDataStream.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
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