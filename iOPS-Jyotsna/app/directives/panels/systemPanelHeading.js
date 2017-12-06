(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemPanelHeading", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemPanelHeading.html?" + Date.now,
				replace: true,
				scope: {
					panelTitle: "@",
					panelSubTitle: "@",
					panelHeadingId: "@"
				},
				transclude: true

			};
		});
}());

