(function () {
	"use strict";


	function APIInterceptor($rootScope, store, utilityService) {

		var service = {};
		var startTime = Date.now();
		//console.log("APIInterceptor service created.");
		service.ODataAccessToken = null;

		service.request = function (config) {

			if (!service.ODataAccessToken || service.ODataAccessToken == "not-authorized") {
				var currentUser = store.get('currentUser');
				service.ODataAccessToken = currentUser ? currentUser.ODataAccessToken : "not-authorized";
			}

			//console.log("APIInterceptor adding authorization header = " + accessToken);
			if (service.ODataAccessToken) {
				config.headers.authorization = service.ODataAccessToken;
			}
			if (config.url.indexOf("odataprod") > 3) {
				//console.log(Date.now() - startTime + "  - Resource Request: " + config.url);
				startTime = Date.now();
			}
			return config;
		};

		service.responseError = function (response) {
			if (response.status === 401) {
				//$rootScope.$broadcast('logout');
			}
			return response;
		};

		return service;

	}



	angular
		.module("app")
		.factory('APIInterceptor', ['$rootScope', 'store', "utilityService", APIInterceptor]);





}());	//APIInterceptor

(function () {
	"use strict";





	function DataService(odataService, $rootScope, $q, $interval, utilityService, $timeout, indexedDBService, signalR) {


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
			if (dashboard.CustomStartDate && dashboard.CustomEndDate) {

				dashboard.derivedStartDate = dashboard.CustomStartDate;
				dashboard.webApiParameterStartDate = utilityService.GetUTCQueryDate(dashboard.CustomBeginDate);
				dashboard.derivedEndDate = dashboard.CustomEndDate;
				dashboard.webApiParameterEndDate = utilityService.GetUTCQueryDate(dashboard.CustomEndDate);

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

			//Get an instance of the localDB and proceed from there.
			indexedDBService.getDBInstance("iOPS", 22, [
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
                .query().$promise;
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
				dbCollection = dbData ? dbData[collectionName] : [];
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


						localDB.upsert(collectionName, { Id: 1, [collectionName]: combinedData });

						return combinedData;

					});
			});


		}


		function GetODataTags() {


			return $q.when([]);
			var dbTags;
			var maxDate;

			//Get all of the tags in the localDB
			console.log("Getting localdb tags...");
			return localDB.getById("Tags", 1).then(function (dbData) {
				dbTags = dbData ? dbData.Tags : [];
				//dbTags = [];
				console.log("localdb tags = " + dbTags.length);
				//Get All of the tags that have changed since the localDB was collected.
				if (dbTags.length > 0) {
					maxDate = dbTags.max(function (tag) { return tag.LastModifiedDate });
				} else {
					maxDate = new Date("1/1/2017");

				}


				//Back it up a bit to catch any overlap.
				maxDate = (new Date(maxDate));


				maxDate = utilityService.GetUTCQueryDate(maxDate);


				console.log("localdb Tags maxdate = %O", maxDate);
				//Get only changed tags from the odata source
				return odataService.GetResource("iOPS", "Tags")
					.odata()

					.filter("LastModifiedDate", ">", maxDate)
					.filter("LastObservationId", "!=", null)
					.select([
						"Id", "Name", "JBTStandardObservationId", "AssetId", "LastModifiedDate", "LastObservationDate",
						"LastObservationTextValue"
					])
					.query().$promise.then(function (data) {

						console.log("odata tags =" + data.length);

						var combinedData = data
							.concat(dbTags)
							.distinct(function (a, b) { return a.Id == b.Id });

						console.log("combined tags = " + combinedData.length);


						//Adjust the string valued dates in all of the tags so that they have a regular javascript format date.
						combinedData.select(function (tag) {

							if (tag.LastObservationDate) {
								tag.LastObservationDate = utilityService.GetNonUTCQueryDate(tag.LastObservationDate);
								tag.LastModifiedDate = utilityService.GetNonUTCQueryDate(tag.LastModifiedDate);
							}
						});


						localDB.upsert("Tags", { Id: 1, Tags: combinedData });

						return combinedData;

					});
			});
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


		//===========================================================================================================
		//+Convert the signalR formatted string into proper JSON.
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
			tags.forEach(function(tag) {

				var site = cache.sites.first(function(s) { return s.Id == tag.SiteId });

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
					Value: tag.LastObservationTextValue,
					JBTStandardObservation: cache.jbtStandardObservations.first(function(s) {
						return s.Id == tag.JBTStandardObservationId
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



		service.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory = function (assetId) {


			var asset = cache.assets.first(function (a) { return a.Id == assetId });

			if (asset.AllTagsLoaded) {
				return $q.when(true);
			}

			//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.
			if (!asset.AllTagsLoaded) {
				return service.GetIOPSResource("Tags")
					.expand("LastObservation")
					.filter("AssetId", assetId)
					.query()
					.$promise
					.then(function (data) {


						data
							.where(function (tag) { return tag.Name.indexOf('|') > 0 }) //Only the new format tags have pipe symbols in the name.
							.select(function (tag) {

								var site = cache.sites.first(function (s) { return s.Id == tag.SiteId });

								//console.log("Pre-loaded observation = %O", tag);


								var signalRData = {

									DataType: 'DB',
									PLCUTCDate: !service.dataSourceIsLocal ? utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate)) : new Date(tag.LastObservationDate),
									ObservationUTCDate: service.dataSourceIsLocal ? new Date(tag.LastObservationDate) : utilityService.GetUTCDateFromLocalDate(new Date(tag.LastObservationDate)),

									AssetId: +tag.AssetId,
									TagId: +tag.Id,
									SiteId: +tag.SiteId,
									ObservationId: +tag.LastObservationId,
									JBTStandardObservationId: +tag.JBTStandardObservationId,

									SiteName: site ? site.Name : null,
									TagName: tag.Name,
									Value: tag.LastObservationTextValue,
									Quality: tag.LastObservation ? tag.LastObservation.Quality : null,
									JBTStandardObservation: cache.jbtStandardObservations.first(function (s) { return s.Id == tag.JBTStandardObservationId }),
								}

								signalRData.PLCUTCDateMS = signalRData.PLCUTCDate.getTime();
								signalRData.PLCLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.PLCUTCDate);
								signalRData.ObservationUTCDateMS = signalRData.ObservationUTCDate.getTime();
								signalRData.ObservationLocalDate = utilityService.GetLocalDateFromUTCDate(signalRData.ObservationUTCDate);

								AttachShortTagNameToTagData(signalRData);




								//console.log("Pre-Load observation to be added to inventory = %O", signalRData);

								LoadSignalRObservationToInventory(signalRData);
								var asset = cache.assets.first(function (a) { return a.Id == assetId });

								//Flag the asset as having all of its tags now loaded. 
								if (asset) {
									asset.AllTagsLoaded = true;
								}
							});
					});
			}
		}




		service.dataSourceIsLocal = document.URL.indexOf("localhost/iops/") > 0;


		//===================================================================================================================
		//++SignalR Observation Update - push messages in real-time.
		//This function is run whenever each signalR message arrives.
		//===================================================================================================================
		var tagLookupAverage = 0;
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
			signalRData.JBTStandardObservation = cache.jbtStandardObservations.first(function (s) { return s.Id == signalRData.JBTStandardObservationId });

			AttachShortTagNameToTagData(signalRData);

			//console.log("Loading signalr tag into inventory");
			LoadSignalRObservationToInventory(signalRData);

		}




		function AttachShortTagNameToTagData(tag) {

			var tagNameSplit = tag.TagName.split('|');
			if (tagNameSplit.length > 4) {
				tag.ShortTagName = tagNameSplit.last().replace('.PCA.', '').replace('.GPU.', '').replace('.PBB.', '');
			} else {
				tag.ShortTagName = tag.TagName.replace('Airport_', '');
			}




		}
		var tag = null;

		//==============================================================================
		//+MetadataCounterUpdate - Reset all the countdown timers to 10000.
		//This happens as a result of a signalR message arrival. This routine is
		//called with the affected tag as the parameter.
		//==============================================================================
		function MetadataCounterUpdate(obj) {



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
						obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS = obj.ObservationUTCDateMS - obj.PLCUTCDateMS - sqlOffsetForSite;
						if (obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS > 10000) {
							obj.Metadata.Statistics.KepwareToMainDatabaseTimeMS = null;
						}
						obj.Metadata.Statistics.MainDatabaseToBrowserTimeMS = utilityService.GetUTCDateFromLocalDate(new Date()).getTime() - obj.ObservationUTCDateMS;
						obj.Metadata.Statistics.KepwareToBrowserTimeMS = utilityService.GetUTCDateFromLocalDate(new Date()).getTime() - obj.PLCUTCDateMS - sqlOffsetForSite;
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
			}


		}





		function LoadSignalRObservationToInventory(newObservation) {
			//+Load the tag represented by the observation into the local inventory of tags.
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

					tag.LastObservationTextValue = tag.Value;

					MetadataCounterUpdate(tag);
					//console.log("Tag found in inventory (updated Metadata) = %O", tag);
					if (tag.Asset) {
						MetadataCounterUpdate(tag.Asset);
						MetadataCounterUpdate(tag.Asset.Company);
						MetadataCounterUpdate(tag.Asset.System);
						MetadataCounterUpdate(tag.Asset.Site);
					}


					if (tag.PLCUTCDate <= newObservation.PLCUTCDate) {


						tag.PLCUTCDate = newObservation.PLCUTCDate;
						tag.PLCUTCDateMS = newObservation.PLCUTCDateMS;
						tag.PLCLocalDate = newObservation.PLCLocalDate;
						tag.ObservationUTCDate = newObservation.ObservationUTCDate;
						tag.ObservationUTCDateMS = newObservation.ObservationUTCDateMS;
						tag.ObservationLocalDate = newObservation.ObservationLocalDate;
						tag.ObservationId = +newObservation.ObservationId;
						tag.Metadata.Status.LastValueWasHistorical = false;
						tag.Value = newObservation.Value;
					} else {
						tag.Metadata.Status.LastValueWasHistorical = true;
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
						asset.Tags.push(newObservation);
						newObservation.Asset = asset;
					}
					MetadataCounterUpdate(newObservation);




					cache.tags.push(newObservation);
					MetadataCounterUpdate(newObservation);

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
				$rootScope.$broadcast("dataService.TagUpdate", tag);
			}

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
			if (cache.tags) {
				cache.tags.select(function (tag) {

					UpdateMessagesPersecondForEntity(tag);
					if (!tag.Asset) {
						var asset = cache.assets.first(function (asset) { return asset.Id == tag.AssetId });
						tag.Asset = asset;

						if (asset) {
							if (asset.Tags) {
								asset.Tags.push(tag);
							}

						}

					}
				});
			}

			if (cache.assets) {
				cache.assets.select(function (asset) { UpdateMessagesPersecondForEntity(asset) });
			}


			if (cache.companies) {
				cache.companies.select(function (entity) { UpdateMessagesPersecondForEntity(entity) });
			}

			if (cache.buildings) {
				cache.buildings.select(function (entity) { UpdateMessagesPersecondForEntity(entity) });
			}

			if (cache.areas) {
				cache.areas.select(function (entity) { UpdateMessagesPersecondForEntity(entity) });
			}


			if (cache.gates) {
				cache.gates.select(function (entity) { UpdateMessagesPersecondForEntity(entity) });
			}

			service.Statistics.SignalR.MessagesPerSecond = service.Statistics.SignalR.MessageCount - service.Statistics.SignalR.PreviousMessageCount;
			service.Statistics.SignalR.PreviousMessageCount = service.Statistics.SignalR.MessageCount;

			service.Statistics.SignalR.MessagesPerSecondHistory.push({
				Date: new Date(),
				Value: service.Statistics.SignalR.MessagesPerSecond
			});

			//Keep only the last two hundred values by date
			service.Statistics.SignalR.MessagesPerSecondHistory = service.Statistics.SignalR.MessagesPerSecondHistory.orderByDescending(function (e) { return e.Date }).take(200).orderBy(function (e) { return e.Date });
			//console.log("Messages Per Second History = %O",service.Statistics.SignalR.MessagesPerSecondHistory);
			//console.log(("cache.tags = %O", cache.tags));


		}, 1000);


		//+Update the messages per second statistical entry for the given entity metadata.
		function UpdateMessagesPersecondForEntity(entity) {
			if (entity) {
				entity.Metadata.Statistics.MessagesPerSecond = entity.Metadata.Statistics.MessageCount - entity.Metadata.Statistics.PreviousMessageCount;
				entity.Metadata.Statistics.PreviousMessageCount = entity.Metadata.Statistics.MessageCount;

			}

		}





		//***G
		//++Ten Times Per Second Interval
		//+Ten times per second, update the messages per second on any entity.
		//***G

		$interval(function () {

			cache.tags
				//.where(function (t) { return t.LastObervationId })
				.where(function (t) { return t.Metadata.Statistics.ChangeCount > 0 })
				.select(function (t) { UpdateCountDownsForEntity(t) });


			cache.companies.select(function (e) { UpdateCountDownsForEntity(e) });
			cache.sites.select(function (e) { UpdateCountDownsForEntity(e) });
			cache.systems.select(function (e) { UpdateCountDownsForEntity(e) });
			cache.assets.select(function (e) { UpdateCountDownsForEntity(e) });

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
			GetODataSites();
		}, 60000);




		//***
		//+Decrement the metadata time window counters for the given entity. 
		//***
		function UpdateCountDownsForEntity(entity) {

			if (entity) {
				if (entity.Metadata.UpdateCountDowns.OneSecond > 0) {
					entity.Metadata.UpdateCountDowns.OneSecond -= 1000;
				}
				if (entity.Metadata.UpdateCountDowns.TenSecond > 0) {
					entity.Metadata.UpdateCountDowns.TenSecond -= 100;
				}
				if (entity.Metadata.UpdateCountDowns.ThirtySecond > 0) {
					entity.Metadata.UpdateCountDowns.ThirtySecond -= 33.33;
				}
				if (entity.Metadata.UpdateCountDowns.OneMinute > 0) {
					entity.Metadata.UpdateCountDowns.OneMinute -= 16.66;
				}
				if (entity.Metadata.UpdateCountDowns.FiveMinute > 0) {
					entity.Metadata.UpdateCountDowns.FiveMinute -= 3.332;
				}
				if (entity.Metadata.UpdateCountDowns.FifteenMinute > 0) {
					entity.Metadata.UpdateCountDowns.FifteenMinute -= 1.111;
				}
				if (entity.Metadata.UpdateCountDowns.ThirtyMinute > 0) {
					entity.Metadata.UpdateCountDowns.ThirtyMinute -= .5553;
				}
				if (entity.Metadata.UpdateCountDowns.OneHour > 0) {
					entity.Metadata.UpdateCountDowns.OneHour -= .27766;
				}
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
			DataService]);



}());	//dataService

