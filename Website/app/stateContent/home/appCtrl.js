//++App Controller
angular.module('app').controller('AppCtrl',
	['$scope', 'signalR', "securityService",
		function ($scope, signalR, securityService) {

			var vm = this;


			//console.log("appCtrl created");

			$scope.$on("securityService:authenticated", function (event, user) {
				//console.log("AppCtrl authenticated event received. User = %O", user);
				vm.showMenu = securityService.showMenu;
			});


			vm.state = 'unauthorized';
			vm.signIn = function () {
				vm.state = 'authorized';
			};
		}
	]);
