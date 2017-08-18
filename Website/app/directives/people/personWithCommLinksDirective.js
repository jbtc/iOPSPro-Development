(function ()
{

	var app = angular.module('app');

	app.directive('personWithCommLinks',
			function () {
				return {
					restrict: 'E',
					replace: true,
					templateUrl: "angular/common/directives/people/personWithCommLinksDirectiveTemplate.html?" + Date.now(),
					scope: {
						person: "=",
						mailToSubject: "@"
					}
				};
			}
	);

}());