(function () {
	"use strict";


	function DisplaySetupService($rootScope, $timeout, $interval) {

		var service = {};
		var adjustmentGT768 = 15;
		var adjustmentLTE768 = 95;
		var adjustment = 0;
		var headingId = "";
		var bodyId = "";

		service.suppressSiteHeader = false;
		service.suppressAllSiteHeaders = true;

		Highcharts.setOptions({
			global: {
				useUTC: false
			},
			lang: {
				thousandsSep: ','
			}
		});


		service.menuButtonClicked = function () {

		}

		service.menuParameters =
	    {
	    	isMenuButtonVisible: false,
	    	activeElement: null,
	    	isVerticalFlag: true,
	    	isVertical: function () {
	    		return isVerticalFlag;
	    	},
	    	showMenu: true,
	    	allowHorizontalToggle: true,
	    	isMenuVisible: true
	    }

		service.currentScreenWidth = $(window).width();
		service.currentScreenHeight = $(window).height();

		service.MaintainScreenDimensionReferences = function () {
			service.currentScreenWidth = $(window).width();
			service.currentScreenHeight = $(window).height();
			$timeout(function () { $rootScope.$apply(); }, 10);
		};


		service.SetLoneChartSize = function (widgetId, chart) {
			var widgetBodyDimensions = service.GetWidgetPanelBodyDimensions(widgetId);
			service.SetWidgetPanelBodyDimensions(widgetId);
			chart.setSize((widgetBodyDimensions.width), (widgetBodyDimensions.height - 10), false);

		}


		$(window).bind('resize', service.MaintainScreenDimensionReferences);

		service.SetWidgetPanelBodyDimensions = function (widgetId) {
			var widgetPanelBody = $("#" + widgetId);
			if (widgetPanelBody[0]) {
				var panelElement = widgetPanelBody[0].parentElement;
				//Find the panel heading so we can determine its height
				var panelHeadingElement = $(panelElement).find(".panel-heading")[0];
				var panelHeadingHeight = panelHeadingElement.offsetHeight;
				var panelWidth = panelElement.offsetWidth;
				var widgetContentHeight = panelElement.offsetHeight - panelHeadingElement.offsetHeight;
				widgetPanelBody.css('height', widgetContentHeight + 28);
				$("." + widgetId + "-repeater-container").each(function (index, element) {
					$(element).css('height', +widgetContentHeight - 33);
					$(element).css('width', +panelWidth - 17);
					$(element).css('overflow-y', "hidden");
				});
				return { width: panelWidth, height: widgetContentHeight };

			}
		}

		service.SetVirtualScrollWidgetPanelBodyDimensions = function (widgetId, repeaterContainerName) {
			var widgetPanelBody = $("#" + widgetId);
			var panelElement = widgetPanelBody[0].parentElement;
			//Find the panel heading so we can determine its height
			var panelHeadingElement = $(panelElement).find(".panel-heading")[0];
			var panelHeadingHeight = panelHeadingElement.offsetHeight;
			var panelWidth = panelElement.offsetWidth;
			var widgetContentHeight = panelElement.offsetHeight - panelHeadingElement.offsetHeight;
			widgetPanelBody.css('height', widgetContentHeight);
			$("." + repeaterContainerName).each(function (index, element) {
				$(element).css('height', +widgetContentHeight - 30);
				$(element).css('width', +panelWidth - 17);
				$(element).css('overflow-y', "auto");
			});
			return { width: panelWidth, height: widgetContentHeight };
		}

		service.GetWidgetPanelBodyDimensions = function (widgetId) {
			var widgetPanelBody = $("#" + widgetId);
			if (widgetPanelBody[0]) {
				var panelElement = widgetPanelBody[0].parentElement;
				//Find the panel heading so we can determine its height
				var panelHeadingElement = $(panelElement).find(".panel-heading")[0];
				var panelHeadingHeight = panelHeadingElement.offsetHeight;
				var panelWidth = panelElement.offsetWidth;
				var widgetContentHeight = panelElement.offsetHeight - panelHeadingElement.offsetHeight;
				return { width: panelWidth, height: widgetContentHeight };

			}
		}

		service.GetDivDimensionsById = function (Id) {
			//console.log("Div Id = " + Id);
			var div = $("#" + Id)[0];
			//console.log("div = %O", div);
			//Find the panel heading so we can determine its height
			var divWidth = div.offsetWidth;
			var divHeight = div.offsetHeight;
			return { width: divWidth, height: divHeight };
		}

		service.SetDivHeightById = function (id, height) {
			$(id).css('height', height);
		}


		service.ResizeChart = function (widgetId, chart) {
			var widgetBodyDimensions = service.SetWidgetPanelBodyDimensions(widgetId);
			chart.setSize(widgetBodyDimensions.width - 60, widgetBodyDimensions.height - 35, false);
		}

		function SetPanelBodyHeight() {
			//console.log("Setting sizes");
			var windowHeight = $(window).height();
			service.currentScreenWidth = $(window).width();
			service.currentScreenHeight = $(window).height();

			//console.log(service.currentScreenWidth);
			var bottomMargin = 5;

			//Find the static panel and set the height of its body to a max height
			$("[appContent]").each(function (index, element) {
				$(element).css('height', parseInt(windowHeight) - $(element).offset().top - bottomMargin);
				$(element).css('overflow-y', "hidden");
				$(element).css('overflow-x', "hidden");
				service.appContentHeight = parseInt($(element).css('height'));
			});




			//Find the static panel and set the height of its body to a max height
			$(".static-panel > .panel-body").each(function (index, element) {
				var elementTop = $(element).offset().top;
				var panelBodyHeight = windowHeight - elementTop - bottomMargin - 15;
				//console.log("Element top = " + elementTop);
				//console.log("Setting panel body height = " + panelBodyHeight);
				$(element).css('height', panelBodyHeight);
				$(element).css('overflow-y', "auto");
			});

			$(".fullscreen-panel > .panel-body").each(function (index, element) {
				var elementTop = $(element).offset().top;
				var panelBodyHeight = windowHeight - elementTop - bottomMargin - 15;
				//console.log("Element top = " + elementTop);
				//console.log("Setting panel body height = " + panelBodyHeight);
				$(element).css('height', panelBodyHeight);
				$(element).css('overflow-y', "auto");
			});

			//Find the static panel and set the height of its body to a max height
			$(".panel > .panel-default > .panel-body").each(function (index, element) {

				var elementTop = $(element).offset().top;

				var panelBodyHeight = windowHeight - elementTop - bottomMargin - 15;
				console.log("Element top = " + elementTop);
				console.log("Setting panel body height = " + panelBodyHeight);
				$(element).css('height', panelBodyHeight);
				$(element).css('overflow-y', "scroll");
			});


			$(".static-panel > .panel-body-iframe").each(function (index, element) {
				$(element).css('height', parseInt(windowHeight) - $(element).offset().top - bottomMargin - 5);
				$(element).css('overflow-y', "hidden");
			});

			$(".panel-centered-modal-floating > .panel-body").each(function (index, element) {
				var elementTop = $(element).offset().top;
				var panelBodyHeight = windowHeight - elementTop - bottomMargin - 25;
				//console.log("Element top = " + elementTop);
				//console.log("Setting panel body height = " + panelBodyHeight);
				$(element).css('height', panelBodyHeight);
				$(element).css('overflow-y', "scroll");
			});

			$("#siteMenuBody").each(function (index, element) {
				$(element).css('height', parseInt(windowHeight) - $(element).offset().top - bottomMargin);
				$(element).css('overflow-y', "inherit");
			});

			$(".single-chart").each(function (index, element) {
				$(element).css('height', parseInt(windowHeight) - $(element).offset().top - bottomMargin - 20);
			});

			$(".fullscreen-panel-body").each(function (index, element) {
				$(element).css('height', parseInt($(window).height()) - $(element).offset().top - 10);
			});

			$(".fullscreen-tab-panel-body").each(function (index, element) {
				$(element).css('height', parseInt($(window).height()) - $(element).offset().top - 35);
			});


			$("#systemIframePanelScrollable").each(function (index, element) {
				$(element).css('height', parseInt(windowHeight) - $(element).offset().top - bottomMargin);
			});

			$timeout(function () { $rootScope.$apply(); }, 30);

			$(".repeater-container").each(function (index, element) {
				$(element).css('height', +$(window).height() - $(element).offset().top - 10);
				$(element).css('overflow-y', "auto");

			});



		}


		service.SetPanelDimensions = function (iterations) {
			//console.log("displaySetupService - SetPanelDimensions ran");



			SetPanelBodyHeight();
			if (iterations) {
				for (var t = 1; t <= iterations; t++) {
					$timeout(function () {
						SetPanelBodyHeight();
					}, t * 20);
				}

			}
		}

		$(window).bind('resize', SetPanelBodyHeight);


		service.SetPanelBodyWithIdHeight = function (id) {
			//console.log("Id = " + id);
			$timeout(function () {
				$("#" + id).each(function (index, element) {

					//console.log("Element = %O", element);
					$(element).css('height', $(element)[0].parentNode.offsetHeight - 40);
					$(element).css('offsetHeight', $(element)[0].parentNode.offsetHeight - 40);


				});
			}, 25);



		}

		return service;
	}


	angular
		.module("app")
		.factory('displaySetupService', ['$rootScope', '$timeout', '$interval', DisplaySetupService]);



}());	//DisplaySetupService

