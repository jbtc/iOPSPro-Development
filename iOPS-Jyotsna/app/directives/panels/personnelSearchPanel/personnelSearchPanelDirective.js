(function ()
{

	"use strict";

	angular.module("app")
		.directive("personnelSearchPanel", function ()
		{
			return {
				restrict: 'E',
				templateUrl: "angular/common/directives/personnelSearchPanel/personnelSearchPanel.html?" + Date.now,
				replace: true,
				scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
					labelText: "@",
					editPaneUiViewName: "@",
					model: "="
				}

			};
		});

}());

