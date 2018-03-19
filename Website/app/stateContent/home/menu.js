//++Menu Controller
(function () {
	"use strict";


	function MenuCtrl($scope, $rootScope, $state, displaySetupService, dataService, $timeout, $q, signalR, hotkeys) {
		var vm = this;
		//console.log("MenuCtrl invoked");
		vm.state = $state;


		//============================================================================
		//If this is not defined, then the menu panel will have no header on it.
		vm.menuTitle = "Options";
		//============================================================================

		vm.showMenu = false;

		$rootScope.$on("securityService:authenticated",
			function (event, user) {
				console.log("MenuCtrl authenticated event received. User = %O", user);




			});


		//+Provide for the ability to select the dashboards from the 1,2,3,4,5,6... etc keys.
		hotkeys.bindTo($scope)
				.add({
					combo: 'ctrl+1',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(1);
					}
				})
				.add({
					combo: 'ctrl+2',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(2);
					}
				})
				.add({
					combo: 'ctrl+3',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(3);
					}
				})
				.add({
					combo: 'ctrl+4',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(4);
					}
				})
				.add({
					combo: 'ctrl+5',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(5);
					}
				})
				.add({
					combo: 'ctrl+6',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(6);
					}
				})
				.add({
					combo: 'ctrl+7',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(7);
					}
				})
				.add({
					combo: 'ctrl+8',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(8);
					}
				})
				.add({
					combo: 'ctrl+9',
					allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
					callback: function () {
						event.preventDefault();
						GoToDashboardByNumber(9);
					}
				})

			;


		function GoToDashboardByNumber(number) {
			$state.go("home.app.dashboard", { DashboardId: vm.dashboards.skip(number - 1).first().Id });
		}


		$rootScope.$on("Dashboard", function (event, dashboard) {
			//console.log("Event Dashboard = %O", dashboard);

			if (dashboard.CreatorUserId == Global.User.Id && !dashboard.ParentDashboardId) {
				vm.dashboards = [dashboard].concat(vm.dashboards).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (db) { return db.Ordinal });
			}

		});


		$rootScope.$on("Dashboard.Deleted", function (event, dashboard) {
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



		//---G
		//+Section that provides for dashboard reordering
		//---G
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
		//---G

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
				console.log("Setting the menu as visible");

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


		$rootScope.$on("dataService.ready",
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
			"hotkeys",
			MenuCtrl
		]);



})();

