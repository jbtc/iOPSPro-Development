(function () {
	"use strict";





	function DataService(odataService, $rootScope, $q, $interval, utilityService, $timeout, indexedDBService, signalR, $odata) {


		//console.log("dataService created");

		var service = {};


		var cache = {
			companies: [],
			sites: [],
			systems: [],
			systemTypes: [],
			assets: [],
			assetTypes: [],
			tags: [],
			assetGraphics: [],
			assetGraphicVisibleValues: [],
			widgetTypes: [],
			jbtStandardObservations: [],
			bhsJamAlarms: [],
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
		//***G
		//++Intercept all database updates here and integrate into the data structures.
		$rootScope.$on("AssetModel", function (event, assetModel) {

			console.log("AssetModel change. AssetModel = %O", assetModel);
			cache.assetModels = [assetModel].concat(cache.assetModels).distinct(function (a, b) { return a.Id == b.Id });


			assetModel.Assets = cache.assets.where(function (a) { return a.AssetModelId == assetModel.Id });


		});
		//***G


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




		service.GetExpandedDashboardById = function (id) {
			return service.GetIOPSResource("Dashboards")
				.expand("DashboardTimeScope")
				.get(id).$promise
				.then(function (data) {

					service.SetDashboardDerivedDatesFromDayCount(data);

					return data;

				});

		}

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
			indexedDBService.getDBInstance("iOPS", 43, [
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
					keyName: "Id"
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
				console.log("LocalDB retrieved...");
				localDB = db;

				//+Asyncronously and simultaneously load data collections
				$q.all([
					GetODataSites().then(function (data) {
						cache.sites = data.select(function (d) {
							return AttachBlankMetadataObject(d);
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
							return AttachBlankMetadataObject(d);
						});
						console.log("Systems Loaded = %O", data);

					}),


					GetODataAssets().then(function (data) {
						cache.assets = data.select(function (d) {
							return AttachBlankMetadataObject(d);
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
							return AttachBlankMetadataObject(d);
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

		$rootScope.$on("Company.Deleted", function (event, deletedCompany) {
			//Find the global companies array and update it.
			var cacheCompany = JBTData.Companies.first(function (c) { return c.Id == deletedCompany.Id });

			if (cacheCompany) {

				JBTData.Companies = JBTData.Companies.where(function (c) { return c.Id != deletedCompany.Id });
			}



		});



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
				console.log("localdb Systems = " + dbSystems.length);
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
		$rootScope.$on("Observation", function (event, signalRData) {
			UpdateObservationFromSignalR(signalRData);
		});

		$rootScope.$on("Tag", function (event, signalRData) {
			UpdateTagFromSignalR(signalRData);
		});






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
					GateName: tag.GateName && tag.GateName.replace('.',''),
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
			tags
				.where(function (t) { return !t.MarkedForDelete })
				.forEach(function (tag) {

					var site = cache.sites.first(function (s) { return s.Id == tag.SiteId });

					if (!cache.tags.any(function (t) { return t.TagId == tag.Id })) {
						var signalRData = {
							DataType: 'DB',
							PLCUTCDate: !service.dataSourceIsLocal
								? utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate))
								: new Date(tag.LastObservationDate),
							ObservationUTCDate: service.dataSourceIsLocal
								? new Date(tag.LastObservationDate)
								: utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate)),

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

						LoadSignalRObservationToInventory(signalRData);

					}


				});

		}


		service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds =
			function(assetIdList, alarmsOnly) {


				var notLoadedAssetIds = ("" + assetIdList).split(',').distinct().where(function(assetId) {

					var asset = cache.assets.first(function(a) { return a.Id == +assetId });
					return (!alarmsOnly && asset && !asset.AllTagsLoaded) || (alarmsOnly && asset && !asset.AllAlarmTagsLoaded);

				});

				//console.log("notLoadedAssetIds = %O", notLoadedAssetIds);
				if (notLoadedAssetIds.length == 0) {
					return $q.when(true);
				}

				//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.
				if (notLoadedAssetIds.length > 0) {

					

					return service.GetIOPSWebAPIResource(alarmsOnly ? "GSAlarmTagsByListOfAssetIds" : "GSTagsByListOfAssetIds")
						.query({
								assetIds: assetIdList
							},
							function(data) {
								data
									.where(function(tag) {
										return tag.Name.indexOf('|') > 0
									}) //Only the new format tags have pipe symbols in the name.
									.where(function(t) { return !t.MarkedForDelete })
									.select(function(tag) {

										var formattedCacheTagObject = GetStandardCacheTagObjectFromDatabaseFields(tag);
										var loadedTag = LoadSignalRObservationToInventory(formattedCacheTagObject);

										if (tag.PreviousObservationId && tag.PreviousObservationId != tag.ObservationId) {
											//console.log("broadcasting tag update for refresh = %O", tag);
											$rootScope.$broadcast("dataService.TagUpdate", loadedTag);
										}

									});

								assetIdList.split(',').forEach(function(assetId) {
									var asset = cache.assets.first(function(a) { return a.Id == +assetId });

									//Flag the asset as having all of its tags now loaded if it was not just the alarms loaded. 
									if (asset) {
										asset.AllTagsLoaded = true;
									}
								});


							}).$promise;
				}
			}

		service.RefreshAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds = function (assetIdList) {


			//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.

			var maxDate = new Date();
			maxDate = maxDate.setDate(maxDate.getDate() - .05);
			maxDate = utilityService.GetUTCQueryDate(maxDate);


			return service.GetIOPSWebAPIResource("GSTagsUpdatedInLastFiveMinutesByListOfAssetIds")
				.query({
						assetIds: assetIdList
					},
					function (data) {
						data
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

							//Flag the asset as having all of its tags now loaded if it was not just the alarms loaded. 
							if (asset) {
								asset.AllTagsLoaded = true;
							}
						});
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

				AssetId: +entityFromDatabase.AssetId,
				TagId: +entityFromDatabase.Id,
				SiteId: +entityFromDatabase.SiteId,
				ObservationId: +entityFromDatabase.LastObservationId,
				JBTStandardObservationId: +entityFromDatabase.JBTStandardObservationId,

				SiteName: site ? site.Name : null,
				TagName: entityFromDatabase.Name || entityFromDatabase.TagName,
				Value: entityFromDatabase.LastObservationTextValue,
				Quality: entityFromDatabase.LastObservationQuality,
				JBTStandardObservation: cache.jbtStandardObservations.first(function (s) {
					return s.Id == entityFromDatabase.JBTStandardObservationId
				}),
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

		service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory = function (assetId) {


			var asset = cache.assets.first(function (a) { return a.Id == assetId });

			if (asset.Tags.length < 40) {
				asset.AllTagsLoaded = false;
			}

			if (asset.AllTagsLoaded) {
				return $q.when(true);
			}

			//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.
			if (!asset.AllTagsLoaded) {
				return service.GetIOPSResource("Tags")
					//.expand("LastObservation")
					.filter("AssetId", assetId)
					.select(["Id", "Name", "SiteId", "LastObservationDate", "LastObservationCreationDate", "AssetId",
						"LastObservationId", "JBTStandardObservationId",
						"LastObservationTextValue", "LastObservationQuality", "IsAlarm", "IsWarning", "ValueWhenActive"])
					.query()
					.$promise
					.then(function (data) {

						//console.log("GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory Data = %O", data);
						data
							.where(function (tag) { return tag.Name.indexOf('|') > 0 }) //Only the new format tags have pipe symbols in the name.
							.where(function (t) { return !t.MarkedForDelete })
							.select(function (tag) {

								var formattedCacheTagObject = GetStandardCacheTagObjectFromDatabaseFields(tag);
								LoadSignalRObservationToInventory(formattedCacheTagObject);

							});
					})
					.then(function () {
						var asset = cache.assets.first(function (a) { return a.Id == assetId });

						//Flag the asset as having all of its tags now loaded. 
						if (asset) {
							asset.AllTagsLoaded = true;
						}
					});
			}
		}




		service.dataSourceIsLocal = document.URL.indexOf("localhost/iops/") > 0;


		//***G
		//++SignalR Observation Update - push messages in real-time.
		//+This function is run whenever each signalR message arrives.
		//***G
		var tagLookupAverage = 0;
		function UpdateObservationFromSignalR(signalRData) {
			//Split the change data out into the components

			var t0 = performance.now();


			service.Statistics.SignalR.MessageCount++;
			signalRData = GetJsonFromSignalR(signalRData);

			//if (signalRData.TagName &&  signalRData.TagName.indexOf('B2|B34|') > 0 && signalRData.TagName.indexOf('AIRCRAFT_DOCKED') > 0) {
			//	console.log("B34 SignalR data Arrived in dataService Service = %O", signalRData);
			//}

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
			signalRData.JBTStandardObservation = cache.jbtStandardObservations.first(function (s) { return s.Id == signalRData.JBTStandardObservationId });
			signalRData.IsWarning = signalRData.IsWarning == '1';
			signalRData.IsAlarm = signalRData.IsAlarm == '1';
			signalRData.IsCritical = signalRData.IsCritical == '1';
			signalRData.ValueWhenActive = signalRData.ValueWhenActive || "1",
				signalRData.Severity = signalRData.IsCritical ? 'Critical' :
					signalRData.IsAlarm ? 'Alarm' :
					signalRData.IsWarning ? 'Warning' :
					''


			AttachShortTagNameToTagData(signalRData);

			//console.log("Loading signalr tag into inventory tag = ");
			LoadSignalRObservationToInventory(signalRData);

		}

		//***G




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

					var siteReference = cache.sites.first(function(site) { return site.Id == obj.SiteId });

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
			//+Lo ad the tag represented by the observation into the local inventory of tags.
			//console.log("Tag = %O", obs);
			if (newObservation.TagId || newObservation.TagName) {
				//Scan the inventory for it.


				if (newObservation.TagId) {
					//console.log("Checking for tagid");
					tag = cache.tags.first(function (et) { return et.TagId == newObservation.TagId });
				}

				if (!tag && newObservation.TagName) {
					tag = cache.tags.first(function (et) { return et.TagName == newObservation.TagName });
				}
				//If we found the tag in the inventory, update it in our cache
				if (tag) {

					//console.log("Tag found in inventory = %O", tag);
					if (tag.DataType == 'DB' && newObservation.DataType == 'signalR') {
						tag.DataType = 'signalR';
					}

					if (!tag.Observations) {

						tag.Observations = [];
					}
					if (!tag.Asset) {
						//Set the asset object for the tag in the inventory if not yet already set.
						tag.Asset = cache.assets.first(function (asset) { return asset.Id == tag.AssetId });
						if (tag.Asset) {
							//If we found a matching asset then add this tag to the tags collection for the asset.
							if (!tag.Asset.Tags) {
								tag.Asset.Tags = [];
							}
							tag.Asset.Tags.push(tag);
						}
					}

					tag.LastObservationTextValue = newObservation.Value;

					MetadataCounterUpdate(tag);
					//console.log("Tag found in inventory (updated Metadata) = %O", tag);
					if (tag.Asset) {
						MetadataCounterUpdate(tag.Asset);
						MetadataCounterUpdate(tag.Asset.Company);
						MetadataCounterUpdate(tag.Asset.System);
						MetadataCounterUpdate(tag.Asset.Site);
					}


					if (tag.PLCUTCDateMS <= newObservation.PLCUTCDateMS && tag.ObservationId != newObservation.ObservationId) {


						tag.PLCUTCDate = newObservation.PLCUTCDate;
						tag.PLCUTCDateMS = newObservation.PLCUTCDateMS;
						tag.PLCLocalDate = newObservation.PLCLocalDate;
						tag.ObservationUTCDate = newObservation.ObservationUTCDate;
						tag.ObservationUTCDateMS = newObservation.ObservationUTCDateMS;
						tag.ObservationLocalDate = newObservation.ObservationLocalDate;
						tag.PreviousObservationId = tag.ObservationId;
						tag.ObservationId = +newObservation.ObservationId;
						tag.Metadata.Status.LastValueWasHistorical = false;
						tag.Value = newObservation.Value;
						tag.ValueWhenActive = newObservation.ValueWhenActive || "1";
					} else {
						if (tag.DataType == 'signalR' && tag.ObservationId != newObservation.ObservationId) {
							//console.log("Tag is from signalR and is historical. Tag in inventory = %O", tag);
							//console.log("Tag is from signalR and is historical. Tag from signalR = %O", newObservation);
							tag.Metadata.Status.LastValueWasHistorical = true;
						}
					}

				} else {
					//We did not find the tag in the inventory.
					//Add the tag to the cache with an attached metadata object
					//console.log("Tag NOT found in inventory.....");
					AttachBlankMetadataObject(newObservation);
					//Attach the asset to the tag, and attach the tags collection to the asset - IF the asset is found
					var asset = cache.assets.first(function (asset) { return asset.Id == +newObservation.AssetId });

					//console.log("Asset Found = %O", asset);
					if (asset) {
						if (!asset.Tags) {
							asset.Tags = [];
						}
						asset.Tags.unshift(newObservation);
						asset.Tags = asset.Tags.distinct(function (a, b) { return a.TagId == b.TagId });
						newObservation.Asset = asset;
					}

					var isTag = true;
					MetadataCounterUpdate(newObservation, isTag);

					if (newObservation.Asset) {
						MetadataCounterUpdate(newObservation.Asset);
						MetadataCounterUpdate(newObservation.Asset.Company);
						MetadataCounterUpdate(newObservation.Asset.System);
						MetadataCounterUpdate(newObservation.Asset.Site);
					}


					cache.tags.push(newObservation);
					MetadataCounterUpdate(newObservation, true);

					tag = newObservation;
					//console.log("New Tag Entry = %)",newObservation);


				}
			}
			if (!isFinite(newObservation.Value) && newObservation.Value.indexOf('oken:') != 1 && newObservation.Value.indexOf('rue') != 1 && newObservation.Value.indexOf('alse') != 1) {
				if (Global.User.Username == 'jim') {
					console.log("Text Observation data Arrived. TagName " + tag.TagName + " --- " + tag.Value);
				}
			}
			if (tag.DataType == 'signalR') {

				//if (tag.TagName.indexOf('B2|B34|') > 0 && tag.TagName.indexOf('AIRCRAFT_DOCKED') > 0) {
				//	console.log("B34 SignalR data Arrived in dataService - before broadcast = %O", tag);
				//}


				$rootScope.$broadcast("dataService.TagUpdate", tag);
			} else {
				//console.log("DB version was detected - no broadcast necessary");
			}

			return tag;

		}



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
					t.Metadata.UpdateCountDowns.OneSecond -= 1000;
					if (t.Metadata.UpdateCountDowns.OneSecond < 0) {
						t.Metadata.UpdateCountDowns.OneSecond = 0;
					}
				});


			operationMetadata.tagsWithOneSecondCountdowns.select(function (t) {
				t.Metadata.UpdateCountDowns.OneSecond -= 1000;
				if (t.Metadata.UpdateCountDowns.OneSecond < 0) {
					t.Metadata.UpdateCountDowns.OneSecond = 0;
				}
			});

			operationMetadata.tagsWithOneSecondCountdowns = operationMetadata.tagsWithOneSecondCountdowns.where(function(t) {
				return t.Metadata.UpdateCountDowns.OneSecond != 0;
			});





			//cache.companies.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.sites.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.systems.select(function (e) { UpdateCountDownsForEntity(e) });
			//cache.assets.select(function (e) { UpdateCountDownsForEntity(e) });

		}, 100);


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
