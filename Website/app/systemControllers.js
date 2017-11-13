
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

		console.log("Settings controller widget = %O", vm.widget);

		//determine the type of settings screen
		switch (vm.widget.WidgetResource.WidgetType.AngularDirectiveName) {

			case 'siteGateSummary':
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
				return userSiteCodes.any(function (sc) { return sc == site.Name })
			});

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
						vm.asset = vm.JBTData.Assets.first(function(a){ return a.Id == newValue});
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
					.orderBy(function(a){return a.Name});


				if (vm.previousAssetId) {
					vm.previousAsset = vm.JBTData.Assets.first(function(a) { return a.Id == vm.previousAssetId });
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


//++blank Controller
(function () {
	"use strict";


	function BlankCtrl($scope, displaySetupService, $interval, dataService) {
		var vm = this;

		//console.log("BlankCtrl invoked");
		vm.displaySetupService = displaySetupService;

		vm.loadingMessage = "Is Initializing for Performance ";
		vm.dataService = dataService;

		function AddDotToMessage() {
			vm.loadingMessage += ".";
		}

		vm.updateInterval = $interval(function () {
			AddDotToMessage();
		}, 500);


		$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.updateInterval);

                });

	}

	angular
			.module("app")
			.controller("BlankCtrl", [
				"$scope",
                "displaySetupService",
				"$interval",
				"dataService",
				BlankCtrl
			]);



})();

//++Login Ctrl
(function () {
	"use strict";


	function LoginCtrl($scope, $rootScope, $state, store, $timeout, securityService, $sce, displaySetupService, utilityService, dataService, $interval, signalR) {
		//console.log("LoginCtrl conroller invoked. xxx");
		var vm = this;

		vm.username = "";
		vm.password = "";

		vm.currentUser = {};



		displaySetupService.suppressAllSiteHeaders = true;

		$timeout(function () {
			displaySetupService.suppressAllSiteHeaders = false;

		}, 20);


		vm.PasswordChangeToken = utilityService.GetQuerystringParameterByName("pwt");

		if (vm.PasswordChangeToken) {
			store.remove('currentUser');
			securityService.currentUser = null;
		}

		//console.log("Password Change Token = " + utilityService.GetQuerystringParameterByName("pwt"));



		var counter = 0;
		vm.ShowLoginPanel = false;
		vm.showRegisterButtons = false;

		vm.LoginWithUsernameAndPassword = function () {
			console.log("Processing login via username and password...");
			vm.loginType = "username";
			securityService.LoginUserWithUsernameAndPassword(vm.username, $sce.trustAsHtml(vm.password));
		}

		vm.RegisterNewUser = function () {
			vm.loginType = "username";
			securityService.RegisterNewUser(vm.username, vm.password, vm.firstName, vm.lastName, vm.companyName, vm.email, vm.telephone);
		}

		vm.LoginUserWithAccessToken = function () {
			console.log("Processing login via access token...");
			if (!securityService.GetCurrentUser() || !securityService.GetCurrentUser().ODataAccessToken) {
				console.log("No current user found in local store. Seting login panel to be visible.");
				vm.ShowLoginPanel = true;
				return;
			}
			console.log("Processing login via access token...");
			securityService.LoginUserWithAccessToken().then(function (data) {
				if (data) {

				}
			});
		}

		vm.SetNewPassword = function () {
			var user = securityService.GetCurrentUser();
			dataService.GetEntityById("iOPSUsers", user.Id).then(function (userToSave) {
				userToSave.PasswordHash = vm.passwordChoice1;
				userToSave.WillEncryptPasswordOnFirstLogin = true;
				userToSave.PasswordChangeLoginToken = null;
				userToSave.PasswordChangeLoginTokenDate = null;

				userToSave.$save().then(function (data) {
					vm.PasswordChangeToken = "";
					securityService.currentUser = data;
					store.set('currentUser', data);
					signalR.SignalAllClientsInGroup("Admin", "iOPSUser", data);
					securityService.LoginUserWithUsernameAndPassword(data.Username, $sce.trustAsHtml(vm.passwordChoice1));
				});

			});


		}


		$rootScope.$on("securityService:accessTokenInvalid", function (event, user) {
			console.log("LoginCtrl accessToken Invalid event received. User = %O", user);
			vm.currentUser = user;
			vm.ShowLoginPanel = true;


		});

		$rootScope.$on("securityService:authenticated", function (event, user) {
			//console.log("LoginCtrl authenticated event received. User = %O", user);
			vm.currentUser = securityService.GetCurrentUser();
			vm.ShowLoginPanel = false;


			if (vm.PasswordChangeToken > "") {
				//When this field is set, the user has been issued an email based login token.
				//They are logged in, but not all the way.
				vm.ShowLoginPanel = true;
				securityService.showMenu = false;
				vm.pwUser = user;
			} else {
				securityService.showMenu = true;
				$state.go("home.app");

			};


		});

		$rootScope.$on("securityService:unauthenticated", function (event, user) {
			console.log("LoginCtrl unauthenticated event received");
			alertify.alert("Username or Password is not valid.");
			vm.username = "";
			vm.password = "";
			vm.currentUser = user;
			vm.isPanelVisible = true;
			$scope.$apply();

		});

		$rootScope.$on("logout", function (event, user) {
			console.log("LoginCtrl logout event received");
			vm.username = "";
			vm.password = "";
			store.remove('currentUser');
			securityService.currentUser = null;
			top.location.href = "/";
			//$state.go('home');
			vm.isPanelVisible = true;
		});

		$rootScope.$on("securityService.invalidAccount", function (event, user) {
			alertify.alert("Username or Password is not valid!");

			if (utilityService.GetQuerystringParameterByName("pwt") == "") {

				console.log("LoginCtrl logout event received");
				vm.username = "";
				vm.password = "";
				store.remove('currentUser');
				securityService.currentUser = null;
				$state.go('home');
				vm.isPanelVisible = true;
			}
		});


		$timeout(function () {
			$(function () {
				var timingValue = 150;
				$('#login-form-link').click(function (e) {
					$("#login-form").delay(timingValue).fadeIn(timingValue);
					$("#register-form").fadeOut(timingValue);
					$('#register-form-link').removeClass('active');
					$(this).addClass('active');
					e.preventDefault();
				});
				$('#register-form-link').click(function (e) {
					$("#register-form").delay(timingValue).fadeIn(timingValue);
					$("#login-form").fadeOut(timingValue);
					$('#login-form-link').removeClass('active');
					$(this).addClass('active');
					e.preventDefault();
				});

			});
			$scope.$apply();


		}, 200);


		vm.LoginUserWithAccessToken = function () {
			//console.log("Processing login via access token...");
			if (vm.PasswordChangeToken == "") {
				if ((!securityService.GetCurrentUser() || !securityService.GetCurrentUser().ODataAccessToken) && vm.PasswordChangeToken == "") {
					console.log("No current user found in local store. Seting login panel to be visible.");
					vm.ShowLoginPanel = true;
					return;
				}
			}
			//console.log("Processing login via password change token...");
			securityService.LoginUserWithAccessToken().then(function (data) {
				if (data && data != "") {
					vm.pwUser = data;
					if (data.PasswordChangeLoginToken && vm.PasswordChangeToken > "") {
						vm.PasswordChangeToken = data.PasswordChangeLoginToken;
						vm.ShowLoginPanel = true;
						//store.remove('currentUser');
						//securityService.currentUser = null;
						securityService.showMenu = false;
						return;
					}


				} else {
					vm.PasswordChangeToken = "";
					store.remove('currentUser');
					securityService.currentUser = null;
					document.location = webRoot;

				}
			});
		}

		vm.LoginUserWithAccessToken();



	}

	angular
			.module("app")
			.controller("LoginCtrl", [
				"$scope",
				"$rootScope",
				"$state",
				'store',
				"$timeout",
				"securityService",
				"$sce",
				"displaySetupService",
				"utilityService",
				"dataService",
				"$interval",
				"signalR",
				LoginCtrl
			]);



})();

