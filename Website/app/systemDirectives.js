angular.module('app')
 .directive('focus', function focus() {
 	return {
 		link: function (scope, element) {
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 		}
 	};
 });	//focus

(function () {

	"use strict";

	angular.module("app")
		.directive("systemForm", function () {
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

(function () {

	"use strict";

	angular.module("app")
		.directive('sglclick',
			[
				'$parse', function ($parse) {
					return {
						restrict: 'A',
						link: function (scope, element, attr) {
							var fn = $parse(attr['sglclick']);
							var delay = 200, clicks = 0, timer = null;
							element.on('click',
								function (event) {
									clicks++; //count clicks
									if (clicks === 1) {
										timer = setTimeout(function () {
											scope.$apply(function () {
												fn(scope, { $event: event });
											});
											clicks = 0; //after action performed, reset counter
										},
											delay);
									} else {
										clearTimeout(timer); //prevent single-click action
										clicks = 0; //after action performed, reset counter
									}
								});
						}
					};
				}
			]);
}());



//(function () {

//	"use strict";

//	angular.module("app")
//		.directive('tooltip', function () {
//			return {
//				restrict: 'A',
//				link: function (scope, element, attrs) {
//					$(element).hover(function () {
//						// on mouseenter
//						$(element).tooltip('show');
//					}, function () {
//						// on mouseleave
//						$(element).tooltip('hide');
//					});
//				}
//			};
//		});
//}());



(function () {

	"use strict";

	angular.module("app")
		.directive("textareaInputField", function () {
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
				link: function (scope, element) {

					element[0].focus();
				}
			};
		});

}());


(function () {

	"use strict";

	angular.module("app")
		.directive("checkboxInputField", function () {
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



(function () {

	"use strict";

	angular.module("app")
		.directive("textInputField", function ($compile) {
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
				},
				link: function (scope, element, attrs) {
					if ('focus' in attrs) {
						element.find("input").attr('focus', 'true');
						$compile(element)(scope);


					}
					if ('inputWidth' in attrs) {
						//console.log("inputWidth found");
						element.find("input").css('width', scope.inputWidth);
						$compile(element)(scope);


					}
				}

			};
		});

}());


(function () {

	"use strict";

	angular.module("app")
		.directive("dropdownInputField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse) {
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
				link: function (scope, element, attrs) {

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


angular.module('app')
	.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if (event.which === 13) {
					scope.$apply(function () {
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	});