(function () {
	"use strict";


	function IndexedDBService($q) {

		var service = {};



		var _error = {
			setErrorHandlers: function (request, errorHandler) {
				if (typeof request !== 'undefined') {
					if ('onerror' in request) request.onError = errorHandler;
					if ('onblocked' in request) request.onblocked = errorHandler;
					if ('onabort' in request) request.onabort = errorHandler;
				}
			}
		}

		service.indexedDBPresent = false;

		service.getDBInstance = function (dbName, version, schema) {
			var deferred = $q.defer();

			var _db = {
				instance: null,

				open: function (databaseName, version, schema) {
					var deferred = $q.defer();
					if (window.indexedDB) {
						var request = window.indexedDB.open(databaseName, version);

						_error.setErrorHandlers(request, deferred.reject);
						request.onupgradeneeded = function (e) {

							console.log("localDB Upgrading.....");
							var db = e.target.result;
							//Clear all data stores and recreate on id.
							//Collect the store names in a separate array because the forEach method will not work on them.
							console.log("db = %O", db);
							var count = db.objectStoreNames.length;
							var names = [];
							for (var x = 0; x < count; x++) {
								names.push(db.objectStoreNames[x]);
							}

							//Delete all stores
							names.forEach(function (n) {
								console.log("Deleting object store " + n);
								db.deleteObjectStore(n);
							});


							schema.forEach(function (ds) {
								console.log("schema = %O", ds);
								console.log("Creating objectStore " + ds.dataStoreName);
								var objectStore = db.createObjectStore(ds.dataStoreName, { keyPath: ds.keyName });
								if (ds.indices) {
									ds.indices.forEach(function (index) {
										objectStore.createIndex(index.name, index.fieldName, { unique: false });
									});
								}
							});

						};

						request.onsuccess = function (e) {
							service.indexedDBPresent = true;
							_db.instance = e.target.result;
							_error.setErrorHandlers(this.instance, deferred.reject);
							deferred.resolve();
						};

					} else {
						deferred.resolve();
					}

					return deferred.promise;
				},

				requireOpenDB: function (objectStoreName, deferred) {
					if (_db.instance === null) {
						deferred.reject("You cannot use an object store when the database has not been opened. Store Name = " + objectStoreName);
					};
				},

				getObjectStore: function (objectStoreName, mode) {
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					mode = mode || 'readonly';
					var txn = this.instance.transaction(objectStoreName, mode);
					var store = txn.objectStore(objectStoreName);
					return store;
				},

				requireObjectStoreName: function (objectStoreName, deferred) {
					if (typeof objectStoreName === 'undefined' ||
						!objectStoreName ||
						objectStoreName.length === 0) {
						deferred.reject("An objectStoreName is required.");
					}
				},

				getCount: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);


					var store = this.getObjectStore(objectStoreName);
					var request = store.count();
					var count;

					request.onsuccess = function (e) {
						count = e.target.result;
						deferred.resolve(count);
					}

					return deferred.promise;
				},

				getAll: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;

					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					console.log("getAll Function: store = %O", store);
					if (store.getAll) {
						var request = store.getAll();
						var allData;

						request.onsuccess = function (e) {
							allData = e.target.result;
							deferred.resolve(allData);
						}

					} else {
						deferred.resolve(null);
					}


					return deferred.promise;

				},




				upsert: function (objectStoreName, data) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					//Copy will remove all function definition properties on the data.
					data = angular.copy(data);

					var store = this.getObjectStore(objectStoreName, 'readwrite');

					var request = store.put(data);

					request.onsuccess = function () {
						deferred.resolve(data);
					};

					return deferred.promise;

				},

				'delete': function (objectStoreName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = _db.getObjectStore(objectStoreName, 'readwrite');
					var request = store.delete(key);

					return deferred.promise;

				},

				getById: function (objectStoreName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					var request = store.get(key);

					request.onsuccess = function (e) {
						deferred.resolve(e.target.result);
					}
					return deferred.promise;
				},


				getByIndex: function (objectStoreName, indexName, key) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName);
					var index = store.index(indexName);


					var range = IDBKeyRange.only(key);
					var outputData = [];

					index.openCursor(range).onsuccess = function (e) {
						var cursor = e.target.result;
						if (cursor) {
							outputData.push(cursor.value);
							cursor.continue();
						} else {
							deferred.resolve(outputData);
						}
					}

					return deferred.promise;
				},

				clear: function (objectStoreName) {
					var deferred = $q.defer();
					if (!service.indexedDBPresent) {
						deferred.resolve(null);
						return deferred.promise;
					}
					this.requireObjectStoreName(objectStoreName, deferred);
					this.requireOpenDB(objectStoreName, deferred);

					var store = this.getObjectStore(objectStoreName, 'readWrite');

					var request = store.clear();

					request.onsuccess = deferred.resolve;

					return deferred.promise;

				}


			};

			//console.log("Opening Database");
			_db.open(dbName, version, schema).then(function () {
				//console.log("Database resolved");
				deferred.resolve(_db);
			},
			function () {
				console.log("Failed");
			});

			return deferred.promise;


		}


		return service;

	}


	angular
		.module("app")
		.factory('indexedDBService', ['$q', IndexedDBService]);



}());	//IndexedDBService