//++Menu Controller
(function () {
	"use strict";


	function MenuCtrl($scope, $rootScope, $state, displaySetupService, dataService, $timeout, $q, signalR) {
		var vm = this;
		//console.log("MenuCtrl invoked");
		vm.state = $state;


		//============================================================================
		//If this is not defined, then the menu panel will have no header on it.
		vm.menuTitle = "Options";
		//============================================================================

		vm.showMenu = false;

		$scope.$on("securityService:authenticated",
			function (event, user) {
				console.log("MenuCtrl authenticated event received. User = %O", user);




			});


		$scope.$on("Dashboard", function (event, dashboard) {
			//console.log("Event Dashboard = %O", dashboard);

			if (dashboard.CreatorUserId == Global.User.Id && !dashboard.ParentDashboardId) {
				vm.dashboards = [dashboard].concat(vm.dashboards).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (db) { return db.Ordinal });
			}

		});


		$scope.$on("Dashboard.Deleted", function (event, dashboard) {
			console.log("Event Dashboard.Deleted = %O", dashboard);

			vm.dashboards = vm.dashboards.where(function (db) { return db.Id != dashboard.Id });

		});

		vm.data = dataService;
		vm.noDashboardsMessage = false;


		vm.deleteDashboard = function (dashboard) {


			console.log("dashboard to Delete = %O", dashboard);


			alertify.set({
				labels: {
					ok: "Yes, Delete the Dashboard",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this dashboard? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"



					//Delete all Widgets that are on the dashboard.
					if (dashboard.Id) {
						dataService.GetIOPSCollection("Widgets", "ParentDashboardId", dashboard.Id).then(function (widgets) {


							console.log("Widgets to delete = %O", widgets);

							//Get rid of all of the widgets on the dashboard
							$q.all(
								widgets.select(function (widget) {

									//Get rid of any WidgetGraphTags on the widget
									return dataService.GetIOPSCollection("WidgetGraphTags", "WidgetId", widget.Id).then(function (wgts) {

										if (wgts && wgts.length > 0) {
											return $q.all(
												wgts.select(function (wgt) {
													wgt.Id = -wgt.Id;
													return wgt.$save();
												})
											).then(function () {
												console.log("Delete widget");
												widget.Id = -widget.Id;
												return widget.$save();

											});
										} else {
											widget.Id = -widget.Id;
											return widget.$save();
										}
									});
								}
								)
							).then(function () {

								//Delete the dashboard
								//Need to go get the dashboard firsdt. We have already polluted it at this point. It has extra properties that are not compatible with deleting it.
								dataService.GetEntityById("Dashboards", dashboard.Id).then(function (pureDashboardResourceObject) {
									pureDashboardResourceObject.Id = -pureDashboardResourceObject.Id;
									pureDashboardResourceObject.$save().then(function () {
										signalR.SignalAllClients("Dashboard.Deleted", dashboard);
										toastr.success(dashboard.Name, "Dashboard was deleted!");
									});


								});


							});


						});

					}


				} else {
					// user clicked "no"
					toastr.info(dashboard.Name, "Dashboard was NOT deleted!");
				}
			});

		}



		//////////////////////////////////////////////////
		//Section that provides for dashboard reordering
		//////////////////////////////////////////////////
		var fixHelperModified = function (e, tr) {
			var $originals = tr.children();
			var $helper = tr.clone();
			$helper.children().each(function (index) {
				$(this).width($originals.eq(index).width());
			});
			return $helper;
		},
		updateIndex = function (e, ui) {

			//console.log("---------------------------");
			dataService.GetIOPSCollection("Dashboards", "CreatorUserId", Global.User.Id).then(function (dbDashboards) {
				vm.dbDashboards = dbDashboards.where(function (d) { return !d.ParentDashboardId });
				var currentReorderNumber = 0;
				$('#dashboardsTable tbody tr').each(function () {
					var currentItemId = $(this).attr("itemid");
					currentReorderNumber++;

					if (vm.dbDashboards) {
						vm.dbDashboards.forEach(function (db) {
							if (db.Id == currentItemId && db.Ordinal != currentReorderNumber) {
								db.Ordinal = currentReorderNumber;
								db.$save();
								vm.dashboards.forEach(function (item) {
									if (item.Id == currentItemId) {
										item.Ordinal = currentReorderNumber;
									}
								});
							}

						});

					}

				});

			});


		};


		$timeout(function () {
			$("#dashboardsTable tbody").sortable({
				helper: fixHelperModified,
				stop: updateIndex
			}).disableSelection();
		}, 150);


		//////////////////////////////////////////////////














		function SetupMenu() {
			//====================================================================================================
			//Menu Items Definition
			//Your menu links are automatically picked up from this array.
			//You can get this data from any source.
			//Here it is hard-coded.
			//It can come from a database, file, or you can modify it on the fly in any given context.
			//The links serve as a pathway to a defined ui-router state via the 'state' property.
			//====================================================================================================


			dataService.GetIOPSCollection("Dashboards", "CreatorUserId", Global.User.Id).then(function (dashboardsForUser) {

				if (!dashboardsForUser) {
					vm.noDashboardsMessage = "You do not yet have any dashboards created. To create a dashboard, please click on the New button above.";
				}
				vm.dashboards = dashboardsForUser.where(function (d) { return !d.ParentDashboardId }).orderBy(function (db) { return db.Ordinal });;
				vm.showMenu = true;

				//If there are dashboards defined for the user, transition to the first one.
				if (vm.dashboards && vm.dashboards.length > 0) {
					$state.go("home.app.dashboard", { DashboardId: vm.dashboards.first().Id });
				}


			});


			//Get the sites
			if (dataService.IsReady()) {




				dataService.GetJBTData().then(function (data) {
					if (data && data.Sites) {
						var siteGateSystemMenuItems = data.Sites
							.where(function (site) { return !(site.Name.substr(0, 10) == "Simulation" || !site.Name == "BNA") })
							.select(function (site) {

								return {
									id: "assetMonitorForSite" + site.Name,
									label: site.Name + " Gate Assets",
									description: "",
									state: "home.app.gateMonitorForSite",
									stateParams: { SiteId: site.Id }
								}
							});

						var siteBHSMenuItems = data.Sites
							.where(function (site) {
								return site.Systems.any(function (system) { return system.Type == "BHS" && system.ParentSystemId == null });
							})
							.select(function (site) {

								return {
									id: "assetBHSMonitorForSite" + site.Name,
									label: site.Name + " Scanner Performance and Alarms",
									description: "",
									state: "home.app.bhsAlarms"
								}
							});


						vm.widgetTypesTree = GetWidgetTypesTree(data);


						//console.log("Widget Types Tree = %O", vm.widgetTypesTree);


					}






					//+Build the tree structure for the Widget types navigation and creation
					function GetWidgetTypesTree(jbtData) {
						var rawTree = jbtData.Sites
							.select(function (site) {
								return {
									Id: site.Id,
									Name: site.Name,
									TypeId: 12,
									Type: "Airport",
									Types: jbtData.Systems
										.where(function (system) { return system.SiteId == site.Id && !system.ParentSystemId })
										.select(function (system) {

											var outputObject = {
												Id: system.Id,
												Name: system.Name,
												TypeId: system.SystemType.Id,
												Type: system.SystemType.LongName ? system.SystemType.LongName : system.SystemType.Name,
												Types: GetSystemsForParentSystemId(system.Id, jbtData),
												Assets: jbtData.Assets.where(function (asset) { return asset.ParentSystemId == system.Id })
											}

											if (outputObject.Assets && outputObject.Assets.length > 0) {

												outputObject.Types = outputObject.Types.concat(outputObject.Assets.select(function (asset) {

													return {
														Id: asset.Id,
														Name: asset.Name,
														TypeId: asset.AssetTypeId,
														Type: jbtData.AssetTypes.first(function (t) { return t.Id == asset.AssetTypeId }).Name,
														Types: [],
														Assets: []
													};
												}));
											}

											return outputObject;
										})
								}
							});


						rawTree = CombineSubTypes(rawTree);
						//console.log("Raw Tree = %O", rawTree);


						vm.typePaths = [];

						iterate(rawTree, "Site");

						vm.typePaths = vm.typePaths.distinct().orderBy(function (item) { return item });


						//console.log("vm.typePaths = %O", vm.typePaths);
						//console.log("Starting Menu Item Definitions for widget types");
						arrangeIntoTree(vm.typePaths,
							function (tree) {
								vm.typesTree = tree;
							});
						//console.log("Completed Menu Item Definitions for widget types");


						//console.log("vm.typesTree = %O", vm.typesTree);


					}


					function arrangeIntoTree(paths, cb) {
						var idCounter = 0;
						var tree = [];

						// This example uses the underscore.js library.
						_.each(paths,
							function (path) {

								//console.log("Path = " + path);
								var pathParts = path.split('.');
								pathParts.shift(); // Remove first blank element from the parts array.

								var currentLevel = tree; // initialize currentLevel to root

								_.each(pathParts,
									function (part) {

										// check to see if the path already exists.
										var existingPath = _.findWhere(currentLevel,
										{
											name: part
										});

										if (existingPath) {
											// The path to this item was already in the tree, so don't add it again.
											// Set the current level to this path's children
											currentLevel = existingPath.children;
										} else {

											var foundLevelName = false;
											var widgetTypePath = path.split('.').select(function (levelName) {

												if (!foundLevelName) {
													if (levelName == part) {
														foundLevelName = true;
													}
													return levelName;
												}
												return "";
											})
												.where(function (levelName) { return levelName != ""; })
												.join('.');

											var newPart = {
												id: Date.now() + (idCounter++),
												label: part,
												description: "",
												state: "home.app.widgetTypes",
												stateParams: { Path: widgetTypePath },
												showChildren: false,
												name: part,
												children: []
											}
											//console.log("newPart = %O", newPart);
											currentLevel.push(newPart);
											currentLevel = newPart.children;
										}
									});
							});

						cb(tree);
					}


					function iterate(typesList, stack) {

						typesList.forEach(function (type) {

							if (type.Types.length > 0) {
								iterate(type.Types, stack + '.' + type.Type);
							} else {
								//stack += '.' + type.Type;
								vm.typePaths.push(stack + (type.Type ? ('.' + type.Type) : ''));
							}
						});
					}


					function CombineSubTypes(typesList) {

						return typesList.selectMany(function (type) {
							if (type.Types && type.Types.length > 0) {
								CombineSubTypes(type.Types);
							}
							return type.Types;
						});
					}


					function GetSystemsForParentSystemId(parentId, jbtData) {

						return jbtData.Systems
							.where(function (system) { return system.ParentSystemId == parentId })
							.select(function (system) {
								var outputObject = {
									Id: system.Id,
									Name: system.Name,
									TypeId: system.SystemType.Id,
									Type: system.SystemType.LongName ? system.SystemType.LongName : system.SystemType.Name,
									Types: GetSystemsForParentSystemId(system.Id, jbtData),
									Assets: jbtData.Assets.where(function (asset) { return asset.ParentSystemId == system.Id })
								};

								if (outputObject.Assets && outputObject.Assets.length > 0) {

									outputObject.Types = outputObject.Types.concat(outputObject.Assets.select(function (asset) {

										var assetType = jbtData.AssetTypes.first(function (t) { return t.Id == asset.AssetTypeId });

										return {
											Id: asset.Id,
											Name: asset.Name,
											TypeId: asset.AssetTypeId,
											Type: assetType ? assetType.Name : null,
											Types: [],
											Assets: []
										};
									}));
								}

								return outputObject;
							});
					}


					vm.menu = [

						//{ id: "myreports", label: "Reports", description: "", state: ".reports" },
						{
							id: "admin",
							label: "iOPS Administration",
							description: "",
							state: ".admin",
							showChildren: true,
							hideMenuChoice: !Global.User.AuthorizedActivities.contains("AuthorizedActivity.AdministerSystem"),
							children: [
								{
									id: "sec",
									label: "Security",
									description: "",
									showChildren: false,
									children: [
										{ id: "users", label: "Users", description: "", state: "home.app.users" }
									]
								},
								{
									id: "systemTables",
									label: "System Tables",
									description: "",
									showChildren: false,
									children: [
										{ id: "companies", label: "Companies", description: "", state: "home.app.companies" },
										{ id: "people", label: "People", description: "", state: "home.app.people" },
										//{ id: "assets", label: "Assets", description: "", state: ".assets" },
										{ id: "assetModels", label: "Asset Model Types", description: "", state: "home.app.assetModels" },
										{ id: "tags", label: "Tags", description: "", state: "home.app.tags" },
										//{ id: "sites", label: "Sites", description: "", state: ".sites" },
										{
											id: "widgetTypes",
											label: "Widget Types",
											description: "",
											state: ".widgetTypes",
											children: [
												{ id: "widgetTypesSite", label: "Site", description: "", state: "home.app.widgetTypes", stateParams: { Path: 'Site' }, children: vm.typesTree }
											]
										}
									]
								},
								{
									id: "dataFlow",
									label: "Data Flow Monitoring",
									description: "",
									showChildren: false,
									children: [
										{
											id: "liveTagCellMonitor",
											label: "Overall System Activity",
											description: "",
											state: "home.app.liveObservationIndicatorTableCells"
										},
										{ id: "liveTagDataMonitor", label: "Data Update Stream", description: "", state: "home.app.liveTagDataMonitor" },
									]
								}
							]
						}
					];


					dataService.menu = vm.menu;

					//console.log("Menu structure = %O", vm.menu);


				});
			}



		}


		$scope.$on("dataService.ready",
			function (event, data) {
				//console.log("Setting up menu...");

				SetupMenu();
			});

		if (dataService.IsReady()) {
			console.log("Setting up menu...");
			SetupMenu();
		}



		vm.ActivateState = function (menuItem) {
			if (menuItem.state > "") {
				console.log("Menu State = " + menuItem.state);
				$state.go(menuItem.state, menuItem.stateParams);
			}

		}

		//SetupMenu();

		displaySetupService.SetPanelDimensions();


	}

	angular
			.module("app")
			.controller("MenuCtrl", [
				"$scope",
				"$rootScope",
				"$state",
				"displaySetupService",
				"dataService",
				"$timeout",
				"$q",
				"signalR",
				MenuCtrl
			]);



})();

