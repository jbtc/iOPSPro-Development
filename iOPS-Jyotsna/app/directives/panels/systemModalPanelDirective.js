(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemModalPanel", function ($compile)
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemModalPanel.html?" + Date.now(),
				priority:  -1,
				replace: true,
				transclude: true,
				scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
					maxWidth: "@"
				}
			};
		});
}());