(function () {
	"use strict";


	function OdataService($odataresource, $http, $q, $resource) {

		var service = {};
		var serverPath = odataServerUrl + "/";



		service.serverPath = serverPath;

		service.GetFileImageLibraryCollectionForListOfImageKeys = function (imageKeys) {
			var fileImageLibraryData = [];
			var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
			var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
			return $http.post(url, imageKeys)
			.then(function (response) {
				var dataStruct = response.data.value;
				fileImageLibraryData = dataStruct;
				//Setup the source url for the thumbnail if this is an image paste.
				console.log("fileImageLibraryData = %O", fileImageLibraryData);
				return fileImageLibraryData;
			});
		}




		service.GetFileImageLibraryEntriesByImageKeyList = function (stringList) {
			var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
			var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
			return $http.post(url, stringList)
				.then(function (response) {
					var dataStruct = response.data.value;
					return dataStruct;
				});
		}


		//======================================================================================================
		//Function to return an $resource object already primed to talk to the source and collection.
		//Used by all the other functions that the service exposes.
		//======================================================================================================
		function GetResource(odataSource, collection, customId) {
			//In order to be able to update any entity, the $odataresource object must know the key field. Here it is Id"
			//This is supplied to the $odataresource as the second parameter.
			if (odataServerUrl.indexOf("48773") > 0) {
				return $odataresource(serverPath + "/" + collection, {}, {}, {
					odatakey: customId === null ? 'Id' : customId,
					isodatav4: true
				});

			} else {
				return $odataresource(serverPath + odataSource + "/" + collection, {}, {}, {
					odatakey: customId === null ? 'Id' : customId,
					isodatav4: true
				});

			}
		}

		service.GetResource = function (odataSource, collection) {
			return GetResource(odataSource, collection);
		};


		service.GetAngularStandardResource = function (url) {
			return $odataresource(url);
		}

		service.GetIOPSWebAPIResource = function (route) {
			return $resource(serverPath + "iOPS/api/" + route);
		}


		//=========================================================================================================
		//Function to return a collection from any odataSource.
		//You can optionally attach a filter field name and value, or you can simply not include those parameters.
		//=========================================================================================================
		service.GetCollection = function (odataSource, collectionName, filterFieldName, filterValue) {

			//Defined above. It just fashions the url to include the collection name and returns an odata un-queried resource.
			var resource = GetResource(odataSource, collectionName).odata();


			//If the developer tacked on a filter field name and value, then filter the results
			if (filterFieldName && filterValue) {
				return resource.filter(filterFieldName, filterValue).query().$promise;
			}
			//Otherwise, just return the whole collection
			return resource.query().$promise;
		}

		//=========================================================================================================
		//Function to return a single entity from any odataSource by id.
		//=========================================================================================================
		service.GetEntityById = function (odataSource, collectionName, id) {
			//console.log("OdataService - GetEntityById()  odataSource=" + odataSource + "  collectionName=" + collectionName);
			return GetResource(odataSource, collectionName).odata().get(parseInt(id)).$promise;
		}


		//=========================================================================================================
		//Function to insert an entity into any odata source collection.
		//=========================================================================================================
		service.InsertEntity = function (odataSource, collectionName, newEntity) {

			newEntity.Id = 0;
			return GetResource(odataSource, collectionName).save(newEntity).$promise;
		}

		//=========================================================================================================
		//Function to update an entity into any odata source collection.
		//=========================================================================================================
		service.UpdateEntity = function (odataSource, collectionName, modEntity) {
			return GetResource(odataSource, collectionName).save(modEntity).$promise;
		}

		//=========================================================================================================
		//Function to delete an entity from any odata source collection.
		//=========================================================================================================
		service.DeleteEntity = function (odataSource, collectionName, entityToDelete) {
			entityToDelete.Id = -entityToDelete.Id;
			return GetResource(odataSource, collectionName).save(entityToDelete).$promise;
		}





		return service;
	}


	angular
		.module("app")
		.factory('odataService', ['$odataresource', '$http', '$q', '$resource', OdataService]);



}());	//OdataService