//++Header Controller
(function () {
	"use strict";


	function HeaderCtrl($scope, displaySetupService, hotkeys, $state, store, securityService) {
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

//++Sites Controller
(function () {
	"use strict";


	function SitesCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("SitesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 10,
			shortName: 10,
			description: 30,
			sitesList: 25,
			address: 25
		};

		vm.buttonPanelWidth = 170;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		function AttachSiteListsToData(data) {
			data.forEach(function (c) {
				c.sitesList = c.SiteCompanies.select(function (sc) {
					return sc.Site.Name;
				}).join(", ");
			});
		}


		function GetData() {
			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.query()
				.$promise
				.then(function (data) {
					AttachSiteListsToData(data);
					console.log("Companies = %O", data);
					vm.companies = data;

					dataService.GetJBTData().then(function (JBTData) {

						//Some of the sites are test ones. This will filter those out.
						vm.sites = JBTData.Sites.where(function (site) { return site.Name.length < 10 }).orderBy(function (s) { return s.Name });
						vm.JBTData = JBTData;
					});

				});

		}

		GetData();






		vm.delete = function (company) {


			console.log("Company to Delete = %O", company);


			if (
				vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id }) ||
				vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id }) ||
				company.SiteCompanies.length > 0) {

				var alertifyMessage = "Company cannot be deleted! ";

				if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id })) {
					alertifyMessage += "It still has Assets associated with it!";
				}

				if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id })) {
					alertifyMessage += "It still has Systems associated with it!";
				}

				if (company.SiteCompanies.length > 0) {
					alertifyMessage += "It still has Companies associated with it!";
				}

				alertify.alert(alertifyMessage, function (e) {
					toastr.success(location.Name, "Company was NOT deleted!");
					return;
				}
				);

				return;

			}

			alertify.set({
				labels: {
					ok: "Yes, Delete the Company",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this company? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					company.Id = -company.Id;
					company.$save().then(function () {
						company.Id = -company.Id;
						signalR.SignalAllClients("Company.Deleted", company);
					});
					toastr.success(location.Name, "Company was deleted!");

				} else {
					// user clicked "no"
					toastr.info(location.Name, "Company was NOT deleted!");
				}
			});

		}

		$scope.$on("Company", function (event, company) {
			console.log("Event Company");

			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.get(company.Id)
				.$promise
				.then(function (data) {

					data.sitesList = data.SiteCompanies.select(function (sc) {
						return sc.Site.Name;
					}).join(", ");


					vm.companies = [data].concat(vm.companies).distinct(function (a, b) { return a.Id == b.Id });

				});

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("SitesCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				SitesCtrl
			]);



})();

//++Companies Controller
(function () {
	"use strict";


	function CompaniesCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("CompaniesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 10,
			shortName: 10,
			description: 30,
			sitesList: 25,
			address: 25
		};

		vm.buttonPanelWidth = 170;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		function AttachSiteListsToData(data) {
			data.forEach(function (c) {
				c.sitesList = c.SiteCompanies.select(function (sc) {
					return sc.Site.Name;
				}).join(", ");
			});
		}


		function GetData() {
			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.query()
				.$promise
				.then(function (data) {
					AttachSiteListsToData(data);
					console.log("Companies = %O", data);
					vm.companies = data;

					dataService.GetJBTData().then(function (JBTData) {

						//Some of the sites are test ones. This will filter those out.
						vm.sites = JBTData.Sites.where(function (site) { return site.Name.length < 10 }).orderBy(function (s) { return s.Name });
						vm.JBTData = JBTData;
					});

				});

		}

		GetData();






		vm.delete = function (company) {


			console.log("Company to Delete = %O", company);


			if (
				vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id }) ||
				vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id }) ||
				company.SiteCompanies.length > 0) {

				var alertifyMessage = "Company cannot be deleted! ";

				if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id })) {
					alertifyMessage += "It still has Assets associated with it!";
				}

				if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id })) {
					alertifyMessage += "It still has Systems associated with it!";
				}

				if (company.SiteCompanies.length > 0) {
					alertifyMessage += "It still has Companies associated with it!";
				}

				alertify.alert(alertifyMessage, function (e) {
					toastr.success(location.Name, "Company was NOT deleted!");
					return;
				}
				);

				return;

			}

			alertify.set({
				labels: {
					ok: "Yes, Delete the Company",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this company? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					company.Id = -company.Id;
					company.$save().then(function () {
						company.Id = -company.Id;
						signalR.SignalAllClients("Company.Deleted", company);
					});
					toastr.success(location.Name, "Company was deleted!");

				} else {
					// user clicked "no"
					toastr.info(location.Name, "Company was NOT deleted!");
				}
			});

		}

		$scope.$on("Company", function (event, company) {
			console.log("Event Company");

			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.get(company.Id)
				.$promise
				.then(function (data) {

					data.sitesList = data.SiteCompanies.select(function (sc) {
						return sc.Site.Name;
					}).join(", ");


					vm.companies = [data].concat(vm.companies).distinct(function (a, b) { return a.Id == b.Id });

				});

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("CompaniesCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				CompaniesCtrl
			]);



})();

