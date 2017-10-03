(function () {
	"use strict";


	function MenuCtrl($scope, $rootScope, $state, displaySetupService, dataService, $timeout, $q, signalR) {
		var vm = this;
		console.log("MenuCtrl invoked");
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
			console.log("Event Dashboard = %O", dashboard);

			if (dashboard.CreatorUserId == Global.User.Id) {
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
					dataService.GetIOPSCollection("Widgets", "ParentDashboardId", dashboard.Id).then(function (widgets) {

						$q.all(
							widgets.select(function (widget) {
								widget.Id = -widget.Id;
								return widget.$save();
							})
						).then(function () {

							//Delete the dashboard
							dashboard.Id = -dashboard.Id;
							dashboard.$save().then(function () {
								dashboard.Id = -dashboard.Id;
								signalR.SignalAllClients("Dashboard.Deleted", dashboard);
							});
							toastr.success(dashboard.Name, "Dashboard was deleted!");

						});


					});


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
				vm.dbDashboards = dbDashboards;
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
				vm.dashboards = dashboardsForUser.orderBy(function (db) { return db.Ordinal });;
				vm.showMenu = true;


				//If there are dashboards defined for the user, transition to the first one.
				if (vm.dashboards && vm.dashboards.length > 0) {
					$state.go("home.app.dashboard", { DashboardId: vm.dashboards.first().Id });
					$timeout(function () {
						//$state.go("home.app.dashboard", { DashboardId: vm.dashboards.first().Id });
					}, 10);
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
									state: ".gateMonitorForSite({ SiteId: " + site.Id + "})"
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
									state: ".bhsAlarms"
								}
							});


						vm.widgetTypesTree = GetWidgetTypesTree(data);


						console.log("Widget Types Tree = %O", vm.widgetTypesTree);


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
						console.log("Raw Tree = %O", rawTree);


						vm.typePaths = [];

						iterate(rawTree, "Site");

						vm.typePaths = vm.typePaths.distinct().orderBy(function (item) { return item });


						console.log("vm.typePaths = %O", vm.typePaths);
						console.log("Starting Menu Item Definitions for widget types");
						arrangeIntoTree(vm.typePaths,
							function (tree) {
								vm.typesTree = tree;
							});
						console.log("Completed Menu Item Definitions for widget types");


						console.log("vm.typesTree = %O", vm.typesTree);


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
												state: ".widgetTypes",
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
										{ id: "users", label: "Users", description: "", state: ".users" }
									]
								},
								{
									id: "systemTables",
									label: "System Tables",
									description: "",
									showChildren: false,
									children: [
										{ id: "companies", label: "Companies", description: "", state: ".companies" },
										{ id: "people", label: "People", description: "", state: ".people" },
										//{ id: "assets", label: "Assets", description: "", state: ".assets" },
										{ id: "tags", label: "Tags", description: "", state: ".tags" },
										//{ id: "sites", label: "Sites", description: "", state: ".sites" },
										{
											id: "widgetTypes",
											label: "Widget Types",
											description: "",
											state: ".widgetTypes",
											children: [
												{ id: "widgetTypesSite", label: "Site", description: "", state: ".widgetTypes", stateParams: { Path: 'Site' }, children: vm.typesTree }
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
											state: ".liveObservationIndicatorTableCells"
										},
										{
											id: "dmGates",
											label: "Gate Systems",
											description: "",
											children: [
												{
													id: "liveTagDataMonitorPanels",
													label: "All Tags - As Panels",
													description: "",
													state: ".liveTagDataMonitorPanels"
												},
												{ id: "liveTagDataMonitor", label: "All Tags - As Table", description: "", state: ".liveTagDataMonitor" },
												{
													id: "liveAssetDataMonitorPanels",
													label: "All Gate Assets - Panels by Site and Gate",
													description: "",
													state: ".liveAssetMonitor",
													children: [
														{
															id: "liveAssetDataMonitorPanels",
															label: "All Gate Assets - Panels by Site and Gate",
															description: "",
															state: ".liveAssetMonitor"
														},
														{ id: "dmGatesBySite", label: "By Site", description: "", state: "", children: siteGateSystemMenuItems }
													]
												}
											]
										},
										{ id: "dmBHS", label: "Baggage Handling Systems", description: "", state: "", children: siteBHSMenuItems }
									]
								}
							]
						}
					];


					dataService.menu = vm.menu;

					console.log("Menu structure = %O", vm.menu);


				});
			}



		}


		$scope.$on("dataService.ready",
			function (event, data) {
				console.log("Setting up menu...");

				SetupMenu();
			});

		if (dataService.IsReady()) {
			console.log("Setting up menu...");
			SetupMenu();
		}



		vm.ActivateState = function (menuItem) {
			if (menuItem.state > "") {
				$state.go("home.app" + menuItem.state, menuItem.stateParams);
			}

		}

		SetupMenu();

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