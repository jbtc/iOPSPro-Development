angular.module('app')
 .directive('focus', function focus()
 {
 	return {
 		link: function (scope, element)
 		{
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 		}
 	};
 });