//++CompanyEdit Controller
(function () {
	"use strict";


	function CompanyEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.CompanyId < 0) {
			$stateParams.CompanyId = 0;
		}


		dataService.GetJBTData().then(function (data) {
			vm.sites = data.Sites.where(function (site) { return site.Name.length < 10 });
		});


		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.

		//+After we have finished obtaining all of the above collections of data, put together the vm.user DTO.
		if ($stateParams.CompanyId > 0) {
			//Existing User

			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.get($stateParams.CompanyId)
				.$promise
				.then(function (data) {
					vm.company = data;
					vm.company.associatedSiteIds = [];

					vm.company.SiteCompanies.forEach(function (sc) {
						vm.company.associatedSiteIds[sc.Site.Id] = true;
					});
					vm.panelTitle = "iOPS Company: " + vm.company.Name + " - " + vm.company.ShortName;
					vm.panelSubtitle = "Editing Existing Company";

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelDimensions(10);

						vm.showScreen = true;
						console.log("vm = %O", vm);
					});


				});



		} else {
			vm.company = {
				Id: 0
			};
			vm.panelTitle = "New Company";
			vm.panelSubtitle = "Enter a new Company for iOPS";
			vm.showScreen = true;

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
			var associatedSiteIdObjects = [];

			console.log("Company to save = %O", vm.company);

			vm.company.associatedSiteIds.forEach(function (enabled, siteId) {
				associatedSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
			});

			dataService.GetEntityById("Companies", vm.company.Id).then(function (odataCompany) {
				odataCompany.Name = vm.company.Name;
				odataCompany.ShortName = vm.company.ShortName;
				odataCompany.Description = vm.company.Description;
				odataCompany.Address = vm.company.Address;

				odataCompany.$save().then(function (modCompany) {


					$q.all(
							//All Sites that are present in the company already associated set, that are not present in the enabled sites list in the company, as delete promise set.
							vm.company
							.SiteCompanies
							.where(function (sc) { return !vm.company.associatedSiteIds[sc.SiteId] })
							.select(function (scToRemoveFromCompany) {
								return dataService.GetIOPSResource("SiteCompanies")
									.filter("CompanyId", vm.company.Id)
									.filter("SiteId", scToRemoveFromCompany.SiteId)
									.query().$promise.then(function (data) {

										var scToDelete = data.first();
										scToDelete.Id = -scToDelete.Id;

										return scToDelete.$save();
									});


							}),

							$q.all(
								associatedSiteIdObjects
								.where(function (en) {
									return en.Enabled && !vm.company.SiteCompanies.any(function (sc) { return sc.SiteId == en.SiteId });
								})
								.select(function (scToInsert) {

									return dataService.AddEntity("SiteCompanies",
									{
										Id: 0,
										SiteId: scToInsert.SiteId,
										CompanyId: vm.company.Id
									});
								})
							)

					).then(function () {
						signalR.SignalAllClientsInGroup("Admin", "Company", modCompany);
						$state.go("^");
					});

				});


			});

		}

	}

	angular
			.module("app")
			.controller("CompanyEditCtrl", [
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
				CompanyEditCtrl
			]);



})();

//++Assets Controller
(function () {
	"use strict";


	function AssetsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("AssetsCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {
			assetId: 10,
			site: 10,
			company: 7,
			building: 5,
			area: 5,
			gate: 6,
			name: 10,
			dataChange: 60,
			dataChangeCount: 15
		};

		displaySetupService.SetPanelDimensions();

		$scope.$on("dataService.ready", function (event, course) {
			LoadData();
		});

		if (dataService.IsReady) {
			LoadData();
		}


		function LoadData() {
			dataService.GetAssets().then(function (data) {
				vm.assets = data;
			});


		}
		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}

	}

	angular
			.module("app")
			.controller("AssetsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				AssetsCtrl
			]);



})();

//++Tags Controller
(function () {
	"use strict";


	function TagsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("TagsCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			company: 10,
			equipment: 10,
			tagId: 5,
			tagName: 50,
			observationName: 25,
			date: 20,
			value: 80,
			dataChangeCount: 15
		};


		$scope.$on("dataService.ready", function (event, course) {
			LoadData();

		});

		if (dataService.IsReady) {
			LoadData();
		}

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();
		vm.tags = [];



		function LoadData() {
			console.log("Load Data");

			//Set up interval that re-loads the vm tags. They will update that often.
			vm.updateInterval = $interval(function () {
				GetFormattedTags();
			}, 250);

			$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.updateInterval);
                });


			//Load the first time for responsiveness.
			GetFormattedTags();

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions();
			});

		}



		vm.searchText = "";

		function GetFormattedTags() {
			dataService.GetTags().then(function (data) {
				vm.totalChangeCount = 0;
				vm.tags = data
					.where(function (d) { return (vm.searchText == "" || d.Name.toUpperCase().indexOf(vm.searchText.toUpperCase()) > -1) })
            		.orderBy(function (tag) { return tag.Name });
			});

		}


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}

	}

	angular
			.module("app")
			.controller("TagsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				TagsCtrl
			]);



})();

//++LiveTagDataMonitor Controller
(function () {
	"use strict";


	function LiveTagDataMonitorCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout, utilityService) {
		console.log("LiveTagDataMonitorCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			company: 4,
			terminal: 4,
			zone: 4,
			gate: 4,
			equipment: 4,
			tagId: 5,
			tagName: 40,
			observationName: 25,
			date: 20,
			value: 80,
			dataChangeCount: 15
		};


		vm.dataService = dataService;


		$scope.$on("dataService.ready", function (event, course) {
			LoadData();

		});

		if (dataService.IsReady) {
			LoadData();
		}

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();
		vm.tags = [];



		function LoadData() {
			console.log("Load Data");

			//Set up interval that re-loads the vm tags. They will update that often.
			vm.updateInterval = $interval(function () {
				GetFormattedTags();
			}, 1000);

			$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.updateInterval);
                });


			//Load the first time for responsiveness.
			GetFormattedTags();

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions();
			});
		}

		function GetFormattedTags() {
			dataService.GetTags().then(function (data) {
				vm.totalChangeCount = 0;

				var upperSearchText;
				if (vm.searchText) {
					upperSearchText = vm.searchText.toUpperCase();
				}

				vm.tags = data
                    .where(function (t) {
                    	return (t.Metadata.UpdateCountDowns.TenSecond > 0 && !$stateParams.NoDropOff) || $stateParams.NoDropOff;
                    })
					.where(function (t) {
						if (vm.searchText == '' || !vm.searchText) {
							return true;
						}


						return t.TagName.toUpperCase().indexOf(upperSearchText) >= 0 || t.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) >= 0 || t.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) >= 0;
					});


				//console.log("vm.tags = %O", vm.tags);


			});
		}


		vm.scrolledToEnd = function () {
			//console.log("scrolled to end");
		}

	}

	angular
            .module("app")
            .controller("LiveTagDataMonitorCtrl", [
                "$scope",
                "$state",
                "$stateParams",
                "displaySetupService",
                "dataService",
                "signalR",
                "$interval",
                "$timeout",
                "utilityService",
                LiveTagDataMonitorCtrl
            ]);



})();

//++LiveObservationIndicatorTableCells Controller
(function () {
	"use strict";


	function LiveObservationIndicatorTableCellsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout, utilityService) {
		console.log("LiveObservationIndicatorTableCellsCtrl conroller invoked.");
		var vm = this;

		vm.dataService = dataService;

		$scope.$on("dataService.ready", function (event, course) {
			Init();
		});

		if (dataService.IsReady()) {
			Init();
		}

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		function Init() {
			console.log("Load Data");

			vm.messagesPerSecond = dataService.Statistics.SignalR.MessagesPerSecond;

			$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.chartUpdateInterval);
                	$interval.cancel(vm.dataUpdateInterval);
                });


			vm.dataUpdateInterval = $interval(function () {
				GetData();
			}, 100);


			vm.chartUpdateInterval = $interval(function () {
				//console.log("Updating Chart......");
				if (vm.chartSeries) {
					var x = (new Date()).getTime(), // current time
						y = dataService.Statistics.SignalR.MessagesPerSecond;
					vm.chartSeries.addPoint([x, y], true, true);
				}
				GetData();
			}, 1000);

			//Load the first time for responsiveness.
			GetData();

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions();


				////============================================
				////+Smoothie version
				////============================================
				//vm.smoothieSeries = new TimeSeries();
				//vm.smoothieChart = new SmoothieChart({ responsive: true });
				//vm.smoothieChart.addTimeSeries(vm.smoothieSeries, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
				//vm.smoothieChart.streamTo(document.getElementById("chart"), 1000);

				//$interval(function () {
				//	vm.smoothieSeries.append(new Date().getTime(), dataService.Statistics.SignalR.MessagesPerSecond);
				//}, 1000);
				////===========================================
			});
		}

		function GetData() {

			dataService.GetSites().then(function (sites) {
				sites.select(function (site) {

					if (site.Assets) {
						site.Tags = site.Assets.selectMany(function (a) { return a.Tags });
					}
				});
				vm.sites = sites.orderByDescending(function (site) { return site.Tags.length });
				//console.log("vm.sites = %O", vm.sites);

			});



		}




		Highcharts.setOptions({
			global: {
				useUTC: false
			}
		});

		vm.chart = Highcharts.chart('container1', {
			chart: {
				type: 'spline',
				animation: Highcharts.svg, // don't animate in old IE
				marginRight: 10,
				events: {
					load: function () {

						// set up the updating of the chart each second
						vm.chartSeries = this.series[0];
					}
				}
			},
			title: {
				text: 'Observations Per Second'
			},
			xAxis: {
				type: 'datetime',
				tickPixelInterval: 150
			},
			yAxis: {
				title: {
					text: 'Value'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
						Highcharts.numberFormat(this.y, 2);
				}
			},
			legend: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			series: [{
				name: 'Observations Per Sec',
				data: (function () {
					// generate an array of random data
					var data = [],
						time = (new Date()).getTime(),
						i;

					for (i = -250; i <= 0; i += 1) {
						data.push({
							x: time + i * 1000,
							y: 0
						});
					}
					return data;
				}())
			}]
		});





	}

	angular
            .module("app")
            .controller("LiveObservationIndicatorTableCellsCtrl", [
                "$scope",
                "$state",
                "displaySetupService",
                "dataService",
                "signalR",
                "$interval",
                "$timeout",
                "utilityService",
                LiveObservationIndicatorTableCellsCtrl
            ]);



})();

