(function ()
{

	"use strict";

	angular.module("app")
		.directive("checkboxInputTdField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "angular/common/directives/formFields/checkboxInputTdFieldTemplate.html?" + Date.now,
			replace: true,

			scope: {				
				model: "="
 			}

		};
	});

}());

