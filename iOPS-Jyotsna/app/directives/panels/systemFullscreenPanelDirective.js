(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemFullscreenPanel", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemFullscreenPanel.html?" + Date.now,
				replace: true,
				transclude: true
			};
		});
}());