//++Users Controller
(function () {
	"use strict";


	function UsersCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $q) {
		console.log("UsersCtrl conroller invoked.");
		var vm = this;

		vm.columnWidths = {
			name: 10,
			company: 6,
			username: 6,
			email: 15,
			phone: 10,
			privileges: 20,
			accountStatus: 15,
			loggedInStatus: 15,
			sites: 15
		};

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		dataService.GetUsers().then(function (data) {

			AttachListsToUsersData(data);

			vm.users = data;
			console.log("Users for listing = %O", data);
		});



		vm.sendPasswordResetEmail = function (user) {
			dataService.GetEntityById("iOPSUsers", user.Id).then(function (odataUser) {
				odataUser.GeneratePasswordChangeLoginTokenOnSave = 1;
				odataUser.$save().then(function (pwmodUser) {


					console.log("iOPS User with password change token = %O", pwmodUser);

					dataService.GetEntityById("People", pwmodUser.PersonId).then(function (person) {

						dataService.AddEntity("DatabaseMailQueues",
						{
							Subject: "iOPS Pro - Set Password",
							Recipients: person.Email,
							//Body: "https://www.iopspro.com?pwt=" + pwmodUser.PasswordChangeLoginToken
							Body: [
								'JBT Aerotech has been requested to forward you a password reset link. Please click on the link below to set a new password for your account on the iOPSPro asset monitoring system',
								'',
								'<a href="https://www.iOPSPro.com?pwt=' + pwmodUser.PasswordChangeLoginToken + '">Reset my  JBT iOPS Pro password</a>'
								//'<a href="http://localhost/iops?pwt=' + pwmodUser.PasswordChangeLoginToken + '">Reset my Password with Localhost Link</a>',
							].join('<br>')
						});

					});

					signalR.SignalAllClientsInGroup("Admin", "iOPSUser", pwmodUser);
				});
			});


		}



		vm.messageToUser = function (login) {
			var message = prompt("Message to Send:");
			signalR.SignalSpecificClient(login.ClientId, "System.InformationalMessage", message);
		}

		vm.ackAlert = function (login) {
			var message = prompt("Message to Send:");
			signalR.SignalSpecificClient(login.ClientId, "System.AlertMessage", message);
		}

		function AttachListsToUsersData(data) {
			data.forEach(function (u) {

				u.SitesList = u.SiteDataReaders.select(function (sdr) { return sdr.Site.Name }).join(", ");
				u.PrivilegesList = u.UserAuthorizedActivities.select(function (uaa) { return uaa.AuthorizableActivity.Description }).join(", ");


				u.accountStatus = [];
				if (u.Active) {
					u.accountStatus.push("Active");
				} else {
					u.accountStatus.push("Disabled");
				}

				if (u.PasswordChangeLoginToken) {
					u.accountStatus.push("Pending Password Set Via Email");
				}

				u.connectedClients = signalR.connectedClients.where(function (client) { return client.User.User.Username == u.Username });


			});

		}


		vm.deleteUser = function (user) {
			alertify.set({
				labels: {
					ok: "Yes, Delete the User",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});
			var message = 'Are you SURE you want to delete this User? All security settings will also be deleted! ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					//Go and get a "pure" copy of the user before deleting
					//Need the User, UserAuthorizedActivity, and SiteDataReaders collections for the user.
					var collectedData = {};
					$q.all([
						dataService.GetIOPSCollection("UserAuthorizedActivities", "iOPSUserId", user.Id).then(function (aa) {
							//Delete all of the site data reader entries
							return dataService.DeleteEntities(aa);
						}),
						dataService.GetIOPSCollection("SiteDataReaders", "iOPSUserId", user.Id).then(function (sdrEntities) {
							//Delete all of the site data reader entries
							return dataService.DeleteEntities(sdrEntities);
						})
					])
						.then(function () {

							dataService.GetEntityById("iOPSUsers", user.Id).then(function (pureUser) {
								pureUser.Id = -pureUser.Id;
								pureUser.$save().then(function () {
									toastr.success(location.Name, "User was deleted!");
									pureUser.Id = -pureUser.Id;
									signalR.SignalAllClients("iOPSUser.Delete", pureUser);
								});
							});


						});

				} else {
					// user clicked "no"
					toastr.info(location.Name, "User was NOT deleted!");
				}
			});

		}


		vm.scrolledToEnd = function () {
			//console.log("scrolled to end");
		}


		$scope.$on("iOPSUser", function (event, iOPSUser) {
			console.log("Event iOPSUser");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("System.ClientConnectionEstablished", function (event, clientConnection) {
			console.log("Event System.ClientConnectionEstablished");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("System.SignalR.ClientDisconnected", function (event, clientConnection) {
			console.log("Event System.ClientDisconnected");
			dataService.GetUsers().then(function (data) {
				AttachListsToUsersData(data);
				vm.users = data;
			});

		});

		$scope.$on("iOPSUser.Delete", function (event, iOPSUser) {
			console.log("Event iOPSUser.Delete");
			vm.users = vm.users.where(function (u) { return u.Id != iOPSUser.Id });
		});



	}

	angular
			.module("app")
			.controller("UsersCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				"$q",
				UsersCtrl
			]);



})();

