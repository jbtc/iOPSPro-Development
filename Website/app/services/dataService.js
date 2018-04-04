﻿(function () {
	"use strict";





	function DataService(odataService, $rootScope, $q, $interval, utilityService, $timeout, indexedDBService, signalR, $odata) {


		//console.log("dataService created");

		var service = {};


		var cache = {
			companies: [],
			organizations: [],
			organizationsObject: {},
			organizationSites: [],
			organizationSitesObject: {},
			organizationSiteSuites: [],
			organizationSiteSuitesObject: {},
			sites: [],
			sitesObject: {},
			systems: [],
			systemsObject: {},
			systemTypes: [],
			assets: [],
			assetsObject: {},
			assetTypes: [],
			tags: [],
			tagsObject: {},
			assetGraphics: [],
			assetGraphicVisibleValues: [],
			widgetTypes: [],
			jbtStandardObservations: [],
			jbtStandardObservationsObject: {},
			bhsJamAlarms: [],
			dashboardsObject: {},
			suites: [],
			suitesObject: {},
			suiteModules: [],
			suiteModulesObject: {},
			ready: false

		}

		var operationMetadata = {
			tagsWithOneSecondCountdowns: []


		}




		var JBTData = {};


		service.ready = false;
		service.cache = cache;

		service.Statistics = {
			SignalR: {
				MessageCount: 0,
				PreviousMessageCount: 0,
				MessagesPerSecond: 0,
				MessagesPerSecondHistory: []
			}
		}
	

		//Create a central 15 seconds time tick. Send the tick out as a broadcast event to sync all of the widget refreshes
		$interval(function () {
			$rootScope.$broadcast("System.ClockTick15");
		}, 15000);

		$interval(function () {
			$rootScope.$broadcast("System.ClockTick60");
		}, 60000);

		$interval(function () {
			$rootScope.$broadcast("System.ClockTick120");
		}, 120000);


		service.GetAuthorizableActivities = function () {
			return odataService.GetCollection("iOPS", "AuthorizableActivities");

		}


		service.DeleteEntities = function (entities) {
			return $q.all(entities.select(function (entity) {
				entity.Id = -entity.Id;
				return entity.$save();
			}));
		}


		service.GetDashboardTimeScopes = function () {
			return (cache.dashboardTimeScopes ? $q.when(cache.dashboardTimeScopes) : service.GetIOPSCollection("DashboardTimeScopes").then(function (data) {
				cache.dashboardTimeScopes = data;
				return data;
			}));
		}

		service.GetIOPSResource = function (collectionName) {

			return odataService.GetResource("iOPS", collectionName).odata();


		}


		service.GetDashboardsForUser = function () {

			return service.GetIOPSResource("Dashboards")
				.filter("CreatorUserId", Global.User.Id)
				.expand("DashboardTimeScope")
				.expandPredicate("Widgets")
					.filter("ParentWidgetId", null)
					.expand("WidgetType")
					.expand("EmbeddedDashboard")
				.finish()
				.query()
				.$promise
				.then(function (dashboardsForUser) {





					//+Load the dashboards into the dataService cache.
					dashboardsForUser.forEach(function (d) {

						//+Attach a new $save function to each widget because it is not a resource object.
						d.Widgets.forEach(function (w) {
							w.$save = function () {


								if (!w.Id || w.Id == 0) {
									return service.InsertEntity("Widgets", w).then(function (wi) {
										cache.dashboardsObject[w.ParentDashboardId.toString()].Widgets = [wi].concat(cache.dashboardsObject[w.ParentDashboardId.toString()].Widgets).distinct(function (a, b) { return a.Id == b.Id });
									});
								} else {
									return service.UpdateEntity("Widgets", w).then(function () {
										cache.dashboardsObject[w.ParentDashboardId.toString()].Widgets = [w].concat(cache.dashboardsObject[w.ParentDashboardId.toString()].Widgets).distinct(function (a, b) { return a.Id == b.Id });
									});
								}
							}
						});


						service.SetDashboardDerivedDatesFromDayCount(d);

						service.cache.dashboardsObject[d.Id.toString()] = d;





					});

					return dashboardsForUser.where(function (d) { return !d.ParentDashboardId }).orderBy(function (db) { return db.Ordinal });


				});

		}



		service.GetTerminalOverviewGraphicsAndTagsForTerminalSystem = function (systemId) {

			var terminalSystem = cache.systemsObject[systemId.toString()];
			var serviceData;


			if (terminalSystem.TerminalOverviewGraphicsAndTags) {
				return $q.when(terminalSystem.TerminalOverviewGraphicsAndTags);
			} else {

				return service.GetIOPSWebAPIResource("TerminalOverviewGraphicsAndTags")
					.query({
						terminalSystemId: systemId
					}, function (data) {

						var assetIds = data.select(function (d) {
							return d.AssetId.toString();
						}).distinct().join(',');


						data.forEach(function (tag) {
							if (+tag.LastObservationTextValue == +(tag.ValueWhenVisible ? tag.ValueWhenVisible : "99999999")) {
								tag.showImage = true;
							} else {
								tag.showImage = false;
							}
							if (tag.showImage) {
								//console.log("tag graphic set to visible = %O", tag);
							}

						});
						service.PlaceTerminalGraphicsTagsIntoInventory(data);

						cache.systemsObject[systemId.toString()].TerminalOverviewGraphicsAndTags = data;


						serviceData = data;

					}).$promise.then(function () {
						return serviceData;
					});
			}





		}




		service.GetExpandedDashboardById = function (id) {

			var dashboardInCache = cache.dashboardsObject[id.toString()];

			if (dashboardInCache) {
				return $q.when(dashboardInCache);
			} else {

				return service.GetIOPSResource("Dashboards")
					.expand("DashboardTimeScope")
					.expandPredicate("Widgets")
						.filter("ParentWidgetId", null)
						.expand("WidgetType")
						.expand("EmbeddedDashboard")
					.finish()
					.get(id).$promise
					.then(function (data) {

						service.SetDashboardDerivedDatesFromDayCount(data);

						cache.dashboardsObject[data.Id.toString()] = data;

						return data;

					});
			}

		}
		$interval(function () {
			$rootScope.$broadcast("rootScope message passed", null);
		}, 3000);


		service.SetDashboardDerivedDatesFromDayCount = function (dashboard) {
			if (dashboard && dashboard.CustomStartDate && dashboard.CustomEndDate) {

				dashboard.derivedStartDate = dashboard.CustomStartDate;
				dashboard.derivedEndDate = dashboard.CustomEndDate;

				dashboard.webApiParameterStartDate = utilityService.GetUTCQueryDate(dashboard.CustomBeginDate);
				dashboard.webApiParameterEndDate = utilityService.GetUTCQueryDate(dashboard.CustomEndDate);
				dashboard.oDataFilterStartDate = utilityService.GetUTCQueryDate(dashboard.derivedStartDate);
				dashboard.oDataFilterEndDate = utilityService.GetUTCQueryDate(dashboard.derivedEndDate);

			} else {
				var d = new Date();
				switch (dashboard.DashboardTimeScope.Days) {

					//Special entry for "Yesterday"
					case -1:
						d.setHours(0, 0, 0, 0);

						dashboard.derivedEndDate = d;
						dashboard.derivedStartDate = new Date(new Date(new Date().setDate(d.getDate() - 1)).setHours(0, 0, 0, 0));

						break;

						//Special entry for "Today since midnight"
					case 0:
						d.setHours(0, 0, 0, 0);
						dashboard.derivedStartDate = d;
						dashboard.derivedEndDate = new Date('1/1/2500');
						break;

					default:
						dashboard.derivedStartDate = new Date(new Date().setDate(new Date().getDate() - dashboard.DashboardTimeScope.Days));
						dashboard.derivedEndDate = new Date('1/1/2500');

						break;
				}


			}
			dashboard.webApiParameterStartDate = utilityService.GetUTCQueryDate(dashboard.derivedStartDate);
			dashboard.webApiParameterEndDate = utilityService.GetUTCQueryDate(dashboard.derivedEndDate);
			dashboard.oDataFilterStartDate = utilityService.GetUTCQueryDate(dashboard.derivedStartDate);
			dashboard.oDataFilterEndDate = utilityService.GetUTCQueryDate(dashboard.derivedEndDate);
			return dashboard;

		}


		service.GetIOPSWebAPIResource = function (route) {
			return odataService.GetIOPSWebAPIResource(route);
		}

		service.DeleteEntity = function (collectionName, entity) {
			return odataService.DeleteEntity("iOPS", collectionName, entity);
		}


		service.GetEntityById = function (collectionName, Id) {
			return odataService.GetEntityById("iOPS", collectionName, Id);
		}


		service.AddEntity = function (collectionName, entity) {
			return odataService.InsertEntity("iOPS", collectionName, entity);
		}

		service.UpdateEntity = function (collectionName, entity) {
			return odataService.UpdateEntity("iOPS", collectionName, entity);
		}


		service.GetIOPSCollection = function (collectionName, optionalFilterFieldName, optionalFilterFieldValue) {
			return odataService.GetCollection("iOPS", collectionName, optionalFilterFieldName, optionalFilterFieldValue);
		}

		service.GetUser = function (userId) {
			return service.GetIOPSResource("iOPSUsers")
				.expand("Person")
				.expandPredicate("UserAuthorizedActivities")
				.expand("AuthorizableActivity")
				.finish()
				.expandPredicate("SiteDataReaders")
				.expand("Site")
				.finish()
				.get(userId)
				.$promise;
		}

		service.GetStateAbbreviations = function () {
			return odataService.GetCollection("iOPS", "StateAbbreviations");
		}


		service.AddUser = function (user) {
			return odataService.InsertEntity("iOPS", "iOPSUsers", user).$promise;
		}

		service.GetMyDashboards = function () {
			return odataService.GetCollection("iOPS", "Dashboards", "CreatorUserId", Global.User.Id);
		}

		service.GetLastXBagTagScans = function (howMany) {

			return odataService.GetResource("iOPS", "BagTagScans")
				.odata()
				.orderByDescending("Timestamp")
				.take(howMany)
				.query().$promise;

		}


		service.GetLastXBHSAlarms = function (howMany) {
			return odataService.GetResource("iOPS", "BHSAlarms")
				.odata()
				.orderBy("AlarmDateTime", "desc")
				.take(howMany)
				.query().$promise;

		}


		var localDB;
		//***G
		//++ Establish localDB reference and Load all of the basic data collections asyncronously
		//***G
		//console.log("Starting load of data collections");



		$rootScope.$on("securityService:authenticated", function (event, user) {
			$timeout(function () {
				LoadDataCollections();
				cache.ready = true;
				service.ready = true;


			}, 500);

		});


		function LoadDataCollections() {


			//++LocalDB Configuration
			//Get an instance of the localDB and proceed from there.
			indexedDBService.getDBInstance("iOPS", 47, [
				{
					dataStoreName: "Companies",
					keyName: "Id"
				},
				{
					dataStoreName: "Systems",
					keyName: "Id"
				},
				{
					dataStoreName: "Assets",
					keyName: "Id"
				},
				{
					dataStoreName: "Tags",
					keyName: "Id",
					indices: [
						{
							name: 'AssetId',
							fieldName: 'AssetId'
						},
						{
							name: 'SiteId',
							fieldName: 'SiteId'
						}
					]
				},
				{
					dataStoreName: "TagChartDays",
					keyName: "TagId",
					indices: [
						{
							name: 'TagDay',
							fieldName: ''
						}
					]
				},
				{
					dataStoreName: "JBTStandardObservations",
					keyName: "Id"
				},
				{
					dataStoreName: "Units",
					keyName: "Id"
				},
				{
					dataStoreName: "BHSJamAlarms",
					keyName: "Id"
				},
				{
					dataStoreName: "AssetGraphics",
					keyName: "Id"
				},
				{
					dataStoreName: "AssetGraphicVisibleValues",
					keyName: "Id"
				},
				{
					dataStoreName: "Observations",
					keyName: "Id",
					indices: [
						{
							name: 'TagDateRange',
							fieldName: 'Testing'
						}
					]
				}




			]).then(function (db) {
				//console.log("LocalDB retrieved...");
				localDB = db;

				//+Asyncronously and simultaneously load data collections
				$q.all([
					GetODataSites().then(function (data) {
						cache.sites = data.select(function (d) {
							AttachBlankMetadataObject(d);
							cache.sitesObject[d.Id.toString()] = d;
							return d;
						});
						console.log("Sites Loaded =" + data.length);
					}),

					GetODataSiteCompany().then(function (data) {
						cache.siteCompany = data.select(function (d) {
							return AttachBlankMetadataObject(d);
						});
						console.log("SiteCompany Loaded = " + data.length);
					}),

					GetODataCompanies().then(function (data) {
						//Setup the data to have a controls object attached.
						cache.companies = data.select(function (d) {
							return AttachBlankMetadataObject(d);
						});
						console.log("Companies Loaded = " + data.length);
					}),

					odataService.GetCollection("iOPS", "WidgetTypes").then(function (data) {
						cache.widgetTypes = data;
					}),

					GetODataUnits().then(function (data) {
						return $timeout(function () {
							cache.units = data.select(function (d) {
								return AttachBlankMetadataObject(d);
							});
							console.log("Units Loaded = " + data.length);

						}, 10);
					}),

					GetODataSystems().then(function (data) {
						cache.systems = data.select(function (d) {
							d.Type = d.SystemType.Name;
							//cache.ready = true;
							//service.ready = true;

							//$rootScope.$broadcast("dataService.ready");
							AttachBlankMetadataObject(d);
							cache.systemsObject[d.Id.toString()] = d;
							return d;
						});
						console.log("Systems Loaded = %O", data);

					}),


					GetODataAssets().then(function (data) {
						cache.assets = data.select(function (d) {
							AttachBlankMetadataObject(d);
							cache.assetsObject[d.Id.toString()] = d;
							return d;
						});
						console.log("Assets Loaded = " + data.length);
					}),

					GetODataAssetGraphics().then(function (data) {
						cache.assetGraphics = data;
						console.log("AssetGraphics Loaded = " + data.length);
					}),

					GetODataAssetGraphicVisibleValues().then(function (data) {
						cache.assetGraphicVisibleValues = data;
						console.log("AssetGraphicVisibleValues Loaded = " + data.length);
					}),

					service.GetIOPSCollection("SystemTypes").then(function (data) {
						cache.systemTypes = data;

					}),
					service.GetIOPSCollection("Suites").then(function (data) {
						cache.suites = data;
						data.forEach(function(d) {
							cache.suitesObject[d.Id.toString()] = d;
						});

					}),
					service.GetIOPSCollection("Organizations").then(function (data) {
						cache.organizations = data;
						data.forEach(function(d) {
							cache.organizationsObject[d.Id.toString()] = d;
						});

					}),
					service.GetIOPSCollection("OrganizationSites").then(function (data) {
						cache.organizationSites = data;
						data.forEach(function(d) {
							cache.organizationSitesObject[d.Id.toString()] = d;
						});

					}),
					service.GetIOPSCollection("OrganizationSiteSuites").then(function (data) {
						cache.organizationSiteSuites = data;
						data.forEach(function(d) {
							cache.organizationSiteSuitesObject[d.Id.toString()] = d;
						});

					}),
					service.GetIOPSCollection("SuiteModules").then(function (data) {
						cache.suiteModules = data;
						data.forEach(function(d) {
							cache.suiteModulesObject[d.Id.toString()] = d;
						});

					}),




					service.GetIOPSCollection("AssetTypes").then(function (data) {
						cache.assetTypes = data;

					}),







					//The folowing promise will combine the localDB cached copy of the tags with a query from the odata source for all of the changd tags since the last midofied date found in the localdb collection ftags.
					GetODataTags().then(function (data) {


						cache.tags = data.select(function (d) {
							return AttachBlankMetadataObject(d);
						});
						console.log("Tags Loaded = " + data.length);
					}),

					GetODataJBTStandardObservations().then(function (data) {
						cache.jbtStandardObservations = data.select(function (d) {
							AttachBlankMetadataObject(d);
							cache.jbtStandardObservationsObject[d.Id.toString()] = d;
							return d;
						});
						console.log("JBTStandardObservations Loaded = " + data.length);
					})
				]).then(function () {
					console.log("Basic Collections Loaded");

					console.log("Stitch the Comprehensive Object Graph together ");



					//***G
					//++Thread All The Collections Together
					//***G
					//Begin receiving signalR updates
					signalR.JoinGroup("All");


					//+Connect collections related to each company
					//***
					var time0 = performance.now();
					JBTData = {
						Companies: cache.companies.select(function (company) {

							company.Sites = cache.siteCompany
								.where(function (sc) { return sc.CompanyId == company.Id })
								.selectMany(function (sc) {
									return cache.sites.where(function (s) { return s.Id == sc.SiteId });
								});


							company.Assets = cache.assets.where(function (asset) { return asset.CompanyId == company.Id })
								.select(function (asset) {

									asset.Company = company;
									return asset;
								});

							company.Systems = cache.systems.where(function (system) { return system.CompanyId == company.Id })
								.select(function (system) {
									system.Company = company;
									return system;

								});


							;

							return company;

						}),

						SystemTypes: cache.systemTypes,
						AssetTypes: cache.assetTypes.where(function (a) { return a.IsValidForWidgets }),

						WidgetTypes: cache.widgetTypes,

						Sites: cache.sites.select(function (site) {

							site.Companies = cache.siteCompany
								.where(function (sc) { return sc.SiteId == site.Id })
								.selectMany(function (sc) {
									return cache.companies.where(function (c) { return c.Id == sc.CompanyId });
								});

							site.Assets = cache.assets.where(function (asset) { return asset.SiteId == site.Id })
								.select(function (asset) {
									asset.Site = site;
									return asset;
								});

							site.Systems = cache.systems
								.where(function (system) { return system.SiteId == site.Id })
								.select(function (system) {
									system.Site = site;
									return system;
								});

							return site;
						}),

						Systems: cache.systems.select(function (system) {
							system.Systems = cache.systems.where(function (s) { return s.ParentSystemId == system.Id })
								.select(function (s2) {
									s2.ParentSystem = system;
									return s2;
								});

							system.Assets = cache.assets.where(function (asset) { return asset.ParentSystemId == system.Id });

							return system;
						}),

						Assets: cache.assets.select(function (asset) {

							asset.Tags = cache.tags
								.where(function (tag) { return tag.AssetId == asset.Id })
								.select(function (tag) {
									tag.Asset = asset;
									return tag;
								});

							asset.ParentSystem = cache.systems.first(function (s) { return s.Id == asset.ParentSystemId });


							return asset;

						}),



						Tags: cache.tags.select(function (tag) {

							tag.JBTStandardObservation = cache.jbtStandardObservations
								.first(function (o) { return o.Id == tag.JBTStandardObservationId });


							if (tag.LastObservationDate) {
								tag.LastObservationDate = utilityService.GetNonUTCQueryDate(tag.LastObservationDate);
								tag.LastModifiedDate = utilityService.GetNonUTCQueryDate(tag.LastModifiedDate);
							}

							return tag;
						}),

						JBTStandardObservations: cache.jbtStandardObservations.select(function (s) {
							s.Tags = cache.tags.where(function (t) { return t.JBTStandardObservationId == s.Id });
							s.Unit = cache.units.first(function (u) { return u.Id == s.UnitId });
						})
					}

					console.log("Complete Object Graph = %O - " + (performance.now() - time0), JBTData);

					console.log("Cache Fully Loaded. Broadcasting service ready.");
					cache.ready = true;
					service.ready = true;

					$rootScope.$broadcast("dataService.ready");

				});





			});



		}




		service.IsReady = function () {
			return cache.ready;
		}

		function GetRawKepwareDataViewObject(signalRContent) {

		}




		service.GetCache = function () {
			return cache;
		}


		//***B
		//***B
		//***B
		//++Data Update Events

				//---B
				$rootScope.$on("Company", function (event, modifiedCompany) {
					//Find the global companies array and update it.
					var cacheCompany = JBTData.Companies.first(function (c) { return c.Id == modifiedCompany.Id });

					if (cacheCompany) {
						cacheCompany.Name = modifiedCompany.Name;
						cacheCompany.ShortName = modifiedCompany.ShortName;
						cacheCompany.Description = modifiedCompany.Description;
						cacheCompany.Address = modifiedCompany.Address;
					}



				});

				//---B
				$rootScope.$on("Company.Deleted", function (event, deletedCompany) {
					//Find the global companies array and update it.
					var cacheCompany = JBTData.Companies.first(function (c) { return c.Id == deletedCompany.Id });

					if (cacheCompany) {

						JBTData.Companies = JBTData.Companies.where(function (c) { return c.Id != deletedCompany.Id });
					}



				});

				//---B
				$rootScope.$on("AssetModel", function (event, assetModel) {

					//console.log("AssetModel change. AssetModel = %O", assetModel);
					cache.assetModels = [assetModel].concat(cache.assetModels).distinct(function (a, b) { return a.Id == b.Id });
					assetModel.Assets = cache.assets.where(function (a) { return a.AssetModelId == assetModel.Id });

				});


				function CachedDataUpdate(type, entity, collectionName) {
					
					var cacheCollection = cache[collectionName];
					var cacheCollectionObject = cache[collectionName + 'Object'];
					var cacheDataObject = cacheCollectionObject[entity.Id.toString()];
					console.log("CachedDataUpdate " + type + ' ' + collectionName + ' %O', entity);

					
					switch(type) {
					
						case 'Added':
							if (!cacheDataObject) {
								cacheCollection.push(entity);
								cacheCollectionObject[entity.Id.toString()] = entity;
							}
							break;

						case 'Deleted':
							if (cacheDataObject) {
								cacheCollection = cacheCollection.where(function(o) { return o.Id != entity.Id });
								cacheCollectionObject[entity.Id.toString()] = null;
							}
							break;

						case 'Modified':
							if (cacheDataObject) {

								for (var property in cacheDataObject) {
									if (cacheDataObject.hasOwnProperty(property)) {
										cacheDataObject[property] = entity[property];
									}
								}
							}
							break;




					}

					console.log("CachedDataUpdate cache = %O", cache);


				}

				//***G
				//++Cached Data Updates
				//***G

				$rootScope.$on("Organization Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'organizations');
				});

				$rootScope.$on("Organization Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'organizations');
				});

				$rootScope.$on("Organization Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'organizations');
				});

				$rootScope.$on("OrganizationSite Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'organizationSites');
				});

				$rootScope.$on("OrganizationSite Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'organizationSites');
				});

				$rootScope.$on("OrganizationSite Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'organizationSites');
				});

				$rootScope.$on("OrganizationSiteSuite Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'organizationSiteSuites');
				});

				$rootScope.$on("OrganizationSiteSuite Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'organizationSiteSuites');
				});

				$rootScope.$on("OrganizationSiteSuite Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'organizationSiteSuites');
				});

				$rootScope.$on("Module Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'modules');
				});

				$rootScope.$on("Module Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'modules');
				});

				$rootScope.$on("Module Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'modules');
				});

				$rootScope.$on("ModuleWidgetType Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'moduleWidgetTypes');
				});

				$rootScope.$on("ModuleWidgetType Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'moduleWidgetTypes');
				});

				$rootScope.$on("ModuleWidgetType Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'moduleWidgetTypes');
				});

				$rootScope.$on("SuiteModule Added", function (event, addedEntity) {
					CachedDataUpdate('Added',addedEntity, 'suiteModules');
				});

				$rootScope.$on("SuiteModule Deleted", function (event, deletedEntity) {
					CachedDataUpdate('Deleted',deletedEntity, 'suiteModules');
				});

				$rootScope.$on("SuiteModule Modified", function (event, modifiedEntity) {
					CachedDataUpdate('Modified',modifiedEntity, 'suiteModules');
				});

				//---B
				$rootScope.$on("Observation", function (event, signalRData) {
					UpdateObservationFromSignalR(signalRData);
				});

				//---B
				$rootScope.$on("Tag", function (event, signalRData) {
					UpdateTagFromSignalR(signalRData);
				});
				//***G


				//---B
				$rootScope.$on("WidgetAdded", function (event, newWidget) {
					var dashboard = cache.dashboardsObject[newWidget.ParentDashboardId.toString()];
					if (dashboard) {
						if (!dashboard.Widgets) {
							dashboard.Widgets = [];
						}
						dashboard.Widgets.push(newWidget);
					}
				});

				//---B
				$rootScope.$on("Widget.Deleted", function (event, deletedWidget) {
					var dashboard = cache.dashboardsObject[deletedWidget.ParentDashboardId.toString()];
					if (dashboard) {
						if (!dashboard.Widgets) {
							dashboard.Widgets = [];
						}
						dashboard.Widgets = dashboard.Widgets.where(function (w) { return w.Id != deletedWidget.Id });
					}
				});

				//---B
				$rootScope.$on("Dashboard", function (event, newOrModifiedDashboard) {
					cache.dashboardsObject[newOrModifiedDashboard.Id.toString()] = null;

					service.GetExpandedDashboardById(newOrModifiedDashboard.Id);
				});

		//***B
		//***B
		//***B




		service.GetUsers = function () {
			return odataService.GetResource("iOPS", "iOPSUsers")
				.odata()
				.expandPredicate("Person")
				.expandPredicate("CompanyContacts")
				.expand("Company")
				.finish()
				.finish()
				.expandPredicate("SiteDataReaders")
				.expand("Site")
				.finish()
				.expandPredicate("UserAuthorizedActivities")
				.expand("AuthorizableActivity")
				.finish()
				.query().$promise.then(function (data) {
					return data.orderBy(function (p) { return p.Person.FamilyName });
				});
		}



		service.GetCompanies = function () {
			return $q.when(cache.companies);
		}

		service.GetSites = function () {
			return $q.when(cache.sites);
		}

		service.GetSystems = function () {
			return $q.when(cache.systems);
		}


		service.GetAssets = function () {
			return $q.when(cache.assets);
		}

		service.GetTags = function () {
			return $q.when(cache.tags);
		}

		service.GetJBTData = function () {

			return $q.when(JBTData);
		}




		//==========================================================================
		//The user can disconnect their machine from the network and put it to sleep. 
		//SignalR will detect this event and begin trying to reconnect upon wakeup.
		//When it is finished establising a connection, SignalR will broadcast the event. 
		//We can trap it here and load all of the changes to the data.
		//==========================================================================
		$rootScope.$on("System.signalR Connected", function (event, dataObject) {
			//console.log("System.signalR Connected event");
			//Begin receiving signalR updates
			signalR.JoinGroup("All");
			LoadData();

		});

		$rootScope.$on("System.signalR Disconnected", function (event, dataObject) {
			//console.log("System.signalR Disconnected event");
			service.dataServerConnected = false;

		});



		//==========================================================================================
		//+Function to load any data that the dataService needs in order for the app to function.
		//==========================================================================================
		function LoadData() {
			//Collect whatever data you need for maintaining a cache.
			//You may elect not to cache any at all.

			//Then - Announce to the rest of the application that the data service has everything it needs for the app to function.
			$rootScope.$broadcast("DataService Ready");
		}

		function GetODataSites() {
			return odataService.GetCollection("iOPS", "Sites");
		}

		function GetODataSiteCompany() {
			return odataService.GetCollection("iOPS", "SiteCompanies");
		}

		function GetODataSite(id) {
			return odataService.GetEntityById("iOPS", "Sites", id);
		}


		function GetODataCompanies() {
			return odataService.GetCollection("iOPS", "Companies");
		}

		function GetODataCompany(id) {
			return odataService.GetEntityById("iOPS", "Companies", id);
		}

		function GetODataSystems() {

			var dbSystems;
			var maxDate;

			//Get all of the systems in the localDB
			//console.log("Getting localdb systems...");
			return localDB.getById("Systems", 1).then(function (dbData) {
				dbSystems = dbData ? dbData.Systems : [];
				//console.log("localdb Systems = " + dbSystems.length);
				//Get All of the Systems that have changed since the localDB was collected.
				if (dbSystems.length > 0) {
					maxDate = dbSystems.max(function (system) { return system.DateLastModified });
				} else {
					maxDate = new Date("1/1/2017");
				}

				//Back it up a bit to catch any overlap.
				maxDate = (new Date(maxDate));


				maxDate = maxDate.setDate(maxDate.getDate() - .001);
				maxDate = utilityService.GetUTCQueryDate(maxDate);

				//Get only changed tags from the odata source
				return odataService.GetResource("iOPS", "SystemGroups")
					.odata()
					.filter("DateLastModified", ">", maxDate)
					.expand("SystemType")
					.query().$promise.then(function (data) {

						console.log("odata Systems =" + data.length);

						var combinedData = data
							.concat(dbSystems)
							.distinct(function (a, b) { return a.Id == b.Id });

						console.log("combined Systems = " + combinedData.length);


						//Adjust the string valued dates in all of the tags so that they have a regular javascript format date.
						combinedData.select(function (system) {
							system.DateLastModified = utilityService.GetNonUTCQueryDate(system.DateLastModified);
						});


						localDB.upsert("Systems", { Id: 1, Systems: combinedData });

						return combinedData;

					});
			});


		}






		function GetODataAssets() {


			return GetNamedCachedCollection("Assets");

		}

		function GetODataAssetGraphics() {


			return GetNamedCachedCollection("AssetGraphics");

		}
		function GetODataAssetGraphicVisibleValues() {


			return GetNamedCachedCollection("AssetGraphicVisibleValues");

		}


		function GetODataJBTStandardObservations() {


			return GetNamedCachedCollection("JBTStandardObservations");
		}

		function GetODataUnits() {


			return GetNamedCachedCollection("Units");
		}





		function GetNamedCachedCollection(collectionName) {
			var dbCollection;
			var maxDate;

			var t0 = performance.now();
			//console.log("localDB = %O", localDB);
			console.log("Getting localdb " + collectionName + "...");
			return localDB.getById(collectionName, 1).then(function (dbData) {

				if (!dbData) {
					console.log("dbData for collection of " + collectionName + " not present");
				}
				console.log("dbData returned from indexedDB for " + collectionName + " = %O", dbData);
				dbCollection = dbData ? dbData.data : [];
				if (!dbCollection) {
					console.log("dbCollection for collection of " + collectionName + " not present");
				}
				console.log("localdb " + collectionName + " = " + dbCollection.length + " - " + (performance.now() - t0) + "ms");

				//---G
				//+Get All of the entities that have changed since the localDB was collected.
				//---G
				if (dbCollection.length > 0) {
					maxDate = dbCollection.max(function (e) { return e.LastModifiedDate });
				} else {
					maxDate = new Date("1/1/2017");
				}

				maxDate = (new Date(maxDate));

				//maxDate = maxDate.setDate(maxDate.getDate());

				console.log(collectionName + " maxDate = %O", maxDate);

				maxDate = utilityService.GetUTCQueryDate(maxDate);

				console.log("OData Query Date for " + collectionName + " maxdate = %O", maxDate);

				//Get only changed entities from the odata source

				return odataService.GetResource("iOPS", collectionName)
					.odata()
					.filter("LastModifiedDate", ">", maxDate)
					.query().$promise.then(function (data) {

						console.log("odata " + collectionName + " = " + data.length);

						var combinedData = data.concat(dbCollection).distinct(function (a, b) { return a.Id == b.Id });

						console.log("combined " + collectionName + " = " + combinedData.length);


						localDB.upsert(collectionName, { Id: 1, data: combinedData });

						return combinedData;

					});
			});


		}

		function GetODataTags() {


			return $q.when([]);

		};



		//+Listen for SignalR updates
		

		function UpdateTagFromSignalR(data) {

			var signalRTag = GetJsonFromSignalR(data);


		}


		//---G
		//++Convert the signalR formatted string into proper JSON.
		//The signalR messages originating from sql server are coded as a delimited string
		//The field name/value pairs are separated by a ~, while the field name and its value are separated by an !
		//Example:
		//  FirstName!Mark~LastName!Thompson
		//===========================================================================================================
		function GetJsonFromSignalR(signalRString) {
			var returnObject = {}
			//Accumulate the properties of the output object
			//Remove the leading Conn=xxx,
			signalRString = signalRString.substring(signalRString.indexOf(',') + 1);

			signalRString.split("~").select(function (item) {
				var splitField = item.split("!");
				returnObject[splitField[0]] = splitField[1];
			});
			return returnObject;
		}



		service.GetJsonFromSignalR = function (signalRString) {
			return GetJsonFromSignalR(signalRString);
		}


		var signalRTimeStamp = performance.now();



		service.PlaceTerminalGraphicsTagsIntoInventory = function (tags) {
			tags.forEach(function (tag) {

				var site = cache.sites.first(function (s) { return s.Id == tag.SiteId });

				var signalRData = {
					DataType: 'DB',
					PLCUTCDate: !service.dataSourceIsLocal
						? utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate))
						: new Date(tag.LastObservationDate),
					ObservationUTCDate: service.dataSourceIsLocal
						? new Date(tag.LastObservationDate)
						: utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate)),

					AssetId: +tag.AssetId,
					TagId: +tag.TagId,
					SiteId: +tag.SiteId,
					ObservationId: +tag.LastObservationId,
					JBTStandardObservationId: +tag.JBTStandardObservationId,

					SiteName: site ? site.Name : null,
					TagName: tag.TagName,
					GateName: tag.GateName && tag.GateName.replace('.', ''),
					Value: tag.LastObservationTextValue,
					JBTStandardObservation: cache.jbtStandardObservations.first(function (s) {
						return s.Id == tag.JBTStandardObservationId;
					})
				}

				signalRData.PLCUTCDateMS = signalRData.PLCUTCDate.getTime();
				signalRData.PLCLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.PLCUTCDate);
				signalRData.ObservationUTCDateMS = signalRData.ObservationUTCDate.getTime();
				signalRData.ObservationLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.ObservationUTCDate);

				AttachShortTagNameToTagData(signalRData);


				//console.log("Pre-Load observation to be added to inventory = %O", signalRData);

				LoadSignalRObservationToInventory(signalRData);

			});
		}

		service.PlaceTagsIntoInventory = function (tags) {

			var counter = 0;

			tags
				.where(function (t) { return !t.MarkedForDelete })
				.forEach(function (tag) {

					var site = cache.sites.first(function (s) { return s.Id == tag.SiteId });
					if (tag.LastObservationDate) {

						var lastObservationDateArray = tag.LastObservationDate.split('T');
						var part2 = lastObservationDateArray[1].split('-');
						tag.LastObservationDate = (lastObservationDateArray[0] + ' ' + part2[0]).replace('Z', '');
						tag.LastObservationDateAsADate = new Date(tag.LastObservationDate);
					}

					if (!cache.tags.any(function (t) { return t.TagId == tag.Id })) {
						var signalRData = {
							DataType: 'DB',
							PLCUTCDate: new Date(tag.LastObservationDate),
							ObservationUTCDate: new Date(tag.LastObservationDate),
							//PLCUTCDate: !service.dataSourceIsLocal
							//	? utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate))
							//	: new Date(tag.LastObservationDate),
							//ObservationUTCDate: service.dataSourceIsLocal
							//	? new Date(tag.LastObservationDate)
							//	: utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate)),

							AssetId: +tag.AssetId,
							TagId: +tag.Id,
							SiteId: +tag.SiteId,
							ObservationId: +tag.LastObservationId,
							JBTStandardObservationId: +tag.JBTStandardObservationId,

							SiteName: site ? site.Name : null,
							TagName: tag.Name,
							Value: tag.LastObservationTextValue,
							JBTStandardObservation: cache.jbtStandardObservations.first(function (s) {
								return s.Id == tag.JBTStandardObservationId;
							}),
							IsCritical: tag.IsCritical,
							IsWarning: tag.IsWarning,
							IsAlarm: tag.IsAlarm,
							ValueWhenActive: tag.ValueWhenActive || "1",
							AssetName: tag.AssetName,
							GateName: tag.GateName && tag.GateName.replace('.', ''),
							Severity: tag.IsCritical ? 'Critical' :
								tag.IsAlarm ? 'Alarm' :
								tag.IsWarning ? 'Warning' :
								''
						}

						signalRData.PLCUTCDateMS = signalRData.PLCUTCDate.getTime();
						signalRData.PLCLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.PLCUTCDate);
						signalRData.ObservationUTCDateMS = signalRData.ObservationUTCDate.getTime();
						signalRData.ObservationLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.ObservationUTCDate);

						AttachShortTagNameToTagData(signalRData);


						//console.log("Pre-Load observation to be added to inventory = %O", signalRData);
						if (counter++ < 5) {
							console.log("Tag to place into inventory = %O", tag);

						}

						LoadSignalRObservationToInventory(signalRData);

					}


				});

		}


		service.LoadTagDataStringsToInventory = function (dataStrings) {


			//console.log("dataStrings = %O", dataStrings);


			var data = service.GetBrokenOutFieldsFromStringTagData(dataStrings);

			//console.log("Formatted data = %O", angular.copy(data));
			//console.log("Loading tags into inventory Data Arrival = " + data.length + ' tags');
			//console.log("Inventory length before loading = " + cache.tags.length);

			if (data.length > 0) {

				data.select(function (tag) {

					var formattedCacheTagObject = GetStandardCacheTagObjectFromDatabaseFields(tag);

					//Debugging
					//formattedCacheTagObject.IsTest = true;

					var loadedTag = LoadSignalRObservationToInventory(formattedCacheTagObject);

					if (tag.PreviousObservationId && tag.PreviousObservationId != tag.ObservationId) {
						//console.log("broadcasting tag update for refresh = %O", tag);
						$rootScope.$broadcast("dataService.TagUpdate", loadedTag);
					}

				});

			}

		}

		//var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		//var dayNameToLookFor = 'Thursday';
		//var ordinalToLookFor = 4;

		//var dateArray = _.range(500).select(function(number) {
		//		var dat = new Date();
		//		dat.setDate(dat.getDate() + number);
		//		return dat;
		//	})
		//	.where(function(dateItem) {
		//		return days[dateItem.getDay()] == dayNameToLookFor;
		//	})
		//	.groupBy(function (dateItem) { return dateItem.getFullYear() + String("0" + dateItem.getMonth()).slice(-6) })
		//	.select(function(group) {
		//		return {
		//			month: group.key,
		//			selectedDate: group.length > ordinalToLookFor-1 ? group.skip(ordinalToLookFor-1).first() : null
		//		}	
		//	})

		//;

		//console.log("zzzzzzzzzDayGroup = %O", dateArray);
		



		service.GetSiteAllGateSummaryDataStructure = function (siteId, widgetId) {

			var standardIdsToLoad = [12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245];

			if (cache.sitesObject[siteId.toString()].AllGateSummaryData) {
				return $q.when(cache.sitesObject[siteId.toString()].AllGateSummaryData);
			} else {
				return service.GetIOPSResource("Tags")
					.filter("SiteId", siteId) //that belong to the widget site
					.filter($odata.Predicate.or(standardIdsToLoad.select(function (sid) { return new $odata.Predicate("JBTStandardObservationId", sid) })))
					.select(["D"])
					.query()
					.$promise
					.then(function (data) {


						console.log("SiteId" + siteId + " data for standard Ids  12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245 arrived. " + data.length + " Records");

						//The field is just D

						var dataAsListOfStrings = data.select(function (d) { return d.D });

						service.LoadTagDataStringsToInventory(dataAsListOfStrings);

						console.log("SiteId" + siteId + " data for standard Ids  12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245 loaded to dataService cache");


						var brokenOutData = service.GetBrokenOutFieldsFromStringTagData(dataAsListOfStrings);


						console.log("siteGateTags for [12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255, 12245] std ids data = %O", data);


						var assetIds = brokenOutData
							.select(function (d) {
								return d.AssetId;
							}).distinct()
						.join(',');


						//+Get all Alarm Tags into the dataservice inventory. The last true parameter will cause the dataService method to only look for alarm tags.
						console.log("SiteId" + siteId + " Alarm Tags Requested from database");
						return service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetIds, true).then(function () {
							console.log("SiteId" + siteId + " Alarm Tags loaded into inventory");

							console.log("assetIds = %O", assetIds);
							var dataGroupedByGate = brokenOutData.groupBy(function (t) { return t.GateName });
							console.log("Grouped by Gate = %O", dataGroupedByGate);

							var gateTagGroups = dataGroupedByGate
								.select(function (g) {

									var pcaAsset = cache.assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'PCA' }) ? g.first(function (t2) { return t2.AssetName == 'PCA' }).AssetId : 0) });
									var pbbAsset = cache.assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'PBB' }) ? g.first(function (t2) { return t2.AssetName == 'PBB' }).AssetId : 0) });
									var gpuAsset = cache.assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'GPU' }) ? g.first(function (t2) { return t2.AssetName == 'GPU' }).AssetId : 0) });


									var outputObject = {
										PCAAsset: pcaAsset,
										PBBAsset: pbbAsset,
										GPUAsset: gpuAsset,
										GateName: g.key,
										SortField: (!isFinite(g.key.substring(0, 1)) && isFinite(g.key.substring(1, 50))) ? g.key.substring(0, 1) + g.key.substring(1, 50).padStart(4, '0') : g.key,
										GateSystem: cache.systems.first(function (s) { return s.SiteId == siteId && s.TypeId == 3 && s.Name == g.key }),
										PCAUnitOnTag: pcaAsset ? pcaAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
										GPUUnitOnTag: gpuAsset ? gpuAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
										PBBAircraftDockedTag: pbbAsset ? pbbAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12245 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
										PBBUnitOnTag: pbbAsset ? pbbAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
										DischargeTemperatureTag: pcaAsset ? pcaAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 2736 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
										AverageAmpsOutTag: gpuAsset ? gpuAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 1942 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null
									}


									return outputObject;
								})
								.orderBy(function (group) { return group.SortField });

							//+Attach the alarms and comm loss tags to the assets on the gate.
							//Once this is done, then the controller for this directive will no longer have to track them. The data service will be maintaining them.
							var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

							//Need to get the alarms tags into the dataService tags cache for every asset.

							gateTagGroups.forEach(function (gtg) {

								if (gtg.PBBAsset) {
									gtg.PBBAsset.AlarmTags = gtg.PBBAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
									gtg.PBBAsset.AlarmActiveTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.PBBAsset.Id && t.JBTStandardObservationId == 12323 });
									if (gtg.PBBAsset.AlarmActiveTag) {
										gtg.PBBAsset.AlarmActiveTag.ValueWhenActive = (gtg.PBBAsset.AlarmActiveTag.ValueWhenActive || "1");
									} else {
										//console.log("asset %O, has no alarm active tag", gtg.PBBAsset);
									}
									gtg.PBBAsset.CommLossTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.PBBAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
								}
								if (gtg.PCAAsset) {
									gtg.PCAAsset.AlarmTags = gtg.PCAAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
									gtg.PCAAsset.AlarmActiveTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.PCAAsset.Id && t.JBTStandardObservationId == 12324 });
									if (gtg.PCAAsset.AlarmActiveTag) {
										gtg.PCAAsset.AlarmActiveTag.ValueWhenActive = (gtg.PCAAsset.AlarmActiveTag.ValueWhenActive || "1");
									} else {
										//console.log("asset %O, has no alarm active tag", gtg.PCAAsset);
									}
									gtg.PCAAsset.CommLossTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.PCAAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
								}
								if (gtg.GPUAsset) {
									gtg.GPUAsset.AlarmTags = gtg.GPUAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
									gtg.GPUAsset.AlarmActiveTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.GPUAsset.Id && t.JBTStandardObservationId == 12325 });
									if (gtg.GPUAsset && gtg.GPUAsset.AlarmActiveTag) {
										gtg.GPUAsset.AlarmActiveTag.ValueWhenActive = (gtg.GPUAsset.AlarmActiveTag.ValueWhenActive || "1");
									} else {
										//console.log("asset %O, has no alarm active tag", gtg.GPUAsset);
									}
									gtg.GPUAsset.CommLossTag = cache.tags.first(function (t) { return +t.AssetId == +gtg.GPUAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
								}
							});


							console.log("SiteId" + siteId + " Generated gateTagGroups = %O", gateTagGroups);
							cache.sitesObject[siteId.toString()].AllGateSummaryData = gateTagGroups;

							//+Get the subwidgets collection associated with this all gate summary and attach it to the data structure. (Asynch - will complete after the call is returned.)
							service.GetIOPSResource("Widgets")
								.filter("ParentWidgetId", widgetId)
								.filter("SiteId", siteId)
								.query()
								.$promise.then(function (data) {
									gateTagGroups.subWidgets = data;
									//console.log("vm.subWidgets = %O", vm.subWidgets);
								});

							return gateTagGroups;
						});



					});

			}





		}



		service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds =
			function (assetIdList, alarmsOnly) {
				//console.log("Loading tags into inventory for list of asset ids = " + assetIdList);

				var notLoadedAssetIds = ("" + assetIdList).split(',').distinct().where(function (assetId) {
					if (assetId != "") {
						var asset = cache.assets.first(function (a) { return a.Id == +assetId });
						return (!alarmsOnly && asset && !asset.AllTagsLoaded) || (alarmsOnly && asset && !asset.AllAlarmTagsLoaded);
					}

				});

				console.log("notLoadedAssetIds = %O", notLoadedAssetIds);
				if (notLoadedAssetIds.length == 0) {
					//console.log("Asset was loaded already");
					return $q.when(true);
				}

				//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.
				if (notLoadedAssetIds.length > 0) {


					console.log("Data Requested from GSTagsByListOfAssetIdsCondensed");

					return service.GetIOPSWebAPIResource(alarmsOnly ? "GSAlarmTagsByListOfAssetIdsCondensed" : "GSTagsByListOfAssetIdsCondensed")
						.query({
							assetIds: assetIdList
						},
							function (data) {

								console.log("Data Arrived from GSTagsByListOfAssetIdsCondensed");

								data = service.GetBrokenOutFieldsFromStringTagData(data);


								//console.log("Data Is formatted");
								//console.log("Loading tags into inventory Data Arrival = " + data.length + ' tags');
								//console.log("Inventory length prior to loading = " + cache.tags.length);

								if (data.length > 0) {

									data.select(function (tag) {

										var formattedCacheTagObject = GetStandardCacheTagObjectFromDatabaseFields(tag);

										//Debugging
										//formattedCacheTagObject.IsTest = true;

										var loadedTag = LoadSignalRObservationToInventory(formattedCacheTagObject, true);

										if (tag.PreviousObservationId && tag.PreviousObservationId != tag.ObservationId) {
											//console.log("broadcasting tag update for refresh = %O", tag);
											$rootScope.$broadcast("dataService.TagUpdate", loadedTag);
										}

									});


									//console.log("Inventory length after loading = " + cache.tags.length);

									assetIdList.split(',').forEach(function (assetId) {
										var asset = cache.assets.first(function (a) { return a.Id == +assetId });

										//Flag the asset as having all of its tags now loaded if it was not just the alarms loaded. 
										if (asset && !alarmsOnly) {
											asset.AllTagsLoaded = true;
										}
										if (asset && alarmsOnly) {
											asset.AllAlarmTagsLoaded = true;
										}
									});
								}


							}).$promise;
				}
			}





		service.RefreshAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds = function (assetIdList) {


			//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.




			return service.GetIOPSWebAPIResource("GSTagsUpdatedInLastSecondsByListOfAssetIdsCondensed")
				.query({
					assetIds: assetIdList,
					seconds: 120
				},
					function (data) {


						service.GetBrokenOutFieldsFromStringTagData(data)
							.where(function (tag) {
								return tag.Name.indexOf('|') > 0
							}) //Only the new format tags have pipe symbols in the name.
							.where(function (t) { return !t.MarkedForDelete })
							.select(function (tag) {


								tag = GetStandardCacheTagObjectFromDatabaseFields(tag);
								var tagLoaded = LoadSignalRObservationToInventory(tag);

								if (tagLoaded.PreviousObservationId && tagLoaded.PreviousObservationId != tagLoaded.ObservationId) {
									//console.log("broadcasting tag update for refresh = %O", tagLoaded);
									$rootScope.$broadcast("dataService.TagUpdate", tagLoaded);
								}

							});

						assetIdList.split(',').forEach(function (assetId) {
							var asset = cache.assets.first(function (a) { return a.Id == +assetId });

						});
					});
		}


		service.GetBrokenOutFieldsFromStringTagData = function (data) {
			return data.select(function (tstring) {

				var tarray = tstring.split('~');



				//'d' = 
				//			convert(varchar(50),Id) + '~' +
				//			Name + '~' +
				//			coalesce(convert(varchar(50), SiteId),'') + '~' +  
				//			coalesce(convert(varchar(25),[dbo].[currentTimeMilliseconds](LastObservationCreationDate)),'') + '~' + 
				//			coalesce(convert(varchar(25),[dbo].[currentTimeMilliseconds](LastObservationDate)),'') + '~' + 
				//			coalesce(convert(varchar(50), AssetId),'0') + '~' + 
				//			coalesce(convert(varchar(50), LastObservationId),'0') + '~' +  
				//			coalesce(convert(varchar(50), JBTStandardObservationId),'') + '~' +  
				//			coalesce(LastObservationTextValue,'') + '~' + 
				//			coalesce(convert(varchar(10),LastObservationQuality),'') + '~' +
				//			coalesce(convert(varchar(1),IsAlarm),'0') + '~' + 
				//			coalesce(convert(varchar(1),IsWarning),'0') + '~' + 
				//			coalesce(ValueWhenActive,'1')





				return {
					Id: +tarray[0],
					Name: tarray[1],
					SiteId: +tarray[2],
					LastObservationCreationDate: utilityService.GetUTCDateFromLocalDate(new Date(+tarray[3])),
					LastObservationDate: utilityService.GetUTCDateFromLocalDate(new Date(+tarray[4])),
					AssetId: +tarray[5],
					LastObservationId: +tarray[6],
					JBTStandardObservationId: +tarray[7],
					LastObservationTextValue: tarray[8],
					LastObservationQuality: +tarray[9],
					IsAlarm: +tarray[10] == 1,
					IsWarning: +tarray[11] == 1,
					ValueWhenActive: tarray[12] == '' ? '1' : tarray[12],
					GateName: tarray[13],
					AssetName: tarray[14],
					DataType: 'DB'
				}

			});
		}


		function GetStandardCacheTagObjectFromDatabaseFields(entityFromDatabase) {

			var site = cache.sites.first(function (s) { return s.Id == entityFromDatabase.SiteId });

			//console.log("Pre-loaded observation = %O", entityFromDatabase);

			var plcUTCDate = !service.dataSourceIsLocal
				? utilityService.GetUTCDateFromLocalDate(new Date(entityFromDatabase.LastObservationDate))
				: new Date(entityFromDatabase.LastObservationDate);
			var obsCreatedDate = !service.dataSourceIsLocal
				? utilityService.GetUTCDateFromLocalDate(new Date(entityFromDatabase.LastObservationCreationDate))
				: new Date(entityFromDatabase.LastObservationCreationDate);


			var formattedCacheTag = {
				DataType: 'DB',
				PLCUTCDate: plcUTCDate,
				ObservationUTCDate: obsCreatedDate,
				IsAlarm: entityFromDatabase.IsAlarm,
				IsWarning: entityFromDatabase.IsWarning,
				AssetId: +entityFromDatabase.AssetId,
				TagId: +entityFromDatabase.Id,
				SiteId: +entityFromDatabase.SiteId,
				ObservationId: +entityFromDatabase.LastObservationId,
				JBTStandardObservationId: +entityFromDatabase.JBTStandardObservationId,

				SiteName: site ? site.Name : null,
				TagName: entityFromDatabase.Name || entityFromDatabase.TagName,
				Value: entityFromDatabase.LastObservationTextValue,
				Quality: entityFromDatabase.LastObservationQuality,
				JBTStandardObservation: cache.jbtStandardObservationsObject[entityFromDatabase.JBTStandardObservationId.toString()],
				Severity: entityFromDatabase.IsCritical ? 'Critical' : entityFromDatabase.IsAlarm ? 'Alarm' : entityFromDatabase.IsWarning ? 'Warning' : '',
				ValueWhenActive: entityFromDatabase.ValueWhenActive || "1"

			}

			formattedCacheTag.PLCUTCDateMS = formattedCacheTag.PLCUTCDate.getTime();
			formattedCacheTag.PLCLocalDate = utilityService.GetLocalDateFromUTCDate(formattedCacheTag.PLCUTCDate);
			formattedCacheTag.ObservationUTCDateMS = formattedCacheTag.ObservationUTCDate.getTime();
			formattedCacheTag.ObservationLocalDate = utilityService.GetLocalDateFromUTCDate(formattedCacheTag.ObservationUTCDate);

			AttachShortTagNameToTagData(formattedCacheTag);

			return formattedCacheTag;

		}



		//service.dataSourceIsLocal = document.URL.indexOf("localhost/iops/") > 0;
		service.dataSourceIsLocal = true;


		//***G
		//++SignalR Observation Update - push messages in real-time.
		//+This function is run whenever each signalR message arrives.
		//***G
		var tagLookupAverage = 0;
		var tagSignalRReportingCounter = 0;

		function UpdateObservationFromSignalR(signalRData) {
			//Split the change data out into the components

			var t0 = performance.now();


			service.Statistics.SignalR.MessageCount++;
			signalRData = GetJsonFromSignalR(signalRData);


			signalRData.DataType = 'signalR';


			signalRData.PLCUTCDate = new Date(signalRData.PLCUTCDate);
			signalRData.PLCUTCDateMS = signalRData.PLCUTCDate.getTime();
			signalRData.PLCLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.PLCUTCDate);

			signalRData.ObservationUTCDate = new Date(signalRData.ObservationCreationUTCDate);
			signalRData.ObservationUTCDateMS = signalRData.ObservationUTCDate.getTime();
			signalRData.ObservationLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.ObservationUTCDate);

			signalRData.AssetId = +signalRData.AssetId;
			signalRData.TagId = +signalRData.TagId;
			signalRData.SiteId = +signalRData.SiteId;
			signalRData.ObservationId = +signalRData.ObservationId;
			signalRData.JBTStandardObservationId = +signalRData.JBTStandardObservationId;
			signalRData.JBTStandardObservation = cache.jbtStandardObservationsObject[signalRData.JBTStandardObservationId.toString()];
			signalRData.IsWarning = signalRData.IsWarning == '1';
			signalRData.IsAlarm = signalRData.IsAlarm == '1';
			signalRData.IsCritical = signalRData.IsCritical == '1';
			signalRData.ValueWhenActive = signalRData.ValueWhenActive || "1",
				signalRData.Severity = signalRData.IsCritical ? 'Critical' :
					signalRData.IsAlarm ? 'Alarm' :
					signalRData.IsWarning ? 'Warning' :
					''


			AttachShortTagNameToTagData(signalRData);

			if (tagSignalRReportingCounter++ < 50) {
				console.log("SignalR Tag Update = %O", signalRData);
			}


			LoadSignalRObservationToInventory(signalRData);

		}

		//***G


		service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory = function (assetId) {
			return service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetId.toString(), false);
		}




		function AttachShortTagNameToTagData(tag) {
			if (tag.TagName) {

				var tagNameSplit = tag.TagName.split('|');
				if (tagNameSplit.length > 4) {
					tag.ShortTagName = tagNameSplit.last().replace('.PCA.', '').replace('.GPU.', '').replace('.PBB.', '');
				} else {
					tag.ShortTagName = tag.TagName.replace('Airport_', '');
				}

			}



		}
		var tag = null;

		//==============================================================================
		//+MetadataCounterUpdate - Reset all the countdown timers to 10000.
		//This happens as a result of a signalR message arrival. This routine is
		//called with the affected tag as the parameter.
		//==============================================================================
		function MetadataCounterUpdate(obj, isTag) {


			if (obj && obj.Metadata && obj.Metadata.Statistics) {
				obj.Metadata.Statistics.ChangeCount++;
				obj.Metadata.Statistics.MessageCount++;

				//Check for an observation metadata object. It is the only one with the ObservationCreationDate property
				if (obj.ObservationUTCDate) {

					var siteReference = cache.sites.first(function (site) { return site.Id == obj.SiteId });

					var sqlOffsetForSite = siteReference ? siteReference.KepwareSQLTimeDifferenceMSFromCentral : 0;
					obj.Metadata.Statistics.KepwareSQLTimeDifferenceMSFromCentral = sqlOffsetForSite;


					if (obj.DataType == 'DB') {
						obj.Metadata.Statistics.MainDatabaseToBrowserTimeMS = null;
						obj.Metadata.Statistics.KepwareToBrowserTimeMS = null;
						obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS = null;
					} else {
						obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS =
							obj.ObservationUTCDateMS - obj.PLCUTCDateMS - sqlOffsetForSite;
						if (obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS > 10000) {
							obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS = null;
						}
						obj.Metadata.Statistics.MainDatabaseToBrowserTimeMS =
							utilityService.GetUTCDateFromLocalDate(new Date()).getTime() - obj.ObservationUTCDateMS;
						obj.Metadata.Statistics.KepwareToBrowserTimeMS = utilityService.GetUTCDateFromLocalDate(new Date()).getTime() -
							obj.PLCUTCDateMS -
							sqlOffsetForSite;
					}
					//console.log('Updated metadata for tag ' + obj.TagName + ' = %O', obj);


				}


				obj.Metadata.UpdateCountDowns.OneSecond =
					obj.Metadata.UpdateCountDowns.TenSecond =
					obj.Metadata.UpdateCountDowns.ThirtySecond =
					obj.Metadata.UpdateCountDowns.OneMinute =
					obj.Metadata.UpdateCountDowns.FiveMinute =
					obj.Metadata.UpdateCountDowns.FifteenMinute =
					obj.Metadata.UpdateCountDowns.ThirtyMinute =
					obj.Metadata.UpdateCountDowns.OneHour = 10000;


				//If this is a tag obect, then place it in the countdown timers area of the operations object
				if (isTag) {
					if (!operationMetadata.tagsWithOneSecondCountdowns.find(function (t) { return t.TagId == obj.TagId })) {
						operationMetadata.tagsWithOneSecondCountdowns.push(obj);
					}
				}
			}
		}





		function LoadSignalRObservationToInventory(newObservation) {
			//+Load the tag represented by the observation into the local inventory of tags.
			if (newObservation.IsTest) {
				//console.log("Tag = %O", newObservation);
			}
			var tagThatWasInCache;


			if (newObservation.TagId || newObservation.TagName) {
				//Scan the inventory for it.

				if (newObservation.TagId) {
					//console.log("Checking for tagid");
					//var time0 = performance.now();
					tagThatWasInCache = cache.tagsObject[newObservation.TagId.toString()];
					//console.log("Object Lookup = " + (performance.now() - time0) + "ms");
					//time0 = performance.now();
					//tagThatWasInCache = cache.tags.first(function (et) { return et.TagId == newObservation.TagId });
					//console.log("First() Lookup = " + (performance.now() - time0) + "ms");
				}


				//If we found the tag in the inventory, update it in our cache
				if (tagThatWasInCache) {

					if (!tagThatWasInCache.UpdateCount) {
						tagThatWasInCache.UpdateCount = 0;
					}
					tagThatWasInCache.UpdateCount++;

					//console.log("Tag found in inventory = %O", tag);
					if (newObservation.DataType == 'signalR') {
						tagThatWasInCache.DataType = 'signalR';
					}

					if (!tagThatWasInCache.Observations) {

						tagThatWasInCache.Observations = [];
					}
					if (!tagThatWasInCache.Asset) {
						//Set the asset object for the tag in the inventory if not yet already set.
						tagThatWasInCache.Asset = cache.assetsObject[tagThatWasInCache.AssetId.toString()];
						if (tagThatWasInCache.Asset) {
							//If we found a matching asset then add this tag to the tags collection for the asset.
							if (!tagThatWasInCache.Asset.Tags) {
								tagThatWasInCache.Asset.Tags = [];
							}
							tagThatWasInCache.Asset.Tags.push(tagThatWasInCache);
						}
					}

					tagThatWasInCache.LastObservationTextValue = newObservation.Value;

					MetadataCounterUpdate(tagThatWasInCache);
					//console.log("Tag found in inventory (updated Metadata) = %O", tagThatWasInCache);
					if (tagThatWasInCache.Asset) {
						//MetadataCounterUpdate(tagThatWasInCache.Asset);
						//MetadataCounterUpdate(tagThatWasInCache.Asset.Company);
						//MetadataCounterUpdate(tagThatWasInCache.Asset.System);
						//MetadataCounterUpdate(tagThatWasInCache.Asset.Site);
					}


					if (tagThatWasInCache.PLCUTCDateMS <= newObservation.PLCUTCDateMS && tagThatWasInCache.ObservationId != newObservation.ObservationId) {


						tagThatWasInCache.PLCUTCDate = newObservation.PLCUTCDate;
						tagThatWasInCache.PLCUTCDateMS = newObservation.PLCUTCDateMS;
						tagThatWasInCache.PLCLocalDate = newObservation.PLCLocalDate;
						tagThatWasInCache.ObservationUTCDate = newObservation.ObservationUTCDate;
						tagThatWasInCache.ObservationUTCDateMS = newObservation.ObservationUTCDateMS;
						tagThatWasInCache.ObservationLocalDate = newObservation.ObservationLocalDate;
						tagThatWasInCache.PreviousObservationId = tagThatWasInCache.ObservationId;
						tagThatWasInCache.ObservationId = +newObservation.ObservationId;
						tagThatWasInCache.Metadata.Status.LastValueWasHistorical = false;
						tagThatWasInCache.Value = newObservation.Value;
						tagThatWasInCache.ValueWhenActive = newObservation.ValueWhenActive || "1";

					} else {
						if (tagThatWasInCache.DataType == 'signalR' && tagThatWasInCache.ObservationId != newObservation.ObservationId) {
							//console.log("Tag is from signalR and is historical. Tag in inventory = %O", tagThatWasInCache);
							//console.log("Tag is from signalR and is historical. Tag from signalR = %O", newObservation);
							tagThatWasInCache.Metadata.Status.LastValueWasHistorical = true;
						}
					}

					//Attach the JBTStandardObservation object to the tag.
					tagThatWasInCache.JBTStandardObservation = cache.jbtStandardObservationsObject[tagThatWasInCache.JBTStandardObservationId.toString()];
					tag = tagThatWasInCache;

				} else {
					//+We did not find the tag in the inventory.
					//Add the tag to the cache with an attached metadata object
					if (newObservation.IsTest) {
						//console.log("Tag NOT found in inventory.....");
					}

					AttachBlankMetadataObject(newObservation);
					//Attach the asset to the tag, and attach the tags collection to the asset - IF the asset is found


					var asset = cache.assetsObject[newObservation.AssetId.toString()];

					//console.log("Asset Found = %O", asset);
					if (asset) {
						if (!asset.Tags) {
							asset.Tags = [];
							asset.Tags.push(newObservation);
						} else {

							var assetTag = asset.Tags.first(function (t) { return t.TagId == newObservation.TagId });

							if (!assetTag) {
								asset.Tags.push(newObservation);
							}
						}

						newObservation.Asset = asset;
					}

					var isTag = true;

					MetadataCounterUpdate(newObservation, isTag);

					if (newObservation.Asset) {
						//MetadataCounterUpdate(newObservation.Asset);
						//MetadataCounterUpdate(newObservation.Asset.Company);
						//MetadataCounterUpdate(newObservation.Asset.System);
						//MetadataCounterUpdate(newObservation.Asset.Site);
					}

					cache.tagsObject[newObservation.TagId.toString()] = newObservation;
					newObservation.UpdateCount = 1;

					cache.tags.push(newObservation);

					tag = newObservation;
					//console.log("New Tag Entry = %)",newObservation);


				}
			}
			if (!isFinite(newObservation.Value) && newObservation.Value.indexOf('oken:') != 1 && newObservation.Value.indexOf('rue') != 1 && newObservation.Value.indexOf('alse') != 1) {
				if (Global.User.Username == 'jim') {
					//console.log("Text Observation data Arrived. TagName " + tag.TagName + " --- " + tag.Value);
				}
			}
			if (tag.DataType == 'signalR') {

				$rootScope.$broadcast("dataService.TagUpdate", tag);
			} else {
				//$rootScope.$broadcast("dataService.TagUpdate", tag);
				//console.log("DB version was detected - no broadcast necessary");
			}

			return tag;

		}

		//$interval(function() {
		//	console.log("Top 5 Updated Tags = %O", cache.tags.orderByDescending(function(t){return t.UpdateCount}).take(5));
		//},5000);

		//===========================================================================================================
		//+Attach a metadata object to the given input object. 
		//This is used by view controllers to implement 
		//color fade outs, removal after inactivity, etc. Since the dataService has to track the data, it will
		//reset these back to 10000 upon any data change anywhere.
		//10000 is used as an the update initial value so that we can get the resulution we need.
		//===========================================================================================================
		function AttachBlankMetadataObject(obj) {
			obj.Metadata = {
				UpdateCountDowns: {
					OneSecond: 0,
					TenSecond: 0,
					ThirtySecond: 0,
					OneMinute: 0,
					FiveMinute: 0,
					FifteenMinute: 0,
					ThirtyMinute: 0,
					OneHour: 0
				},
				Statistics: {
					ChangeCount: 0,
					MessageCount: 0,
					PreviousMessageCount: 0,
					MessagesPerSecond: 0,
					IsLastUpdateHistorical: false,
					KepwareToMainDatabaseTimeMS: 0,
					MainDatabaseToBrowserTimeMS: 0,
					KepwareToBrowserTimeMS: 0,
					KepwareSQLTimeDifferenceMSFromCentral: 0
				},
				Status: {
					LastValueWasHistorical: false
				}

			};
			return obj;
		}


		//***G
		//++One Second Interval
		//+Once per second, update the messages per second on all entities.
		//***G
		$interval(function () {
			service.Statistics.SignalR.MessagesPerSecond = service.Statistics.SignalR.MessageCount - service.Statistics.SignalR.PreviousMessageCount;
			service.Statistics.SignalR.PreviousMessageCount = service.Statistics.SignalR.MessageCount;
		}, 1000);


		//+Update the messages per second statistical entry for the given entity metadata.
		//function UpdateMessagesPersecondForEntity(entity) {
		//	if (entity) {
		//		entity.Metadata.Statistics.MessagesPerSecond = entity.Metadata.Statistics.MessageCount - entity.Metadata.Statistics.PreviousMessageCount;
		//		entity.Metadata.Statistics.PreviousMessageCount = entity.Metadata.Statistics.MessageCount;

		//	}

		//}





		//***G
		//++Five Times Per Second Interval
		//+Five times per second, update the messages per second on any entity.
		//***G

		$interval(function () {


			cache.tags.where(function (t) { return t.Metadata.UpdateCountDowns.OneSecond > 0 })
				.select(function (t) {
					t.Metadata.UpdateCountDowns.OneSecond -= 2000;
					if (t.Metadata.UpdateCountDowns.OneSecond < 0) {
						t.Metadata.UpdateCountDowns.OneSecond = 0;
					}
				});


			operationMetadata.tagsWithOneSecondCountdowns.select(function (t) {
				t.Metadata.UpdateCountDowns.OneSecond -= 2000;
				if (t.Metadata.UpdateCountDowns.OneSecond < 0) {
					t.Metadata.UpdateCountDowns.OneSecond = 0;
				}
			});

			operationMetadata.tagsWithOneSecondCountdowns = operationMetadata.tagsWithOneSecondCountdowns.where(function (t) {
				return t.Metadata.UpdateCountDowns.OneSecond != 0;
			});





			//cache.companies.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.sites.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.systems.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.assets.select(function (e) { UpdateCountDownsForEntity(e) });

		}, 200);


		//***G
		//++Temporary Polling till SignalR comes back up.
		//***G
		//var tagPollStartDate = new Date();

		//$interval(function () {

		//	odataService.GetResource("iOPS", "Tags")
		//				.odata()
		//				.filter("LastModifiedDate", ">", utilityService.GetUTCQueryDate(tagPollStartDate))
		//				.select([
		//					"Id", "Name", "JBTStandardObservationId", "AssetId", "LastModifiedDate", "LastObservationDate", "LastObservationId", "LastObservationTextValue"
		//				])
		//				.query().$promise.then(function(data) {


		//					if (data.length > 0) {

		//						tagPollStartDate = data.max(function(tag) { return tag.LastModifiedDate });

		//						data.forEach(function (tag) {

		//							var emulatedSignalRData = 'Date!' + tag.LastObservationDate + '~' + 
		//																'ObservationId!' + tag.LastObservationId + '~' +
		//																'TagId!' + tag.Id + '~' + 
		//																'TagName!' + tag.Name + '~' + 
		//																'Value!' + tag.LastObservationTextValue + '~' +
		//																'Quality!true';


		//							UpdateTagFromSignalR(emulatedSignalRData);
		//						});
		//					}


		//				});


		//}, 1000);






		//***G
		//++One Minute Interval
		//+Issue any odata query to keep the OData source live and loaded
		//***G
		$interval(function () {
			//This is a small collection.
			//It is just a keepalive for the OData source service.
			return odataService.GetEntityById("iOPS", "Sites", 1);




		}, 300000);


		//***G
		//++Five Second Interval
		//+Sort the cache.tags collection in order of last received.
		//+This will make the lookup for frequent items faster.
		//***G
		//$interval(function () {
		//	//This is a small collection.
		//	//It is just a keepalive for the OData source service.
		//	return odataService.GetEntityById("iOPS", "Sites", 1);




		//}, 10000);






		//***
		//+Decrement the metadata time window counters for the given entity. 
		//***
		function UpdateCountDownsForEntity(entity) {

			if (entity) {
				if (entity.Metadata.UpdateCountDowns.OneSecond > 0) {
					entity.Metadata.UpdateCountDowns.OneSecond -= 1000;
				}
				if (entity.Metadata.UpdateCountDowns.OneSecond < 0) {
					entity.Metadata.UpdateCountDowns.OneSecond = 0;
				}

				if (entity.Metadata.UpdateCountDowns.TenSecond > 0) {
					entity.Metadata.UpdateCountDowns.TenSecond -= 100;
				}
				return entity.Metadata.UpdateCountDowns.OneSecond > 0;
				//if (entity.Metadata.UpdateCountDowns.ThirtySecond > 0) {
				//	entity.Metadata.UpdateCountDowns.ThirtySecond -= 33.33 * 2;
				//}
				//if (entity.Metadata.UpdateCountDowns.OneMinute > 0) {
				//	entity.Metadata.UpdateCountDowns.OneMinute -= 16.66 * 2;
				//}
				//if (entity.Metadata.UpdateCountDowns.FiveMinute > 0) {
				//	entity.Metadata.UpdateCountDowns.FiveMinute -= 3.332 * 2;
				//}
				//if (entity.Metadata.UpdateCountDowns.FifteenMinute > 0) {
				//	entity.Metadata.UpdateCountDowns.FifteenMinute -= 1.111 * 2;
				//}
				//if (entity.Metadata.UpdateCountDowns.ThirtyMinute > 0) {
				//	entity.Metadata.UpdateCountDowns.ThirtyMinute -= .5553 * 2;
				//}
				//if (entity.Metadata.UpdateCountDowns.OneHour > 0) {
				//	entity.Metadata.UpdateCountDowns.OneHour -= .27766 * 2;
				//}
			}

		}






		return service;




	}


	angular
		.module("app")
		.factory('dataService',
			[
				'odataService',
				"$rootScope",
				"$q",
				"$interval",
				"utilityService",
				"$timeout",
				"indexedDBService",
				"signalR",
				"$odata",
				DataService]);



}());	//dataService