(function () {
	"use strict";


	function SecurityService($http, $odataresource, store, $rootScope, $timeout, signalR, utilityService, dataService, $interval) {

		var service = {};


		service.users = [];
		var serverPath;

		if (odataServerUrl.indexOf("48773") > 0) {
			serverPath = odataServerUrl;
		} else {
			serverPath = odataServerUrl + "/iOPS";
		}

		//console.log("SecurityService Started...");

		service.IsUserOnline = function (userId) {
			var onlineUsers = service.GetOnlineUsers();
			return onlineUsers.any(function (u) { return u.Id == userId });
		}

		function GetResource(collection) {
			//In order to be able to update any entity, the $odataresource object must know the key field. Here it is Id"
			//This is supplied to the $odataresource as the second parameter.
			return $odataresource(serverPath + collection, {}, {}, {
				odatakey: 'Id',
				isodatav4: true
			});

		}


		service.GetResource = function (collection) {
			return GetResource(collection);
		}

		service.GetCurrentUser = function () {
			if (!service.currentUser) {
				service.currentUser = store.get('currentUser');
			}
			return service.currentUser;
		};

		service.UserHasAuthorizedActivity = function (activityName) {
			//console.log(service.currentUser);
			activityName = activityName.toUpperCase();
			return service.currentUser.AuthorizedActivities.any(function (n) { return n.toUpperCase() == activityName });

		}

		service.SaveNewApplication = function (application) {
			return GetResource("Applications").save(application);
		}

		service.SaveUser = function (user) {
			GetResource("iOPS_Users").update(user);
		}



		service.GetAuthorizableActivityById = function (AuthorizableActivityId) {
			return GetResource("AuthorizableActivities").odata().get(parseInt(AuthorizableActivityId)).$promise;
		}






		service.LoginUserWithUsernameAndPassword = function (username, password) {
			var dataString = username + "\n" + password;
			var url = serverPath + "/login?$format=application/json;odata.metadata=none";
			var promise = $http.post(url, dataString)
								.then(function (response) {
									console.log("Entire response = %O", response);
									if (response.status == 401) {
										$rootScope.$broadcast("securityService.invalidAccount", null);
										return "";
									}
									var data = response.data;
									if (data.Id == 0) {
										$rootScope.$broadcast("securityService.invalidAccount", null);
										return "";
									}
									console.log("Logged in User = %O", data);
									if (response.status != 401) {
										data.DateLoggedIn = Date.now();
										service.currentUser = data;
										store.set('currentUser', data);
										service.showMenu = true;
										Global.User = data;
									}

									JoinUserSignalRGroups();

									$rootScope.$broadcast('securityService:authenticated', service.currentUser);
									return (data);
								});
			return promise;
		};



		$rootScope.$on("signalR.Reconnect", function (event, obj) {
			//For some reason (like putting your system to sleep) the signalR service disconnected.
			//On reconnection, join the appropriate groups.
			JoinUserSignalRGroups();
		});

		$interval(function () {
			JoinUserSignalRGroups();
		}, 3000);

		function JoinUserSignalRGroups() {
			if (Global.User.AuthorizedActivities.contains("AuthorizedActivity.AdministerSystem")) {
				signalR.JoinGroup("Admin");
			}

			Global.User.ReaderOf.forEach(function (ro) {
				var site = ro.replace('Site.', '')
				//console.log("User ReaderOf Sites site = to join = %O", site);
				signalR.JoinGroup(site);
			});
		}


		service.LoginUserWithAccessToken = function (accessToken) {

			var dataString = utilityService.GetQuerystringParameterByName("pwt");

			if (dataString) {
				service.currentUser = null;
				store.remove("currentUser");
			} else {

				var currentUser = service.GetCurrentUser();

				if (currentUser) {
					dataString = currentUser.ODataAccessToken;
				}
			}

			var url = serverPath + "/login?$format=application/json;odata.metadata=none";

			var promise = $http.post(url, dataString)
								.then(function (response) {
									//console.log("Entire response = %O",response);
									if (response.status == 401 || response.data.Id == 0) {
										//alert("Invalid Account!");
										$rootScope.$broadcast("securityService.invalidAccount", null);
										return "";
									}
									var data = response.data;
									console.log("Logged in User = %O", data);


									if (response.status != 401) {
										data.DateLoggedIn = Date.now();
										service.currentUser = data;
										store.set('currentUser', data);
										Global.User = data;
									}

									JoinUserSignalRGroups();
									$rootScope.$broadcast('securityService:authenticated', service.currentUser);
									return (data);
								});
			return promise;



		};

		function RefreshUserObject() {
			$http.get(serverPath + "loginaccesstoken(accesstoken='" + service.currentUser.AccessToken + "')?$format=application/json;odata.metadata=none")
					.then(function (response) {
						var data = response.data;
						//console.log("Logged in User = %O", data);

						if (data.UserMasterId > 0) {
							service.currentUser = data;
							store.set('currentUser', data);
							console.log("Local currentUser object refreshed = %O", service.currentUser);
							$rootScope.$broadcast("securityService.currentUserRefreshed");
						}



					});

		}

		service.RefreshUserSecurityForUserId = function (userId) {
			//First of all, is it me that is commanded to refresh?
			if (userId == service.currentUser.Id) {
				RefreshUserObject();
			} else {
				//Check the connected clients to see if the user that was changed is one of them.
				//If it is, signal that specific client to refresh the user object and broadcast to the 
				//rest of the site that the user object has been refreshed.
				//This enables any listener to dynamically change their menus, screen displays, etc...

				var connectedUsers = service.users;
				console.log("Someone Elses user data needs to be refreshed. Connected Users = %O", connectedUsers);
				service.users.where(function (u) { return u.Id == userId }).forEach(function (u) {
					signalR.SignalSpecificClient(connectedUsers[u].ClientId, "Security.RefreshUser", null);
				});
			}

		};


		$rootScope.$on("Security.RefreshUser", function () {
			RefreshUserObject();
		});












		return service;
	}


	angular
		.module("app")
		.factory('securityService', ['$http', '$odataresource', 'store', '$rootScope', '$timeout', "signalR", "utilityService", "dataService", "$interval", SecurityService]);



}());	//SecurityService

