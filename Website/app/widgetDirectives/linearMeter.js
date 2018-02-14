(function () {

	var app = angular.module('app');

	app.directive('linearMeter',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					//console.log("Linear Meter directive invoked");


					vm.lowPercentageWidth = ((vm.lowRangeEndValue - vm.lowRangeStartValue) / (vm.maxScale - vm.minScale)) * 100;
					vm.highPercentageWidth = ((vm.highRangeEndValue - vm.highRangeStartValue) / (vm.maxScale - vm.minScale)) * 100;
					vm.midPercentageWidth = 100 - vm.lowPercentageWidth - vm.highPercentageWidth;

					vm.lowRangeTitle = 'Low Range: ' + vm.lowRangeStartValue + ' to ' + vm.lowRangeEndValue;
					vm.normalRangeTitle = 'Normal Range: ' + vm.lowRangeEndValue + ' to ' + vm.highRangeStartValue;
					vm.highRangeTitle = 'High Range: ' + vm.highRangeStartValue + ' to ' + vm.highRangeEndValue;

					SetCurrentValueLabel();
					SetValuePercentagePosition();
					SetRangeFlags();

					//Start watch for value changes	
					$scope.$watch("vm.currentValue",
					function (newValue, oldValue) {
						SetValuePercentagePosition();
						SetCurrentValueLabel();
						SetRangeFlags();
					});


					function SetCurrentValueLabel() {
						var label = toFixed(vm.currentValue, 1).toString();
						if (label.indexOf('.') < 0) {
							label += '.0';
						}

						vm.currentValueLabel = label;
					}


					function SetRangeFlags() {
						if (vm.currentValue < vm.lowRangeEndValue) {
							vm.lowRangeActive = true;
							vm.normalRangeActive = false;
							vm.highRangeActive = false;
						}

						if (vm.currentValue >= vm.lowRangeEndValue && vm.currentValue < vm.highRangeStartValue) {
							vm.lowRangeActive = false;
							vm.normalRangeActive = true;
							vm.highRangeActive = false;
						}

						if (vm.currentValue >= vm.highRangeStartValue) {
							vm.lowRangeActive = false;
							vm.normalRangeActive = false;
							vm.highRangeActive = true;
						}


					}



					function SetValuePercentagePosition() {
						vm.valuePercentagePosition = ((vm.currentValue - vm.lowRangeStartValue - 20) / (vm.highRangeEndValue - vm.lowRangeStartValue)) * 100;
						if (vm.valuePercentagePosition > 95) {
							vm.valuePercentagePosition = 95;
						}

						if (vm.valuePercentagePosition < -5) {
							vm.valuePercentagePosition = -5;
						}
						vm.valuePercentagePosition += 3;
						//console.log("percentage position = " + vm.valuePercentagePosition);
					}

					function toFixed(number, fractionSize) {
						return +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
					}


				}; //++End of controller function


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/linearMeter.html?" + Date.now(),

					scope: {
						lowRangeStartValue: "=",
						lowRangeEndValue: "=",
						highRangeStartValue: "=",
						highRangeEndValue: "=",
						minScale: "=",
						maxScale: "=",
						lowRangeActiveColor: "@",
						highRangeActiveColor: "@",
						normalRangeActiveColor: "@",
						id: "@",
						label: "@",
						units: "@",
						currentValue: "="
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());