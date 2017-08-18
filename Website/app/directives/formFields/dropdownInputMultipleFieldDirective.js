(function ()
{

	"use strict";

	angular.module("app")
		.directive("dropdownInputMultipleField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse)
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/formFields/dropdownInputMultipleFieldTemplate.html?" + Date.now,
				replace: true,
				scope: {
					labelText: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					idText: "@",
					liveSearch: "@",
					instructions: "@",
					dropdownData: "="
				}
			};
		}]);
}());