(function () {
	"use strict";


	function SignalR($rootScope, $window, store, $interval, $timeout, $q) {


		//console.log("SignalR service created");
		var service = {};

		service.serverPath = signalRServerUrl;

		service.OdataLockedEntities = [];

		service.connectedClients = [];


		service.connected = false;

		var signalRHub = $.connection.jbthub;


		var serverPath = "";
		$.connection.hub.logging = true;
		var localLogging = false;

		function LocalLogIn(code, callerConnectionId, dataObject) {
			if (localLogging) {
				//console.log(" Hub->Me " + code + " Client:" + callerConnectionId + " Data:%O", dataObject);
				console.log(" Hub->Me " + code + " %O", dataObject);
			}
		}

		function LocalLogOut(code, dataObject) {
			if (localLogging) {
				console.log(" Me->Hub " + code + " Data:%O", dataObject);
			}
		}


		$.connection.hub.url = service.serverPath;

		var startTime = 0;
		var firstConnectedClient = null;



		$interval(function () {
			if (service.connectionState == "disconnected") {
				service.connected = false;
				HubStart();
			}
		}, 1000);


		function GetUserByClientId(clientId) {
			return service.connectedClients.where(function (client) { return client.ClientId === clientId }).first().User;
		}

		function SaveUserByClientId(clientId, user) {
			service.connectedClients = [
                {
                	ClientId: clientId,
                	User: user
                }
			].concat(service.connectedClients).distinct(function (a, b) { return a.ClientId == b.ClientId });

		}

		function RemoveUserByClientId(clientId) {
			service.connectedClients = service.connectedClients.where(function (c) { return c.ClientId != clientId });
		}

		var messageCount = 0;
		var lastGroupName = "";

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//Angular SignalR central station. This is the only point of connection with SignalR in this entire Angular application.
		//Angular will simply broadcast the SignalR messages and data to anybody who is listening.
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		signalRHub.client.SignalRNotification = function (code, dataObject, callerConnectionId, groupName) {

			//if (messageCount++ % 1 == 0) {
			//    console.log("SignalR Messages = " + messageCount);
			//    console.log(" Last Hub->Me " + code + " %O", dataObject);
			//}


			var elapsedMS = Date.now() - startTime;
			if (!groupName) {
				groupName = "";
			}


			//if (groupName == "BNA") {
			//	console.log("Code = " + code + "  BNA Message = %O", dataObject);
			//}

			//console.log(groupName);

			LocalLogIn(code, callerConnectionId, dataObject, groupName);

			var fromUser;
			var fromUserName;
			switch (code) {

				case "System.InformationalMessage":
					fromUser = GetUserByClientId(callerConnectionId);
					if (fromUser) {
						fromUserName = fromUser.User.GivenName + " " + fromUser.User.FamilyName;
						toastr.info(dataObject, "Message from " + fromUserName);
						break;

					}

				case "System.AlertMessage":
					fromUser = GetUserByClientId(callerConnectionId);
					console.log("Alert Message from user = %O", fromUser);
					if (fromUser) {

						fromUserName = fromUser.User.GivenName + " " + fromUser.User.FamilyName;
						alertify.set({ labels: { ok: "Ok, I Got It!" } });

						var currentUser = Global.User;
						alertify.alert("<div class='panel panel-default'>" +
										    "<div class='panel-heading'>" +
												    "Message from " + fromUserName +
										    "</div>" +
										    "<div class='panel-body'>" +
											    dataObject +
										    "</div>" +
									    "</div>"
										    , function (e) {
										    	service.SignalSpecificClient(callerConnectionId, "System.InformationalMessage", "......message acknowledged.");
										    });

					}
					break;

				case "System.ClientConnectionEstablished":

					console.log("ngEvent: System.ClientConnectionEstablished Data:%O", dataObject);
					SaveUserByClientId(callerConnectionId, dataObject);

					//Tell the new user about us in response.
					service.SignalSpecificClient(dataObject.ClientId, "System.OnLineReportResponse", GetClientDataObject());
					ConsoleLogAllConnectedClients();
					//Tell the rest of the system about it, in case some application wants to listen in on client connection events.
					$rootScope.$broadcast(code, dataObject);
					break;

				case "System.ClientLogout":

					console.log("ngEvent: System.ClientLogout Data:%O", dataObject);
					console.log("Our ClientId = " + $.connection.hub.id);
					if (dataObject) {

						RemoveUserByClientId(dataObject.ClientId);

						ConsoleLogAllConnectedClients();
						RemoveAllEntityLocksForClientId(dataObject.ClientId);
						//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
						$rootScope.$broadcast(code, dataObject);

					}
					break;

				case "System.SignalR.ClientDisconnected":

					console.log("ngEvent: System.ClientDisconnected Data:%O", dataObject);
					//The dataObject IS the clientID in this case.
					RemoveUserByClientId(dataObject.ClientId);
					ConsoleLogAllConnectedClients();
					RemoveAllEntityLocksForClientId(dataObject);
					//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
					$rootScope.$broadcast(code, dataObject);
					break;

				case "System.OnLineReportResponse":

					if (dataObject) {
						SaveUserByClientId(dataObject.ClientId, dataObject);

						if (!firstConnectedClient) {
							firstConnectedClient = dataObject;
							//Ask the first connected client about locked entites so we can start with a synced list like everybody else has.
							service.SignalSpecificClient(dataObject.ClientId, "System.ReportLockedEntities", null);
						}
						ConsoleLogAllConnectedClients();

					}
					break;


				case "System.ReportLockedEntities":
					service.SignalSpecificClient(callerConnectionId, "System.LockedEntitiesReport", service.OdataLockedEntities);
					break;

				case "System.LockedEntitiesReport":
					dataObject.forEach(function (lockEntry) {
						AddEntityLockEntryToLocalList(lockEntry);
					});
					console.log("Current Locked Entities = %O", service.OdataLockedEntities);
					break;

				case "System.EntityLocked":

					AddEntityLockEntryToLocalList(dataObject);
					console.log("Entity Has Been Locked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);
					$rootScope.$broadcast("System.EntityLocked", dataObject);
					break;


				case "System.EntityUnlocked":
					//Remove it from our locked list
					RemoveEntityLockEntryFromLocalList(dataObject);
					console.log("Entity Has Been Unlocked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);

					//Tell the entire local system about it.
					$rootScope.$broadcast("System.EntityUnlocked", dataObject);

					break;



				default:
					//console.log("Broadcasting..");
					$rootScope.$broadcast(code, dataObject);




			}

		}

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



		function GetEntityLockingDataObject(odataSource, collection, Id) {
			return { odataSource: odataSource, collection: collection, Id: parseInt(Id), lockingClientId: service.Me.ClientId };
		}

		//Called by the local system to lock an entity on all connected clients.
		service.LockEntity = function (odataSourceName, collectionName, Id) {
			var entityLockData = GetEntityLockingDataObject(odataSourceName, collectionName, Id);

			AddEntityLockEntryToLocalList(entityLockData);
			service.SignalAllClients("System.EntityLocked", entityLockData);
		}

		function AddEntityLockEntryToLocalList(lockEntry) {

			var found = false;
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].Id == lockEntry.Id
					&&
					service.OdataLockedEntities[lc].odataSource == lockEntry.odataSource
					&&
					service.OdataLockedEntities[lc].collection == lockEntry.collection) {
					found = true;
					break;
				}
			}
			if (!found) {
				console.log("Lock entry was unique - adding to the list");
				service.OdataLockedEntities.push(lockEntry);
				console.log("Current locks = %O", service.OdataLockedEntities);
			}
		}


		function RemoveEntityLockEntryFromLocalList(lockEntry) {
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].entityTag == lockEntry.entityTag) {
					service.OdataLockedEntities.splice(lc, 1);
					break;
				}
			}

		}


		function RemoveAllEntityLocksForClientId(clientId) {
			for (var lc = 0; lc < service.OdataLockedEntities.length; lc++) {
				if (service.OdataLockedEntities[lc].clientId == clientId) {
					service.OdataLockedEntities.splice(lc, 1);
				}
			}

		}

		service.GetLockingUserForEntity = function (odataSource, collection, entityId) {
			console.log("Checking for locks.....");
			//See if this entity is already locked by someone else. (Not us)
			if (service.OdataLockedEntities.length > 0) {
				console.log("Global Locks are present....%O", service.OdataLockedEntities);
				for (var x = 0; x < service.OdataLockedEntities.length; x++) {
					if (service.OdataLockedEntities[x].Id == parseInt(entityId)) {

						if (service.OdataLockedEntities[x].odataSource == odataSource) {
							if (service.OdataLockedEntities[x].collection == collection) {
								var lock = service.OdataLockedEntities[x];
								console.log("entity lock is present - Applicable lock = %O", lock);

								//Find the person out of the logged in people who matches this client id.
								if (lock.lockingClientId != service.Me.ClientId) {

									var lockUser = datacache.GetFromNamedCache("SignalRUsersByClientId", lock.lockingClientId);
									if (lockUser) {
										console.log("Lock User = %O", lockUser.User);
										return lockUser.User;

									} else {
										console.log("signalR did not find the locking client ID in the cache for users!!!!");
										console.log("Cache for Users by Client Id = %O", datacache.GetAllValuesFromCache("SignalRUsersByClientId"));
									}
								}
							}
						}
					}
				}
				return null;
			}

		}


		//Called by the local system to unlock an entity on all connected clients.
		service.UnlockEntity = function (odataSourceName, collectionName, Id) {
			var entityLockData = GetEntityLockingDataObject(odataSourceName, collectionName, Id);
			RemoveEntityLockEntryFromLocalList(entityLockData);
			console.log("Current locks = %O", service.OdataLockedEntities);
			service.SignalAllClients("System.EntityUnlocked", entityLockData);
		}


		function DisplayAlertMessage(fromUserName, fromClientId, message) {
		}



		function GetClientDataObject() {
			var u = store.get('currentUser');
			if (u) {
				return {
					User: {
						Username: u.Username,
						UserId: u.Id,
						Email: u.Email,
						FamilyName: u.FamilyName,
						GivenName: u.GivenName,
						MiddleName: u.MiddleName

					},
					ClientId: $.connection.hub.id,
					DateLoggedIn: u.DateLoggedIn,
					DateLoggedInFormatted: moment(u.DateLoggedIn).format("YYYY-MM-DD HH:mm:ss")

				};

			}
			return null;
		}


		service.SignalAllClients = function (code, item) {
			//Signal down the chain locally. 
			//console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClients(code, item);
		}

		service.SignalAllClientsInGroup = function (groupName, code, item) {
			//Signal down the chain locally. 
			console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClientsInGroup(groupName, code, item);
		}

		service.SignalOnlyOtherClients = function (code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			var deferred = $q.defer();
			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					//Signal everybody else.
					LocalLogOut(code, item);
					return signalRHub.server.notifyOtherClients(code, item);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});

			return deferred.promise;
		}

		service.SignalOnlyOtherClientsInGroup = function (groupName, code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;

					//Signal everybody else.
					LocalLogOut(code, item);
					return signalRHub.server.notifyOtherClientsInGroup(groupName, code, item);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error");
				});
			return deferred.promise;
		}


		service.JoinGroup = function (groupName) {

			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					signalRHub.server.joinGroup(groupName).then(function () {
						deferred.resolve();
					});
					//console.log("Joined signalR Group " + groupName);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("Could not start signalR Hub");
				});

			return deferred.promise;
		}
		service.LeaveGroup = function (groupName) {

			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;


					//Signal everybody else.
					return signalRHub.server.leaveGroup(groupName);

				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});

			return deferred.promise;
		}

		service.SignalSpecificClient = function (clientId, code, item) {
			//console.log("Local->Client " + clientId +  " Code:" + code + " Data:%O", item);
			var deferred = $q.defer();

			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					var connId = $.connection.hub.id;
					LocalLogOut(code, item);
					return signalRHub.server.notifySpecificClient(clientId, code, item);
				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
					deferred.reject("SignalR Error " + error);
				});
			return deferred.promise;
		}

		service.SendEmail = function (emailData) {
			console.log("Sending Email.....");
			$.connection.hub.start({ transport: ["webSockets", "serverSentEvents", "longPolling"] })
				.done(function () {
					signalRHub.server.sendEmail(emailData);
				})
				.fail(function (error) {
					console.log("SignalR Error " + error);
				});
		}




		function ConsoleLogAllConnectedClients() {
			console.log("Clients Connected: %O", service.connectedClients);
			console.log("hub = %O", $.connection.hub);
		}



		service.SignalClientsForLogout = function () {
			service.SignalAllClients("System.ClientLogout", GetClientDataObject());
		}

		$window.onbeforeunload = service.SignalClientsForLogout;



		$.connection.hub.stateChanged(function (state) {
			var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
			//console.log('SignalR state changed from: ' + stateConversion[state.oldState] + ' to: ' + stateConversion[state.newState]);
			service.connectionState = stateConversion[state.newState];
			if (service.connectionState == "connected") {
				$rootScope.$broadcast("System.signalR Connected");
			}

		});

		//Conduct a signalR round trip timing test
		function SignalRPerformanceTest() {

			startTime = performance.now();
			console.log("signalR Client = %O", service.Me);
			service.SignalSpecificClient(service.Me.ClientId, "signalRPerformanceTest", true);


		}

		$rootScope.$on("signalRPerformanceTest", function (event, obj) {
			console.log("SignalR Trip Time = " + (performance.now() - startTime) / 2);
		});

		//IMPORTANT!!!! - This has to be defined AFTER THE HUB IS DEFINED - PLACE THE START FUNCTION NEAR THE END OF THE SERVICE DEFINITION - WHERE IT IS NOW -     DO NOT MOVE IT TO THE TOP.
		function HubStart() {
			$.connection.hub.start({ withCredentials: false, transport: ["webSockets", "serverSentEvents", "longPolling"] })

				.done(function () {
					//console.log("SignalR start is done.");
					if (!service.connected) {
						service.connected = true;
						console.log("Client Connect - Local ClientId:" + $.connection.hub.id);
						var dataObject = GetClientDataObject();
						if (dataObject) {
							service.Me = dataObject;
							SaveUserByClientId(dataObject.ClientId, dataObject);

							service.SignalAllClients("System.ClientConnectionEstablished", GetClientDataObject());
						}
						SignalRPerformanceTest();
					}



				})

				.fail(function (error) {
					console.log("SignalR Error " + error);
					service.connected = false;
					$timeout(function () {
						HubStart();
					}, 1000);
				}
			);

		}

		HubStart();


		return service;
	}


	angular
		.module("app")
		.factory('signalR', ["$rootScope", "$window", "store", "$interval", "$timeout", "$q", SignalR]);



}());	//SignalR

