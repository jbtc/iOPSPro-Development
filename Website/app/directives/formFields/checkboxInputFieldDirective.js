(function ()
{

	"use strict";

	angular.module("app")
		.directive("checkboxInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "angular/common/directives/formFields/checkboxInputFieldTemplate.html?" + Date.now,
			replace: true,

			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				isChecked: "=",
				model: "=",
				checkboxName: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@"

 			}

		};
	});

}());

