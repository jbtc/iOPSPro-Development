//++Dashboard Controller
(function () {
	"use strict";


	function DashboardCtrl($scope, $rootScope, $state, displaySetupService, dataService, signalR, $interval, $stateParams, $timeout, $q, uibButtonConfig, utilityService) {
		//console.log("DashboardCtrl conroller invoked.");
		var vm = this;


		vm.dashboardId = $stateParams.DashboardId;


	}

	angular
		.module("app")
		.controller("DashboardCtrl", [
			"$scope",
			"$rootScope",
			"$state",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$stateParams",
			"$timeout",
			"$q",
			"uibButtonConfig",
			"utilityService",
			DashboardCtrl
		]);



})();
