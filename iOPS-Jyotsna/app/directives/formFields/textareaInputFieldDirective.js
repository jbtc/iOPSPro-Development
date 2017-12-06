(function ()
{

	"use strict";

	angular.module("app")
		.directive("textareaInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/textareaInputFieldTemplate.html?" + Date.now(),
			replace: true,

			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				cols: "@",
				rows: "@",
				placeholderText: "@",
				model: "=",
				inputName: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@"
			},
			link: function (scope, element)
			{

				element[0].focus();
			}
		};
	});

}());

