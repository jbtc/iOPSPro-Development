(function ()

{
	"use strict";

	angular.module("app")
		.directive("systemForm", function ()
		{
			return {
				restrict: "E",
				templateUrl: "app/directives/panels/systemForm.html?" + Date.now,
				replace: true,
				scope: {
					name: "@"
				},
				transclude: true

			};
		});
}());

