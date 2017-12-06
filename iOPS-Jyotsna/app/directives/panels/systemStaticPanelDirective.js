(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemStaticPanel", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemStaticPanel.html?" + Date.now,
				replace: true,
				transclude: true,
				scope: {
					maxPanelWidth: "@"
				}

			};
		});
}());

