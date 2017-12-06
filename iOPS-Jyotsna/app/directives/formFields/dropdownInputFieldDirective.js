(function ()
{

	"use strict";

	angular.module("app")
		.directive("dropdownInputField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse)
		{
			return {
				restrict: "E",
				templateUrl: "app/directives/formFields/dropdownInputFieldTemplate.html?" + Date.now,
				replace: true,
				scope: {
					labelText: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					idText: "@",
					displayWidth: "@",
					liveSearch: "@",
					instructions: "@",
					dropdownData: "="
				},
				link: function (scope, element, attrs)
				{

					//scope.$watch(scope.model, function(newValue, oldValue) {
					//	console.log(newValue);
					//});
					//$timeout(function ()
					//{
					//	$rootScope.$apply(function ()
					//	{


					//		var jqSelector = "#" + scope.idText;
					//		$(jqSelector).selectpicker();
					//		element.selectpicker('refresh');

					//		$().on('change', function ()
					//		{
					//			console.log("selectpicker " + jqSelector + " changed------------------------------------");
					//			var value = $(jqSelector + " > option:selected").val();
					//			scope.model = value;
					//		});

					//		$(jqSelector).selectpicker('val', scope.model);
					//	});

					//}, 1000);

				}


			};
		}]);
}());



//link: function (scope, element, attrs) {

//console.log(scope.dropdownData);

//$(element).selectpicker();

//scope.$watch(attrs.mySlide, function (newValue, oldValue)
//$(element).on('change', function ()
//{
//	var value = $(jquerySelectorString + " > option:selected").val();
//	getter.assign(scope, value);
//});
//$(jquerySelectorString).selectpicker('val', getter(scope));
