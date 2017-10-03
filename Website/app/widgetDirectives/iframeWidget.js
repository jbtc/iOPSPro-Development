(function () {

	var app = angular.module('app');

	app.directive('iframeWidget',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$sce",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $sce) {

				var controller = function ($scope) {
					var vm = this;

					vm.widget.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#3eff3e, #eefeee)',
						tagDataSortField: '-LastObservationDate',
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
					$timeout(function() {					
						SetIFrameHeight();
					},25);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.OpenSettingsIfNoURLAndCloseIfURLIsPresent = function () {

						console.log("vm.OpenSettingsIfNoURLAndCloseIfURLIsPresent ");

						if (!vm.widget.WidgetResource.TargetURL || vm.widget.WidgetResource.TargetURL == '') {

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



					$timeout(function () {
						if (!vm.widget.WidgetResource.TargetURL || vm.widget.WidgetResource.TargetURL == '') {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id).css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
						}
					}, 200);

					//Start watching for TargetURL changes	
					$scope.$watch("vm.widget.WidgetResource.TargetURL",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TargetURL && vm.widget.WidgetResource.TargetURL != '') {

							if (newValue != oldValue) {
								vm.widget.WidgetResource.$save();
								vm.url = $sce.trustAsResourceUrl(vm.widget.WidgetResource.TargetURL);
							}

						}
					});

					vm.CloseSettings = function () {
						$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
					}


					vm.url = $sce.trustAsResourceUrl(vm.widget.WidgetResource.TargetURL);



					function SetIFrameHeight() {
						var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						$("#systemIFrame" + vm.widget.Id).css('height', widgetDimensions.height);

					}





					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetIFrameHeight();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetIFrameHeight();
					
							}, 50, 20);
						}
					});






					//***G

					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});

					
				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/iframeWidget.html?" + Date.now(),

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