//++UserEdit Controller
(function () {
	"use strict";


	function UserEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.UserId < 0) {
			$stateParams.UserId = 0;
		}


		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.
		$q.all([
				//+An expanded user object from the data service.
				//It includes the authorized activities, and the enabled sites that the user can read.
				$stateParams.UserId > 0 ?
					dataService.GetIOPSResource("iOPSUsers")
						.expand("Person")
						.expandPredicate("UserAuthorizedActivities")
							.expand("AuthorizableActivity")
						.finish()
						.expandPredicate("SiteDataReaders")
							.expand("Site")
						.finish()
						.get($stateParams.UserId)
						.$promise.then(function (user) {
							vm.user = user;
							console.log("vm.user = %O", vm.user);
						}) : $q.when(function () {
							vm.user = {
								Id: 0,
								Person: {}
							};
						}),

				//+All of the state by state abbreviations for the address field
				dataService.GetStateAbbreviations().then(function (data) {
					vm.unitedStates = data;
				}),

				//+The locally maintained collection of all of the lookup data
				dataService.GetJBTData().then(function (JBTData) {
					vm.JBTData = JBTData;

					//Some of the sites are test ones. This will filter those out.
					vm.sites = JBTData.Sites.where(function (site) { return site.Name.length < 10 });
				}),


				//+The dictionary of authorizable activities
				dataService.GetAuthorizableActivities().then(function (data) {
					vm.authorizableActivities = data;
				})

		]
		).then(function () {


			//+After we have finished obtaining all of the above collections of data, put together the vm.user DTO.
			if ($stateParams.UserId > 0) {
				//Existing User


				vm.panelTitle = "Username: " + vm.user.Username + " - " + vm.user.Person.GivenName + " " + vm.user.Person.FamilyName;
				vm.panelSubtitle = "Editing Existing User";

				//Set the state id for the user address. This is needed by id for the selection picker dropdown.
				vm.user.Person.StateId = !vm.user.Person.State ? 1 : vm.unitedStates.first(function (s) { return s.Abbreviation == vm.user.Person.State }).Id;

				//Setup the user.authorizedActivityIds array based on the authorizations they now have. This will make the buttons light up.


				vm.user.authorizedActivityIds = [];
				vm.user.UserAuthorizedActivities.forEach(function (a) {
					vm.user.authorizedActivityIds[a.AuthorizableActivity.Id] = true;
				});


				//Setup the user.enabledSiteIds array based on the sites they now have. This will make the buttons light up.
				vm.user.enabledSiteIds = [];

				vm.user.SiteDataReaders.forEach(function (sdr) {
					vm.user.enabledSiteIds[sdr.Site.Id] = true;
				});


				$scope.$$postDigest(function () {
					displaySetupService.SetPanelDimensions(10);

					utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
					vm.showScreen = true;
					console.log("vm = %O", vm);
				});

				$scope.$watch("vm.user.Person.Email",
					function (newValue, oldValue) {
						if (newValue.indexOf("@") > 0) {
							console.log("New email detected");
						}


					});


			} else {
				vm.user = {
					Id: 0,
					Person: {}
				};

				vm.user.authorizedActivityIds = [];

				vm.authorizableActivities.forEach(function (aa) {
					vm.user.authorizedActivityIds[aa.Id] = false;
				});

				//Setup the user.enabledSiteIds array from the sites list.
				vm.user.enabledSiteIds = [];

				vm.sites.forEach(function (s) {
					vm.user.enabledSiteIds[s.Id] = false;
				});


				vm.panelTitle = "New User";
				vm.panelSubtitle = "Enter a new User for iOPS";
				vm.showScreen = true;

				$scope.$$postDigest(function () {
					displaySetupService.SetPanelDimensions(10);

					utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
					vm.showScreen = true;
					console.log("vm = %O", vm);
				});

				$scope.$watch("vm.user.Person.Email",
									function (newValue, oldValue) {
										if (newValue) {
											if (newValue.indexOf("@") > 0) {
												console.log("New email detected");
												dataService.GetIOPSCollection("People", "Email", vm.user.Person.Email).then(function (odataPeople) {
													var odataPersonByEmailLookup = odataPeople.first();
													if (odataPersonByEmailLookup) {
														odataPersonByEmailLookup.StateId = !odataPersonByEmailLookup.State ? 1 : vm.unitedStates.first(function (s) { return s.Abbreviation == odataPersonByEmailLookup.State }).Id;
														vm.user.Person = odataPersonByEmailLookup;
														utilityService.SetupSelectpickerDropdown($scope, "vm.user.Person.StateId");
													}
												});


											}
										}


									});
			}



		});





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



			var person;
			var iOPSUser;

			if (!vm.user.Person.Email || !vm.user.Person.Email > "") {
				alertify.alert("User MUST have an email address",
					function (e) {
						return;
					});

			}


			vm.enabledSiteIdObjects = [];


			if (!vm.user.enabledSiteIds) {
				vm.user.enabledSiteIds = [];
			}



			vm.user.enabledSiteIds.forEach(function (enabled, siteId) {
				vm.enabledSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
			});

			vm.authorizedActivityIdObjects = [];
			vm.user.authorizedActivityIds.forEach(function (enabled, activityId) {
				vm.authorizedActivityIdObjects.push({ AuthorizableActivityId: activityId, Enabled: enabled });
			});


			console.log("enabledSiteIdObjects = %O", vm.enabledSiteIdObjects);



			//Get the person with the same email address, or add one.
			dataService.GetIOPSCollection("People", "Email", vm.user.Person.Email).then(function (odataPeople) {

				var odataPerson = odataPeople.first();

				if (odataPerson) {

					//update the properties of the person who was already there.

					odataPerson.GivenName = vm.user.Person.GivenName;
					odataPerson.MiddleName = vm.user.Person.MiddleName;
					odataPerson.FamilyName = vm.user.Person.FamilyName;
					odataPerson.StreetAddress1 = vm.user.Person.StreetAddress1;
					odataPerson.StreetAddress2 = vm.user.Person.StreetAddress2;
					odataPerson.Phone = vm.user.Person.Phone;
					odataPerson.Email = vm.user.Person.Email;
					odataPerson.Title = vm.user.Person.Title;
					odataPerson.City = vm.user.Person.City;
					odataPerson.State = vm.user.Person.State;
					odataPerson.ZipCode = vm.user.Person.ZipCode;
					return odataPerson.$save();

				} else {
					//Add a new person who was not already there by email address.
					return dataService.AddEntity("People",
					{
						GivenName: vm.user.Person.GivenName,
						MiddleName: vm.user.Person.MiddleName,
						FamilyName: vm.user.Person.FamilyName,
						StreetAddress1: vm.user.Person.StreetAddress1,
						StreetAddress2: vm.user.Person.StreetAddress2,
						Phone: vm.user.Person.Phone,
						Email: vm.user.Person.Email,
						Title: vm.user.Person.Title,
						City: vm.user.Person.City,
						State: vm.user.Person.State,
						ZipCode: vm.user.Person.ZipCode
					});

				}
			}).then(function (person) {

				vm.odataPerson = person;
				console.log("Person who was saved = %O", person);
				//Go and get a pure user object or create one if this is a new user with an Id of 0
				(vm.user.Id > 0
					? dataService.GetEntityById("iOPSUsers", vm.user.Id).then(function (u) {
						u.Username = vm.user.Username;
						u.Active = true;
						return u.$save();
					})
					: dataService.AddEntity("iOPSUsers", { Id: 0, Username: vm.user.Username, PersonId: vm.odataPerson.Id, Active: true })).then(function (user) {
						vm.odataUser = user;
						vm.user.Id = vm.odataUser.Id;
						vm.odataUser.Username = vm.user.Username;

						SaveRestOfRecord();
					});

			});





		}

		function SaveRestOfRecord() {
			return $q.all([

			//+Promise to reconcile the site data readers items from the DTO enabledSiteIds
			vm.user.SiteDataReaders
			? $q.all(
				//All Sites that are present in the users already enabled set, that are not present in the enabled sites list in the userDTO, as delete promise set.
				vm.user
				.SiteDataReaders
				.where(function (sdr) { return !vm.user.enabledSiteIds[sdr.SiteId] })
				.select(function (sdrToRemoveFromUser) {
					return dataService.GetIOPSResource("SiteDataReaders")
						.filter("iOPSUserId", vm.user.Id)
						.filter("SiteId", sdrToRemoveFromUser.SiteId)
						.query().$promise.then(function (data) {

							var sdrToDelete = data.first();
							sdrToDelete.Id = -sdrToDelete.Id;

							return sdrToDelete.$save();
						});


				})
			)
			: $q.when(true),

			$q.all(
				vm.enabledSiteIdObjects
				.where(function (en) {
					return en.Enabled && !vm.user.SiteDataReaders.any(function (sdr) { return sdr.SiteId == en.SiteId })
				})
				.select(function (sdrToInsert) {

					return dataService.AddEntity("SiteDataReaders",
					{
						Id: 0,
						SiteId: sdrToInsert.SiteId,
						iOPSUserId: vm.user.Id
					});
				})
			),


			//+Promise to reconcile the authorized activities
			$q.all(
				//Deletions.
				vm.user.UserAuthorizedActivities
				? vm.user
				.UserAuthorizedActivities
				.where(function (uaa) { return !vm.user.authorizedActivityIds[uaa.AuthorizableActivityId] })
				.select(function (aaToRemoveFromUser) {
					return dataService.GetIOPSResource("UserAuthorizedActivities")
						.filter("iOPSUserId", vm.user.Id)
						.filter("AuthorizableActivityId", aaToRemoveFromUser.AuthorizableActivityId)
						.query().$promise.then(function (data) {

							var aaToDelete = data.first();
							aaToDelete.Id = -aaToDelete.Id;

							return aaToDelete.$save();
						});


				})
				: $q.when(true)
			),


			//Insertions
			$q.all(

				vm.authorizedActivityIdObjects
					.where(function (aao) { return aao.Enabled && vm.user.UserAuthorizedActivities && !vm.user.UserAuthorizedActivities.any(function (uaa) { return uaa.AuthorizableActivityId == aao.AuthorizableActivityId }) })
					.select(function (aaToInsert) {

						return dataService.AddEntity("UserAuthorizedActivities",
						{
							Id: 0,
							AuthorizableActivityId: aaToInsert.AuthorizableActivityId,
							iOPSUserId: vm.user.Id
						});
					})
			)

			]).then(function () {
				signalR.SignalAllClientsInGroup("Admin", "iOPSUser", vm.odataUser);
				$state.go("^");

			});
		}
	}

	angular
			.module("app")
			.controller("UserEditCtrl", [
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
				UserEditCtrl
			]);



})();

//++AssetModelEdit Controller
(function () {
	"use strict";


	function AssetModelEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.AssetModelId < 0) {
			$stateParams.AssetModelId = 0;
		}




		if ($stateParams.AssetModelId > 0) {
			//Existing Asset Model

			dataService.GetEntityById("AssetModels", $stateParams.AssetModelId)
				.then(function (data) {
					vm.assetModel = data;

					vm.panelTitle = "iOPS Asset Model Type: " + vm.assetModel.Name + " - ";
					vm.panelSubtitle = "Editing Existing Asset Model Type";

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelDimensions(10);

						vm.showScreen = true;
						console.log("vm = %O", vm);
					});


				});



		} else {
			vm.assetModel = {
				Id: 0
			};
			vm.panelTitle = "New Asset Model Type";
			vm.panelSubtitle = "Enter a new Asset Model Type for iOPS";
			vm.showScreen = true;

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

			console.log("Asset Model to save = %O", vm.assetModel);

			(vm.assetModel.Id > 0
				? dataService.GetEntityById("AssetModels", vm.assetModel.Id).then(function (odataAssetModel) {
					odataAssetModel.Name = vm.assetModel.Name;
					odataAssetModel.Size = vm.assetModel.Size;
					odataAssetModel.Description = vm.assetModel.Description;
					odataAssetModel.GraphicsPath = vm.assetModel.GraphicsPath;

					return odataAssetModel.$save();


				})
				: dataService.AddEntity("AssetModels", vm.assetModel)).then(function (assetModel) {

					//At this point we have either added or updated an AssetModel entity

					signalR.SignalAllClientsInGroup("Admin", "AssetModel", assetModel);
					$state.go("^");

				});
		}




	}

	angular
			.module("app")
			.controller("AssetModelEditCtrl", [
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
				AssetModelEditCtrl
			]);



})();

