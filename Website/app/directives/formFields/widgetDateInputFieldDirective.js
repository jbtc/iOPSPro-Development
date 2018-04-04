(function ()
{

	"use strict";

	angular.module("app")
		.directive("widgetDateInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/widgetDateInput.html?" + Date.now,
			replace: true,
			priority: 10000,
			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				model: "=",
				idText: "@",
				inputName: "@",
				inputType: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@",
				placeholderText: "@",
				inputWidth: "@"
			}

		};
	});

}());

