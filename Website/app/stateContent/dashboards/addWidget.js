//++AddWidget Controller
(function () {
	"use strict";


	function AddWidgetCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("AddWidgetCtrl invoked");


		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';

		$timeout(function () {
			$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
		}, 1000);



		if ($stateParams.DashboardId < 0) {
			$stateParams.DashboardId = 0;
		}

		$scope.$on("$destroy",
			function () {
				$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
			});


		vm.SetDefaultNavPill = function (id) {
			vm.dashboardFromDB.DefaultWidgetTypeTabGroupId = id;
			vm.dashboardFromDB.$save();

		}

		vm.columnWidths = {
			name: 35,
			description: 65

		}


		function GetData() {

			//Get the widget types already on the dashboard:
			dataService.GetIOPSResource("Widgets")
				.filter("ParentDashboardId", +$stateParams.DashboardId)
				.query().$promise
				.then(function (widgetsOnDashboard) {
					vm.widgetsOnDashboard = widgetsOnDashboard;
					console.log("widgetsOnDashboard = %O", widgetsOnDashboard);

					$q.all(
						[
							dataService.GetIOPSResource("WidgetTypes").expand("WidgetTypeTabGroup").query().$promise.then(function (wt) {

								vm.widgetTypeGroups = wt
									.where(function (t) {
										return t.IsAvailableToAll ||
											(securityService.UserHasAuthorizedActivity("AuthorizedActivity.AdministerSystem") && t.IsAvailableToAdmin);
									})
									.groupBy(function (t) { return t.WidgetTypeTabGroup ? t.WidgetTypeTabGroup.Name : 'Misc' })
									.select(function (g) {
										return {
											Name: g.key,
											WidgetTypeTabGroupId: g.first() && g.first().WidgetTypeTabGroup && g.first().WidgetTypeTabGroup.Id || 'Misc',
											WidgetTypes: g.select(function (t) { return t })
										};
									});

							}),

							dataService.GetEntityById("Dashboards", +$stateParams.DashboardId).then(function (dashboard) {
								vm.dashboardFromDB = dashboard;
							})



						]
					).then(function () {


						console.log("vm = %O", vm);

						//+If the dashboard does not yet have a default tab group Id, then set it to the first on in the tab groups and save the dashboard to the database.
						if (!vm.dashboardFromDB.DefaultWidgetTypeTabGroupId) {
							vm.dashboardFromDB.DefaultWidgetTypeTabGroupId = vm.widgetTypeGroups.first().WidgetTypeTabGroupId;
							vm.dashboardFromDB.$save();


						}


						vm.showScreen = true;
						displaySetupService.SetPanelDimensions(20);
					});

				});



		}

		GetData();



		vm.columnWidths = {
			categoryPath: 35,
			name: 20,
			description: 50
		};



		hotkeys.bindTo($scope)
			.add({
				combo: 'ctrl+s',
				description: 'Save and Close any form data input form',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function () {
					event.preventDefault();
					vm.Save();

				}
			})
			.add({
				combo: 'esc',
				description: 'Cancel and close any input form',
				allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
				callback: function () {
					$state.go("^");
				}
			});


		vm.widgetTypeIdsToAdd = [];
		var rowStart = 40;

		vm.AddWidget = function (wt) {
			rowStart += 10;
			$q.when(
				wt.AngularDirectiveName == 'dashboard'
				?
				//Collect a copy of the current dashboard
				dataService.GetEntityById("Dashboards", $stateParams.DashboardId).then(function (currentDashboard) {
					return dataService.AddEntity('Dashboards',
						{
							CreatorUserId: Global.User.Id,
							Name: 'Widget Panel',
							CustomStartDate: currentDashboard.CustomStartDate,
							CustomEndDate: currentDashboard.CustomEndDate,
							TimeScopeId: currentDashboard.TimeScopeId,
							ParentDashboardId: currentDashboard.Id //This is the secret to embedding dashboards. The embedded ones will have a parent dashboard id.
						});

				})
				: false
			).then(function (newDashboard) {

				//newDashboard can either be a real new, embedded, dashboard, or a false.
				console.log("New Embedded Dashboard = %O", newDashboard);
				return dataService.AddEntity("Widgets",
					{
						Name: wt.Name,
						WidgetTypeId: wt.Id,
						ParentDashboardId: $stateParams.DashboardId,
						EmbeddedDashboardId: newDashboard ? newDashboard.Id : null,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						SplitLeftPercentage: 50,
						SplitRightPercentage: 50,
						Row: 100,
						Col: 0
					}).then(function (widget) {

					signalR.SignalAllClients("WidgetAdded", widget);

				});


			});

		}


		vm.Close = function () {

			$state.go("^");
			//$timeout(function () {
			//	$state.go("^");
			//	$timeout(function () {
			//		$state.go("home.app.dashboard", { DashboardId: $stateParams.DashboardId });

			//	},10);

			//},10);


		}


	}

	angular
		.module("app")
		.controller("AddWidgetCtrl", [
			"$q",
			"$state",
			"$rootScope",
			"$scope",
			"securityService",
			"dataService",
			"$stateParams",
			"utilityService",
			"$timeout",
			"uibButtonConfig",
			"hotkeys",
			"$interval",
			"displaySetupService",
			"signalR",
			AddWidgetCtrl
		]);



})();