(function () {
	"use strict";


	function UtilityService($rootScope, $timeout, $parse, signalR) {

		var service = {};

		service.ReplaceItemInArrayById = function (arr, item) {
			var replaced = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					arr[i] = item;
					replaced = true;
					break;
				}
			}
			//Add the item if it was not replaced by the loop above.
			if (!replaced) {
				arr.push(item);
			}
		};

		service.GetQuerystringParameterByName = function (name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		}

		service.ReplaceItemInArrayByIdOnlyIfPresent = function (arr, item) {
			var replaced = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					arr[i] = item;
					replaced = true;
					break;
				}
			}
		};

		service.SecondsToString = function (seconds) {
			if (!seconds) {
				return '';
			}
			if (seconds == "NULL") {
				return '';
			}
			if (seconds == "null") {
				return '';
			}
			if (+seconds != seconds) {
				return '';
			}


			var numdays = Math.floor(seconds / 86400);
			var numhours = Math.floor((seconds % 86400) / 3600);
			var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
			var numseconds = ((seconds % 86400) % 3600) % 60;
			return (numdays > 0 ? numdays + (numdays == 1 ? ' day ' : ' days ') : '') + (numhours > 9 ? numhours : '0' + numhours) + ":" + (numminutes > 9 ? numminutes : '0' + numminutes) + ":" + (numseconds > 9 ? numseconds : '0' + numseconds);
		}

		service.DateDifferenceToString = function (startDate, endDate) {
			var seconds = (moment.utc(moment(endDate, "DD/MM/YYYY HH:mm:ss").diff(moment(startDate, "DD/MM/YYYY HH:mm:ss")))) / 1000;
			return service.SecondsToString(seconds);
		}

		service.GetElapsedTimeAsDisplayString = function (startDate, endDate) {

			var seconds = (moment.utc(moment(endDate, "DD/MM/YYYY HH:mm:ss").diff(moment(startDate, "DD/MM/YYYY HH:mm:ss")))) / 1000;
			return service.SecondsToString(seconds);

		}

		service.RemoveItemFromArrayById = function (arr, item) {
			if (item) {
				for (var i = 0; i < arr.length; i++) {
					var itemId = item.Id;
					if (!itemId) {
						itemId = item;
					}
					if (arr[i].Id == itemId) {
						//console.log("removing %O", item);
						arr.splice(i, 1);
						break;
					}
				}
			}
		}

		service.IsItemInArray = function (arr, item) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].Id == item.Id) {
					return true;
				}
			}
			return false;
		}

		service.GetFormattedDisplayDate = function (d) {
			return moment(d).format("YYYY-MM-DD HH:mm:ss");
		}

		service.GetFormattedLocalDisplayDateFromUTCDate = function (d) {
			return moment(service.GetLocalDateFromUTCDate(d)).format("YYYY-MM-DD HH:mm:ss");
		}

		service.GetHighResolutionFormattedDisplayDate = function (d) {
			return moment(d).format("YYYY-MM-DD HH:mm.SSS");
		}

		service.GetFormattedDisplayDateOnly = function (d) {
			return moment(d).format("MM/DD/YYYY");
		}

		service.SetupSelectpickerDropdown = function (scope, fieldName) {

			scope.$$postDigest(function () {
				var fieldLabel = fieldName.split('.').pop();
				var getter = $parse(fieldName);

				//console.log(getter(scope));
				var jquerySelectorString = "#" + fieldLabel;

				//console.log($(jquerySelectorString));
				$(jquerySelectorString).selectpicker();

				$(jquerySelectorString).on('change', function () {
					//console.log("selectpicker " + fieldName + " changed------------------------------------");
					var value = $(jquerySelectorString + " > option:selected").val();
					getter.assign(scope, value);
					$timeout(function () {
						scope.$apply();
					}, 1);
				});
				$(jquerySelectorString).selectpicker('val', getter(scope));

			});

		}

		service.FormatNumberWithCommas = function (x) {
			var parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}

		function translateMomentDateToJavascriptDate(momentDate) {
			var dateValue = momentDate._d;

			//var returnDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds(), dateValue.getMilliseconds());
			return dateValue;
		}

		var timeZoneOffsetHoursFromUTC = (new Date().getTimezoneOffset()) / 60;


		service.GetLocalDateFromUTCDate = function (utcDate) {
			if (utcDate) {
				//console.log("================================================");
				//console.log("UTCDate = %O", utcDate);
				var newDate = moment(utcDate).subtract(timeZoneOffsetHoursFromUTC, 'hours');
				var localDate = translateMomentDateToJavascriptDate(newDate);
				//console.log("Local Date = %O", localDate);
				return localDate;
			}
		}

		service.GetUTCDateFromLocalDate = function (localDate) {
			if (localDate) {
				//console.log("================================================");
				//console.log("localDate = %O", localDate);
				var functionLocalDate = angular.copy(localDate);
				functionLocalDate.setHours(functionLocalDate.getHours() + timeZoneOffsetHoursFromUTC);
				//console.log("UTC Date Equivalent = %O", functionLocalDate);

				return functionLocalDate;
			}
		}

		service.GetLocalDateFromUTCDateString = function (utcDate) {
			if (utcDate) {

				//console.log("================================================");
				//console.log("localDate = %O", localDate);
				var functionLocalDate = new Date(angular.copy(utcDate));
				functionLocalDate.setHours(functionLocalDate.getHours() - timeZoneOffsetHoursFromUTC);
				//console.log("UTC Date Equivalent = %O", functionLocalDate);

				return functionLocalDate;
			}
		}

		service.FormatDateToODataParameter = function (inputDate) {
			return moment(inputDate).format("YYYY-MM-DDTHH:mm:ss");
		}

		service.FormatSaveDate = function (inputDate) {
			return moment(inputDate).format("YYYY-MM-DDTHH:mm:ss") + "-05:00";
		}

		service.GetUTCQueryDate = function (inputDate) {
			var newDate = moment(inputDate).add(timeZoneOffsetHoursFromUTC, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetODataQueryDateFromUTCDate = function (inputDate) {
			var newDate = moment(inputDate).subtract(timeZoneOffsetHoursFromUTC, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		



		service.GetNonUTCQueryDate = function (inputDate) {
			var newDate = moment(inputDate);
			return translateMomentDateToJavascriptDate(newDate);
		}


		service.GetQueryDateForNow = function () {
			var newDate = moment().add(timeZoneOffsetHoursFromUTC, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateSecondsAgo = function (secondsToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(secondsToSubtract, 'seconds');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateMinutesAgo = function (minutesToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(minutesToSubtract, 'minutes');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateHoursAgo = function (hoursToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(hoursToSubtract, 'hours');
			return translateMomentDateToJavascriptDate(newDate);
		}

		service.GetQueryDateDaysAgo = function (daysToSubtract) {
			var newDate = (moment().add(timeZoneOffsetHoursFromUTC, 'hours')).subtract(daysToSubtract, 'days');
			return translateMomentDateToJavascriptDate(newDate);
		}



		service.GetOdataUpdateableCurrentDateTime = function () {
			return service.FormatSaveDate(Date.now());
		}



		service.DeleteResourceItemWithConfirmation = function (item, itemTypeName, containingCollection, deleteMessageToUser, odataSourceName, odataCollectionName) {

			alertify.set({
				labels: {
					ok: "Yes, Delete the " + itemTypeName,
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});
			var message = 'Are you SURE you want to delete this ' + itemTypeName + '? ';
			if (deleteMessageToUser) {
				message = deleteMessageToUser;
			}

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					item.$delete();
					service.RemoveItemFromArrayById(containingCollection, item);
					if (odataSource && odataCollection) {
						signalR.SignalAllClients(odataSourceName + "." + odataCollectionName + " Deleted", item.Id);
					}



					toastr.success(item.Name, itemTypeName + " was deleted!");

				} else {
					// user clicked "no"
					toastr.info(item.Name, itemTypeName + " was NOT deleted!");
				}
			});




		}

		return service;
	}


	angular
		.module("app")
		.factory('utilityService', ['$rootScope', '$timeout', '$parse', "signalR", UtilityService]);



}());	//UtilityService