//++Asset Models Controller
(function () {
	"use strict";


	function AssetModelsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $q) {
		console.log("AssetModelsCtrl conroller invoked.");
		var vm = this;

		vm.columnWidths = {
			name: 20,
			description: 50,
			graphicsPath: 30

		};

		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		vm.assetModels = dataService.GetCache().assetModels;
		console.log("assetModels = %O", vm.assetModels);

		$scope.$on("AssetModel", function (event, assetModel) {

			console.log("AssetModel change. AssetModel = %O", assetModel);
			vm.assetModels = [assetModel].concat(vm.assetModels).distinct(function (a, b) { return a.Id == b.Id });

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("AssetModelsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				"$q",
				AssetModelsCtrl
			]);



})();

//++WidgetTypeEdit Controller
(function () {
	"use strict";


	function WidgetTypeEditCtrl($state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;
		vm.showScreen = false;


		uibButtonConfig.activeClass = 'radio-active';
		vm.initialHeights = mx.range(3, 31).toArray();
		vm.initialWidths = mx.range(3, 31).toArray();
		vm.Path = $stateParams.Path;
		vm.panelHeadingSubtitle = "For widget that is related to " + $stateParams.Path.split(".").join(" --> ") + "s";

		if ($stateParams.WidgetTypeId > 0) {
			//Existing widget type

			dataService.GetEntityById("WidgetTypes", $stateParams.WidgetTypeId).then(function (wt) {
				vm.widgetType = wt;
				vm.originalWidgetType = angular.copy(wt);
				vm.panelTitle = "" + vm.widgetType.DataTypeCode + " - " + vm.widgetType.Name;


				vm.isAvailableToAdmin = vm.widgetType.IsAvailableToAdmin ? 1 : 0;
				vm.isAvailableToAll = vm.widgetType.IsAvailableToAll ? 1 : 0;
				vm.showScreen = true;
				console.log("vm.widgetType = %O", vm.widgetType);

			});



		} else {
			vm.widgetType = {
				Id: 0,
				CategoryPath: vm.Path
			};
			vm.panelTitle = "New Widget Type";
			vm.showScreen = true;
			console.log("vm.widgetType = %O", vm.widgetType);

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
			vm.widgetType.IsAvailableToAdmin = vm.isAvailableToAdmin == 1 ? true : false;
			vm.widgetType.IsAvailableToAll = vm.isAvailableToAll == 1 ? true : false;
			vm.widgetType.IsHiddenSystemType = vm.isHiddenSystemType == 1 ? true : false;
			(vm.widgetType.Id > 0 ? vm.widgetType.$save() : dataService.AddEntity("WidgetTypes", vm.widgetType)).then(function (data) {
				signalR.SignalAllClientsInGroup("Admin", "WidgetType", data);
				$state.go("^");
			});
		}

	}

	angular
			.module("app")
			.controller("WidgetTypeEditCtrl", [
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
				WidgetTypeEditCtrl
			]);



})();

//++WidgetTypes Controller
(function () {
	"use strict";


	function WidgetTypesCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("WidgetTypesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 15,
			description: 25,
			initialHeight: 8,
			initialWidth: 8,
			creationDate: 25,
			angularDirectiveName: 20,
			adminStatus: 10,
			allStatus: 10,
			hiddenStatus: 10
		};

		vm.buttonPanelWidth = 20;
		vm.panelTitle = "iOPS System Widget Type Registration";
		if ($stateParams.Path) {
			vm.Path = $stateParams.Path;
			vm.panelSubtitle = "For widgets that are related to " + $stateParams.Path.split(".").join(" --> ") + "s";
		}

		console.log("Path Parameter = " + $stateParams.Path);


		vm.state = $state;
		displaySetupService.SetPanelDimensions();
		vm.showPanel = false;

		function GetData() {

			if ($stateParams.Path) {
				dataService.GetIOPSCollection("WidgetTypes", "CategoryPath", $stateParams.Path).then(function (data) {
					vm.widgetTypes = data.orderBy(function (w) { return w.DevelopmentPriority });

					vm.showPanel = true;
				});


			}



		}


		GetData();


		//////////////////////////////////////////////////
		//Section that provides for development priority reordering
		//////////////////////////////////////////////////
		var fixHelperModified = function (e, tr) {
			var $originals = tr.children();
			var $helper = tr.clone();
			$helper.children().each(function (index) {
				$(this).width($originals.eq(index).width());
			});
			return $helper;
		},
		updateIndex = function (e, ui) {

			//console.log("---------------------------");
			dataService.GetIOPSCollection("WidgetTypes").then(function (dbWt) {
				vm.dbWt = dbWt;
				var currentReorderNumber = 0;
				$('#widgetTypesTable tbody tr').each(function () {
					var currentItemId = $(this).attr("itemid");
					currentReorderNumber++;

					if (vm.dbWt) {
						vm.dbWt.forEach(function (db) {
							if (db.Id == currentItemId && db.Ordinal != currentReorderNumber) {
								db.DevelopmentPriority = currentReorderNumber;
								db.$save();
								vm.widgetTypes.forEach(function (item) {
									if (item.Id == currentItemId) {
										item.DevelopmentPriority = currentReorderNumber;
									}
								});
							}

						});

					}

				});

			});


		};


		$timeout(function () {
			$("#widgetTypesTable tbody").sortable({
				helper: fixHelperModified,
				stop: updateIndex
			}).disableSelection();
		}, 150);


		//////////////////////////////////////////////////



		//vm.delete = function (widgetType) {

		//    //Go and get a "pure" copy of the user before deleting
		//    dataService.GetWidgetType(widgetType.Id).then(function (widgetTypeFromDatabase) {
		//        alertify.set({
		//            labels: {
		//                ok: "Yes, Delete the Widget Type",
		//                cancel: "Cancel, I don't want to do this"
		//            },
		//            buttonFocus: "cancel"
		//        });
		//        var message = 'Are you SURE you want to delete this Widget Type?';

		//        alertify.confirm(message, function (e) {
		//            if (e) {
		//                // user clicked "ok"
		//                widgetTypeFromDatabase.$delete().then(function () {
		//                    toastr.success(location.Name, "Widget Type was deleted!");
		//                });




		//            } else {
		//                // user clicked "no"
		//                toastr.info(location.Name, "Widget Type was NOT deleted!");
		//            }
		//        });
		//    });

		//}


		$scope.$on("WidgetType", function (event, wt) {
			console.log("Event iOPSUser");
			vm.widgetTypes = [wt].concat(vm.widgetTypes).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (wt) { return wt.DevelopmentPriority });

		});

		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}


	}

	angular
			.module("app")
			.controller("WidgetTypesCtrl", [
				"$scope",
				"$state",
				"$stateParams",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				"$timeout",
				WidgetTypesCtrl
			]);



})();

//++BNAMonitorDisplay Controller
(function () {
	"use strict";


	function BNAMonitorDisplayCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("BNAMonitorDisplayCtrl conroller invoked.");
		var vm = this;



		vm.buttonPanelWidth = 70;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();



		function LoadData() {

			dataService.GetLastXBHSAlarms(50).then(function (data) {
				vm.alarms = data;
			});
		}


		LoadData();

		vm.loopInterval = $interval(function () {
			LoadData();

		},
			1000);



		$scope.$on("$destroy",
                function () {
                	$interval.cancel(vm.loopInterval);
                });



		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}




	}

	angular
			.module("app")
			.controller("BNAMonitorDisplayCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
				"$interval",
				BNAMonitorDisplayCtrl
			]);



})();

