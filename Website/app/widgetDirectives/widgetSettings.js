//++WidgetSettings Controller
(function () {
	"use strict";


	function WidgetSettingsCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';

		vm.widget = $stateParams.widget;

		$scope.$on("$destroy",
			function () {
				console.log("Destroyed settings controller");
				$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
			});

		console.log("Settings controller widget = %O", vm.widget);

		//determine the type of settings screen
		switch (vm.widget.WidgetResource.WidgetType.AngularDirectiveName) {

		case 'siteGateSummary':
		case 'reports':
		case 'siteActiveAlarms':
		case 'siteActiveWarnings':
		case 'gsTopFiveAlarmTypes':
		case 'gsTopFiveAlarmTypesByEquipment':
		case 'gsEquipmentUsage':
		case 'gsEquipmentHoursOfUsage':
		case 'gsEquipmentUtilizationSummary':
		case 'pcaDischargePerformance':
			vm.selectSite = true;
			vm.selectTerminal = vm.selectZone = vm.selectGate = vm.selectAsset = vm.selectBHS = false;
			break;

		case 'terminalOverview':
			vm.selectSite = vm.selectTerminal = true;
			vm.selectZone = vm.selectGate = vm.selectAsset = vm.selectBHS = false;
			break;

		case 'rawTagDataForAsset':
			vm.selectSite = vm.selectTerminal = vm.selectZone = vm.selectGate = vm.selectAsset = true;
			vm.selectBHS = false;
			break;

		case 'pcaSummary':
		case 'pbbSummary':
		case 'gpuSummary':
		case 'gsServiceCounters':
			vm.selectSite = vm.selectTerminal = vm.selectZone = vm.selectGate = true;
			vm.selectAsset = false;
			break;

		default:


		}



		vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

		function SaveWidgetResourceObjectIfChanged() {
			var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
			if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

				console.log("Saving widget resource........");
				console.log("Original WidgetResource = %O", vm.originalWidgetResource);
				console.log("Changed WidgetResource = %O", possiblyChangedResource);
				vm.widget.WidgetResource.$save();
				vm.originalWidgetResource = possiblyChangedResource;
			}
		}





		//Get a copy of the user record to determine privs
		vm.user = Global.User;

		vm.panelTitle = "Widget Settings for : " + vm.widget.WidgetResource.Name;
		vm.panelSubtitle = "esc to return to dashboard";

		$scope.$$postDigest(function () {
			//displaySetupService.SetPanelDimensions(10);

			vm.showScreen = true;
			console.log("vm = %O", vm);
		});

		if (vm.selectTerminal) {

			//Start watching for site id changes	
			$scope.$watch("vm.widget.WidgetResource.SiteId",
				function (newValue, oldValue) {
					if (vm.widget.WidgetResource.SiteId && vm.userSites) {

						vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.SiteId });
						console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
						if (oldValue != newValue) {
							vm.terminals = null;
							vm.terminalSystem = null;
							vm.widget.WidgetResource.$save();
							GetTerminalsForWidgetSite();
						}
					}
				});

		}

		if (vm.selectZone) {

			//Start watching for terminal id changes	
			$scope.$watch("vm.widget.WidgetResource.TerminalSystemId",
				function (newValue, oldValue) {
					if (vm.widget.WidgetResource.TerminalSystemId) {

						console.log("vm.widget.WidgetResource.TerminalSystemId changed. Old = %O", oldValue);
						console.log("vm.widget.WidgetResource.TerminalSystemId changed. New = %O", newValue);
						if (newValue != oldValue) {
							vm.widget.WidgetResource.ZoneSystemId = null;
							vm.widget.WidgetResource.GateSystemId = null;
							vm.zones = null;
							vm.gates = null;
							vm.pbb = null;

							SaveWidgetResourceObjectIfChanged();

						}

						GetZonesForWidgetTerminal();
					}
				});
		}


		//Get the site entities for which the user has access.
		dataService.GetJBTData().then(function (JBTData) {
			vm.JBTData = JBTData;
			var userSiteCodes = vm.user.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
				.select(function (s) { return s.split('.')[1] });

			console.log("user site codes = %O", userSiteCodes);

			vm.userSites = vm.JBTData.Sites.where(function (site) {
					return userSiteCodes.any(function (sc) { return sc == site.Name });
				})
				.where(function (s) { return !vm.selectTerminal || s.Systems.any(function (sys) { return sys.TypeId == 1 }) });

			console.log("vm.userSites = %O", vm.userSites);

			if (vm.userSites.length == 1) {
				console.log("User only has a single Site");
				vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			}


			if (vm.selectTerminal) {
				GetTerminalsForWidgetSite();
			}







		});


		function GetTerminalsForWidgetSite() {
			if (vm.widget.WidgetResource.SiteId) {

				console.log("Getting the terminals for the widget site");

				vm.terminals = vm.JBTData
					.Systems
					.where(function (s) { return s.SiteId == vm.widget.WidgetResource.SiteId && s.Type == 'Terminal' });
				if (vm.terminals.length == 1) {
					vm.terminalSystem = vm.terminals[0];
					vm.widget.WidgetResource.TerminalSystemId = vm.terminalSystem.Id;
				}

			}
		}





		function GetZonesForWidgetTerminal() {
			if (vm.terminals && vm.widget.WidgetResource.TerminalSystemId) {

				console.log("Getting the zone (area system) for the widget terminal");

				vm.zones = vm.JBTData
					.Systems
					.where(function (s) { return s.Type == 'Zone' && s.ParentSystemId == vm.widget.WidgetResource.TerminalSystemId }) //children of this terminal
					.where(function (zoneSystem) { return vm.JBTData.Systems.any(function (s) { return s.Type == 'Gate' && s.ParentSystemId == zoneSystem.Id && s.Assets.any(function (gateSystemAsset) { return gateSystemAsset.Name == "PBB" }) }) }) //that have at least one gate system child
					.orderBy(function (z) { return z.Name });

				if (vm.zones.length == 1) {
					vm.zoneSystem = vm.zones[0];
					vm.widget.WidgetResource.ZoneSystemId = vm.zoneSystem.Id;
				}

				//console.log("vm.zones = %O", vm.zones);
				GetGatesForWidgetZone();

			}
		}


		if (vm.selectGate) {
			//Start watching for zone id changes	
			$scope.$watch("vm.widget.WidgetResource.ZoneSystemId",
				function (newValue, oldValue) {
					if (vm.widget.WidgetResource.ZoneSystemId) {

						//console.log("vm.widget.WidgetResource.ZoneSystemId changed. Now = %O", vm.widget);
						if (newValue != oldValue) {
							vm.widget.WidgetResource.GateSystemId = null;
							SaveWidgetResourceObjectIfChanged();

						}
						GetGatesForWidgetZone();
					}
				});
		}

		function GetGatesForWidgetZone() {
			if (vm.zones && vm.widget.WidgetResource.ZoneSystemId) {

				console.log("Getting the gate (gate system) for the widget zone");


				vm.gates = vm.JBTData
					.Systems
					.where(function (s) { return s.Type == 'Gate' })
					.where(function (s) { return s.ParentSystemId == vm.widget.WidgetResource.ZoneSystemId })
					.where(function (s) { return vm.JBTData.Assets.any(function (a) { return a.ParentSystemId == s.Id && a.Name == 'PBB' }) })
					.orderBy(function (s) { return s.Name });


				if (vm.gates.length == 0) {
					vm.gateSystem = vm.gates[0];
					vm.widget.WidgetResource.GateSystemId = vm.gateSystem.Id;
				}
				SaveWidgetResourceObjectIfChanged();

			}
		}


		if (vm.selectAsset) {
			//Start watching for gate id changes	
			$scope.$watch("vm.widget.WidgetResource.GateSystemId",
				function (newValue, oldValue) {
					if (vm.widget.WidgetResource.GateSystemId) {

						//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

						if (newValue != oldValue) {
							vm.asset = null;
							SaveWidgetResourceObjectIfChanged();
						}
						GetAllAssetsForGate();
					}
				});

			//Start watching for gate id changes	
			$scope.$watch("vm.widget.WidgetResource.AssetId",
				function (newValue, oldValue) {
					if (vm.widget.WidgetResource.AssetId) {

						console.log("vm.widget.WidgetResource.AssetId changed. Now = %O", vm.widget);

						if (newValue != oldValue) {
							vm.previousAssetId = newValue;
							vm.asset = vm.JBTData.Assets.first(function (a) { return a.Id == newValue });
							SaveWidgetResourceObjectIfChanged();
						}
					}
				});
		}


		function GetAllAssetsForGate() {

			console.log("GetAllAssetsForGate() for the gate.");
			dataService.GetJBTData().then(function (jbtData) {
				vm.JBTData = jbtData;
				vm.previousAssetId = vm.widget.WidgetResource.AssetId;
				console.log("Previous AssetId = " + vm.previousAssetId);
				if (vm.widget.WidgetResource.GateSystemId) {
					dataService.GetEntityById("SystemGroups", vm.widget.WidgetResource.GateSystemId).then(function (gateSystem) {
						vm.GateSystem = gateSystem;
					});

				}

				vm.assets = vm.JBTData
					.Assets
					.where(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId })
					.orderBy(function (a) { return a.Name });


				if (vm.previousAssetId) {
					vm.previousAsset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.previousAssetId });
					console.log("Previous asset present = %O", vm.previousAsset);
					vm.asset = vm.assets.first(function (a) { return a.Name == vm.previousAsset.Name });
					vm.widget.WidgetResource.AssetId = vm.asset.Id;
				}

				SaveWidgetResourceObjectIfChanged();

			});


		}




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




		vm.Save = function () {

			console.log("Widget Model to save = %O", vm.widget);

			vm.widget.WidgetResource.$save().then(function () {
				signalR.SignalAllClients("WidgetSettings", vm.widget);
				$state.go("^");

			});
		}

	}

	angular
		.module("app")
		.controller("WidgetSettingsCtrl", [
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
			WidgetSettingsCtrl
		]);



})();
