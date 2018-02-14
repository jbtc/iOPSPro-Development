﻿(function ()
{

	"use strict";

	angular.module("app")
		.directive("textInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/textInput.html?" + Date.now,
			replace: true,
			priority: 10000,
			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				model: "=",
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