//++People Controller
(function () {
	"use strict";


	function PeopleCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("PeopleCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 10,
			email: 10,
			phone: 30,
			title: 25,
			company: 25,
			associatedSites: 20
		};

		vm.buttonPanelWidth = 170;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		//function AttachSiteListsToData(data) {
		//	data.forEach(function (c) {
		//		c.siteList = c..select(function (sc) {
		//			return sc.Site.Name;
		//		}).join(", ");
		//	});
		//}


		function GetData() {
			dataService.GetIOPSResource("People")
				.expandPredicate("iOPSUsers")
					.expandPredicate("SiteDataReaders")
						.expand("Site")
					.finish()
				.finish()
				.orderBy("FamilyName")
				.query()
				.$promise
				.then(function (data) {
					console.log("People = %O", data);
					vm.people = data;


				});

		}

		GetData();






		vm.delete = function (person) {


			console.log("Person to Delete = %O", person);



			alertify.set({
				labels: {
					ok: "Yes, Delete the Person",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this person? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					person.Id = -person.Id;
					person.$save().then(function () {
						person.Id = -person.Id;
						signalR.SignalAllClients("Person.Deleted", person);
					});
					toastr.success(location.Name, "Person was deleted!");

				} else {
					// user clicked "no"
					toastr.info(location.Name, "Person was NOT deleted!");
				}
			});

		}

		$scope.$on("Person", function (event, person) {
			console.log("Event Person");

			dataService.GetIOPSResource("People")
				.expandPredicate("iOPSUsers")
					.expandPredicate("SiteDataReaders")
						.expand("Site")
					.finish()
				.finish()
				.get(person.Id)
				.$promise
				.then(function (data) {

					vm.people = [data].concat(vm.people).distinct(function (a, b) { return a.Id == b.Id });

				});

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("PeopleCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				PeopleCtrl
			]);



})();

//++PersonEdit Controller
(function () {
	"use strict";


	function PersonEditCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {
		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.CompanyId < 0) {
			$stateParams.CompanyId = 0;
		}




		//+Simultaneously and asyncronously get all of the data collections we need to edit the user object.

		//+After we have finished obtaining all of the above collections of data, put together the vm.person object
		$q.all([

			//+All of the state by state abbreviations for the address field
			dataService.GetStateAbbreviations().then(function (data) {
				vm.unitedStates = data;
			}),

			//+The Person
			$stateParams.PersonId > 0 ?
				dataService.GetIOPSResource("People")
				.get($stateParams.PersonId)
				.$promise
				.then(function (data) {

					console.log("Person to edit = %O", data);
					vm.person = data;

				}) : $q.when(true)

		]).then(function () {


			if (vm.person) {
				vm.panelTitle = "iOPS Person: ";
				vm.panelSubtitle = "Editing Existing Person";
			} else {


				vm.person = { Id: 0 };
				vm.panelTitle = "iOPS Person: ";
				vm.panelSubtitle = "Adding New Person";


			}

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions(10);

				vm.showScreen = true;
				console.log("vm = %O", vm);
			});

		});



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

			dataService.GetEntityById("People", vm.person.Id).then(function (odataPerson) {
				odataPerson.FamilyName = vm.person.FamilyName;
				odataPerson.GivenName = vm.person.GivenName;
				odataPerson.MiddleName = vm.person.MiddleName;
				odataPerson.StreetAddress1 = vm.person.StreetAddress1;
				odataPerson.StreetAddress2 = vm.person.StreetAddress2;
				odataPerson.CountryId = vm.person.CountryId;
				odataPerson.Phone = vm.person.Phone;
				odataPerson.Email = vm.person.Email;
				odataPerson.Title = vm.person.Title;
				odataPerson.City = vm.person.City;
				odataPerson.State = vm.person.State;
				odataPerson.ZipCode = vm.person.ZipCode;

				odataPerson.$save().then(function (modPerson) {



					signalR.SignalAllClientsInGroup("Admin", "Person", modPerson);
					$state.go("^");
				});

			});



		}

	}

	angular
			.module("app")
			.controller("PersonEditCtrl", [
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
				PersonEditCtrl
			]);



})();

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

//++EditDashboard Controller
(function () {
	"use strict";


	function EditDashboardCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("EditDashboardCtrl invoked");


		var vm = this;

		vm.state = $state;




		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.DashboardId < 0) {
			$stateParams.DashboardId = 0;
		}

		($stateParams.DashboardId > 0
			? dataService.GetEntityById("Dashboards", $stateParams.DashboardId)
			: $q.when({ CreatorUserId: Global.User.Id })).then(function (dashboard) {


				dataService.GetIOPSCollection("DashboardTimeScopes").then(function (data) {
					vm.DashboardTimeScopes = data;
					vm.dashboard = dashboard;
					if (vm.dashboard.CustomStartDate) {
						vm.dashboard.CustomStartDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomStartDate);
					}
					if (vm.dashboard.CustomEndDate) {
						vm.dashboard.CustomEndDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomEndDate);
					}
					vm.endDate = utilityService.GetUTCQueryDate(vm.dashboard.CustomEndDate);
					vm.showScreen = true;
					if (vm.dashboard.CustomStartDate || vm.dashboard.CustomEndDate) {
						vm.dashboard.TimeScopeId = null;
					}

					console.log("dashboard = %O", vm.dashboard);
				});


			});



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

		$scope.$watch("vm.dashboard.TimeScopeId",
					function (newValue, oldValue) {
						if (newValue > 0) {
							vm.dashboard.CustomStartDate = null;
							vm.dashboard.CustomEndDate = null;

						}

					}
		);



		$scope.$watch("vm.dashboard.CustomStartDate",
					function (newValue, oldValue) {
						if (vm.dashboard && vm.dashboard.CustomStartDate && vm.dashboard.CustomEndDate) {
							vm.dashboard.TimeScopeId = null;
						}

					}
		);

		$scope.$watch("vm.dashboard.CustomEndDate",
					function (newValue, oldValue) {
						if (vm.dashboard && vm.dashboard.CustomStartDate && vm.dashboard.CustomEndDate) {
							vm.dashboard.TimeScopeId = null;
						}

					}
		);


		vm.Save = function () {



			if (vm.dashboard.TimeScopeId && vm.dashboard.TimeScopeId > 0) {
				vm.dashboard.CustomStartDate = null;
				vm.dashboard.CustomEndDate = null;
			}

			if (vm.dashboard.CustomStartDate) {
				vm.dashboard.CustomStartDate = utilityService.GetNonUTCQueryDate(vm.dashboard.CustomStartDate);
			}

			if (vm.dashboard.CustomEndDate) {
				vm.dashboard.CustomEndDate = utilityService.GetNonUTCQueryDate(vm.dashboard.CustomEndDate);
			}

			if (!vm.dashboard.TimeScopeId && !vm.dashboard.CustomStartDate && !vm.dashboard.CustomEndDate) {
				vm.dashboard.TimeScopeId = 6;
			}

			console.log("vm.dashboard = %O", vm.dashboard);

			($stateParams.DashboardId > 0 ? vm.dashboard.$save() : dataService.AddEntity("Dashboards", vm.dashboard))
				.then(function (data) {

					dataService.GetExpandedDashboardById(data.Id).then(function (modifiedExpandedDashboard) {
						signalR.SignalAllClients("Dashboard", modifiedExpandedDashboard);
						$state.go("^");
					});

				});
		}

	}

	angular
			.module("app")
			.controller("EditDashboardCtrl", [
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
				EditDashboardCtrl
			]);



})();

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


		if ($stateParams.DashboardId < 0) {
			$stateParams.DashboardId = 0;
		}



		function GetData() {

			//Get the widget types already on the dashboard:
			dataService.GetIOPSCollection("Widgets", "ParentDashboardId", +$stateParams.DashboardId)
				.then(function (widgetsOnDashboard) {
					vm.widgetsOnDashboard = widgetsOnDashboard;
					console.log("widgetsOnDashboard = %O", widgetsOnDashboard);

					dataService.GetIOPSCollection("WidgetTypes").then(function (wt) {
						vm.widgetTypes = wt
							.where(function (t) { return t.IsAvailableToAll || (securityService.UserHasAuthorizedActivity("AuthorizedActivity.AdministerSystem") && t.IsAvailableToAdmin); })
							.orderBy(function (t) { return t.CategoryPath })
							.thenBy(function (wt) { return wt.Name });

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

//++EditWidget Controller
(function () {
	"use strict";


	function EditWidgetCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("EditWidgetCtrl invoked");


		var vm = this;

		vm.state = $state;

		//Column proportions for the view
		vm.bootstrapLabelColumns = 4;
		vm.bootstrapInputColumns = 8;

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';
		if ($stateParams.DashboardId < 0) {
			$stateParams.DashboardId = 0;
		}

		dataService.GetEntityById("Widgets", $stateParams.WidgetId).then(function (data) {

			vm.widget = data;
			vm.showScreen = true;
			console.log("widget = %O", vm.widget);
		});





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
			vm.widget.$save().then(function (data) {
				signalR.SignalAllClients("Widget", data);
				$state.go("^");
				$timeout(function () {
					$state.go("^");
					$timeout(function () {
						$state.go("home.app.dashboard", { DashboardId: $stateParams.DashboardId });

					},
						10);

				},
					10);
			});
		}

	}

	angular
			.module("app")
			.controller("EditWidgetCtrl", [
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
				EditWidgetCtrl
			]);



})();

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

//++GraphicsCatalog Controller
(function () {
	"use strict";


	function GraphicsCatalogCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("GraphicsCatalogCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			company: 10,
			equipment: 10,
			tagId: 5,
			tagName: 50,
			observationName: 25,
			date: 20,
			value: 80,
			dataChangeCount: 15
		};



		vm.buttonPanelWidth = 20;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		console.log("Load Data");


		dataService.GetIOPSResource("Sites")
			.expandPredicate("SystemGroups")
				.expand()
			.finish()


		$scope.$$postDigest(function () {
			displaySetupService.SetPanelDimensions();
		});




		vm.searchText = "";

		function GetFormattedTags() {
			dataService.GetTags().then(function (data) {
				vm.totalChangeCount = 0;
				vm.tags = data
					.where(function (d) { return (vm.searchText == "" || d.Name.toUpperCase().indexOf(vm.searchText.toUpperCase()) > -1) })
            		.orderBy(function (tag) { return tag.Name });
			});

		}


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}

	}

	angular
			.module("app")
			.controller("GraphicsCatalogCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				GraphicsCatalogCtrl
			]);



})();





