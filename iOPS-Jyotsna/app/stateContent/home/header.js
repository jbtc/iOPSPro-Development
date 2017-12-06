(function ()
{
	"use strict";


	function HeaderCtrl($scope, displaySetupService, hotkeys, $state, store, securityService)
	{
	    var vm = this;


	    vm.displaySetupService = displaySetupService;
	    //console.log("Current state = %O", $state);

		hotkeys.bindTo($scope)
		.add({
			combo: 'esc',
			description: 'Cancel and close any input form',
			allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
			callback: function () {
                if ($state.current.name.split(".").length > 3) {
        			$state.go("^");
                }
			}
		});


		vm.Logout = function () {
			store.remove('currentUser');
			securityService.currentUser = null;
			document.location = webRoot;
		}

	}

	angular
			.module("app")
			.controller("HeaderCtrl", [
				"$scope",
                "displaySetupService",
                "hotkeys",
                "$state",
				"store",
				"securityService",
				HeaderCtrl
			]);



})();