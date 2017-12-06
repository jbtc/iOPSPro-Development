(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemPanelHeadingButtons", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemPanelHeadingButtons.html?" + Date.now,
				replace: true,
				transclude: true

			};
		});
}());

