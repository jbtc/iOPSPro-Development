"use strict";
var odataServerUrl = (document.URL.indexOf("localhost/iops/") > 0 || document.URL.indexOf("localhost/iOPSPro-Development/") > 0) ? "http://localhost/DataServices/ODataV4" : "https://www.iopspro.com/DataServices/ODataV4";

//var odataServerUrl = "https:/7.207.78.73/DataServices/ODataV4";
//var odataServerUrl = "http://localhost:48773";
var webRoot = document.URL.indexOf("localhost/iops/") > 0 ? "/iops/"
				: document.URL.indexOf("localhost/iOPSPro-Development") > 0 ? "/iOPSPro-Development/Website/" :
				"/";

//if (!(document.URL.indexOf("localhost/iops/") > 0)) {
//	window.console.log = function() {
		
//	}
//}


var signalRServerUrl = "https://www.iopspro.com/DataServices/SignalR/signalr";
var Global = {
	User: {},
	webRoot: "/",
	SignalR: {}
}


angular.module("app", ["ngResource", "ngStorage", "ngRoute", "ui.router","angular-storage", "ODataResources", "indexedDB", "vs-repeat", "cfp.hotkeys", "sf.virtualScroll","ui.bootstrap","ui.mask","gridster"]);

angular.module('app').config(['$httpProvider','$compileProvider','$provide', function ($httpProvider, $compileProvider, $provide) {


    //The following will alert the user with an alert box for any and all errors.
    //$provide.decorator("$exceptionHandler", ["$delegate", function ($delegate) {
    //    return function (exception, cause) {
    //        $delegate(exception, cause);
    //        alert(exception.message);
    //    };
	//}]);


    $compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(true);

    $provide.constant("indexedDB", window.indexedDB);
	$provide.constant("_", window._);
	$provide.constant("Offline", window.Offline);

	$httpProvider.interceptors.push('APIInterceptor');

	$.ajaxSetup({ cache: false });

    toastr.options = {
					"closeButton": false,
					"debug": false,
					"newestOnTop": false,
					"progressBar": false,
					"positionClass": "toast-top-right",
					"preventDuplicates": false,
					"onclick": null,
					"showDuration": "200",
					"hideDuration": "1000",
					"timeOut": "3000",
					"extendedTimeOut": "1000",
					"showEasing": "swing",
					"hideEasing": "linear",
					"showMethod": "fadeIn",
					"hideMethod": "fadeOut"
    };

	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});


}]);



angular.module('app').config(['$routeProvider', '$urlRouterProvider', '$stateProvider', function ($routeProvider, $urlRouterProvider, $stateProvider) {


	$stateProvider
		//***
		.state('home',
		{
			url: '/',
			views: {
				'@': {
					templateUrl: 'app/stateContent/home/layout.html?seq=' + Date.now(),
					controller: 'AppCtrl as vm'
				},
				'headerPane@home': {
					templateUrl: 'app/stateContent/home/header.html?seq=' + Date.now(),
					controller: 'HeaderCtrl as vm'
				},
				'loginPane@home': {
					templateUrl: 'app/stateContent/login/login.html?seq=' + Date.now(),
					controller: 'LoginCtrl as vm'
				}
			}
		})


		//***
		.state('home.app',
		{
			views: {
				'menuPane@home': {
					templateUrl: "app/stateContent/home/menu.html?seq=" + Date.now(),
					controller: "MenuCtrl as vm"
				},
				'contentPane@home': {
					templateUrl: "app/stateContent/home/blank.html?seq=" + Date.now(),
					controller: "BlankCtrl as vm"
				}
			}
		})
				
		//***
		.state('home.app.blank',
		{
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/home/blank.html?seq=" + Date.now(),
					controller: "BlankCtrl as vm"
				}
			}
		})

		//***
		.state('home.app.dashboard',
		{
			params: {
				DashboardId: null
			},
			views: {
				'contentPane@home': {
					templateUrl: "app/widgetDirectives/dashboardDirectiveHolder.html?seq=" + Date.now(),
					controller: "DashboardCtrl as vm"
				}
			}
		})

				//***
				.state('home.app.editDashboard',
				{
					params: {
						DashboardId: null
					},
					views: {
						'contentPane@home': {
							templateUrl: "app/stateContent/dashboards/editDashboard.html?seq=" + Date.now(),
							controller: "EditDashboardCtrl as vm"
						}
					}
				})
				//***
				.state('home.app.dashboard.widgetSettings',
				{
					params: {
						widget: null //Pass the entire widget resource model as the parameter. The widget itself will invoke this state and pass it. It will ALWAYS be valued.
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/widgetDirectives/widgetSettings.html?seq=" + Date.now(),
							controller: "WidgetSettingsCtrl as vm"
						}
					}
				})


				//***
				.state('home.app.dashboard.editDashboard',
				{
					params: {
						DashboardId: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/stateContent/dashboards/editDashboard.html?seq=" + Date.now(),
							controller: "EditDashboardCtrl as vm"
						}
					}
				})
				//***
				.state('home.app.dashboard.pcaSummaryModal',
				{
					params: {
						widget: null,
						assetId: null,
						dashboard: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/widgetDirectives/pcaSummaryModal.html",
							controller: "PCASummaryModalCtrl as vm"
						}
					}
				})
				//***
				.state('home.app.dashboard.gpuSummaryModal',
				{
					params: {
						widget: null,
						assetId: null,
						dashboard: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/widgetDirectives/gpuSummaryModal.html",
							controller: "GPUSummaryModalCtrl as vm"
						}
					}
				})
				//***
				.state('home.app.dashboard.pbbSummaryModal',
				{
					params: {
						widget: null,
						assetId: null,
						dashboard: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/widgetDirectives/pbbSummaryModal.html",
							controller: "PBBSummaryModalCtrl as vm"
						}
					}
				})

				//***
				.state('home.app.dashboard.editWidget',
				{
					params: {
						WidgetId: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/stateContent/dashboards/editWidget.html?seq=" + Date.now(),
							controller: "EditWidgetCtrl as vm"
						}
					}
				})

				//***
				.state('home.app.dashboard.addWidget',
				{
					params: {
						DashboardId: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/stateContent/dashboards/addWidget.html?seq=" + Date.now(),
							controller: "AddWidgetCtrl as vm"
						}
					}
				})





		//=================================================================================================
		//++Security
		//=================================================================================================
		//***
		.state('home.app.users',
		{
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/security/users.html?seq=" + Date.now(),
					controller: "UsersCtrl as vm"
				}
			}
		})
				//***
				.state('home.app.users.edit',
				{
					params: {
						UserId: null
					},
					views: {
						'contentPane@home.app.users': {
							templateUrl: "app/stateContent/admin/security/userEdit.html?seq=" + Date.now(),
							controller: "UserEditCtrl as vm"
						}
					}
				})



		//=================================================================================================
		//++Administration
		//=================================================================================================
		//***
		.state('home.app.companies',
		{
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/systemTables/companies.html?seq=" + Date.now(),
					controller: "CompaniesCtrl as vm"
				}
			}
		})
				//***
				.state('home.app.companies.edit',
				{
					params: {
						CompanyId: null
					},
					views: {
						'contentPane@home.app.companies': {
							templateUrl: "app/stateContent/admin/systemTables/companyEdit.html?seq=" + Date.now(),
							controller: "CompanyEditCtrl as vm"
						}
					}
				})


							//***G
							//++System Tables
							//***G
							//***
							.state('home.app.sites',
							{
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/sites.html?seq=" + Date.now(),
										controller: "SitesCtrl as vm"
									}
								}
							})
							//***
							.state('home.app.widgetTypes',
							{
								params: {
									Path: null
								},
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/systemTables/widgets/widgetTypes.html?seq=" + Date.now(),
										controller: "WidgetTypesCtrl as vm"
									}
								}
							})
									//***
									.state('home.app.widgetTypes.edit',
									{
										params: {
											WidgetTypeId: null
										},
										views: {
											'contentPane@home.app.widgetTypes': {
												templateUrl: "app/stateContent/admin/systemTables/widgets/widgetTypeEdit.html?seq=" + Date.now(),
												controller: "WidgetTypeEditCtrl as vm"
											}
										}
									})

							//***
							.state('home.app.people',
							{
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/systemTables/people.html?seq=" + Date.now(),
										controller: "PeopleCtrl as vm"
									}
								}
							})
									//***
									.state('home.app.people.edit',
									{
										params: {
											PersonId: null
										},
										views: {
											'contentPane@home.app.people': {
												templateUrl: "app/stateContent/admin/systemTables/personEdit.html?seq=" + Date.now(),
												controller: "PersonEditCtrl as vm"
											}
										}
									})


							//***
							.state('home.app.sites.assets',
							{
								params: {
									SiteId: null
								},
								views: {
									'contentPane@home.app.sites': {
										templateUrl: "app/stateContent/admin/systemTables/assets.html?seq=" + Date.now(),
										controller: "AssetsCtrl as vm"
									}
								}
							})

							//***
							.state('home.app.assets',
							{
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/systemTables/assets.html?seq=" + Date.now(),
										controller: "AssetsCtrl as vm"
									}
								}
							})

							//***
							.state('home.app.assetModels',
							{
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/systemTables/assetModels.html?seq=" + Date.now(),
										controller: "AssetModelsCtrl as vm"
									}
								}
							})

									//***
									.state('home.app.assetModels.edit',
									{
										params: {
											AssetModelId: null
										},
										views: {
											'contentPane@home.app.assetModels': {
												templateUrl: "app/stateContent/admin/systemTables/assetModelEdit.html?seq=" + Date.now(),
												controller: "AssetModelEditCtrl as vm"
											}
										}
									})

							//***
							.state('home.app.assets.standardObservations',
							{
								params: {
									AssetId: null
								},
								views: {
									'contentPane@home.app.assets': {
										templateUrl: "app/stateContent/admin/systemTables/standardObservations.html?seq=" + Date.now(),
										controller: "StandardObservationsCtrl as vm"
									}
								}
							})

							//***
							.state('home.app.tags',
							{
								views: {
									'contentPane@home': {
										templateUrl: "app/stateContent/admin/systemTables/tags.html?seq=" + Date.now(),
										controller: "TagsCtrl as vm"
									}
								}
							})


		//***G
		//++Data Monitors
		//***G

		//***
		.state('home.app.liveTagDataMonitor',
		{
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/dataMonitors/liveTagDataMonitor.html?seq=" + Date.now(),
					controller: "LiveTagDataMonitorCtrl as vm"
				}
			}
		})

		//***
		.state('home.app.liveAssetMonitor',
		{
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/dataMonitors/liveAssetMonitor.html?seq=" + Date.now(),
					controller: "LiveAssetMonitorCtrl as vm"
				}
			}
		})

		//***
		.state('home.app.liveTagDataMonitorPanels',
		{
			params: {
				NoDropOff: true
			},
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/dataMonitors/liveTagDataMonitorPanels.html?seq=" + Date.now(),
					controller: "LiveTagDataMonitorPanelsCtrl as vm"
				}
			}
		})

		//***
		.state('home.app.liveObservationIndicatorTableCells',
		{
			params: {
				NoDropOff: true
			},
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/dataMonitors/liveObservationIndicatorTableCells.html?seq=" + Date.now(),
					controller: "LiveObservationIndicatorTableCellsCtrl as vm"
				}
			}
		})
				//***
				.state('home.app.liveObservationIndicatorTableCells.editDashboard',
				{
					params: {
						DashboardId: null
					},
					views: {
						'contentPane@home.app.liveObservationIndicatorTableCells': {
							templateUrl: "app/stateContent/home/editDashboard.html?seq=" + Date.now(),
							controller: "EditDashboardCtrl as vm"
						}
					}
				})


		//***
		.state('home.app.bhsAlarms',
		{
			params: {
				NoDropOff: true
			},
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/bna/bnaMonitorDisplay.html?seq=" + Date.now(),
					controller: "BNAMonitorDisplayCtrl as vm"
				}
			}
		})


		//***
		.state('home.app.gateMonitorForSite',
		{
			params: {
				SiteId: null
			},
			views: {
				'contentPane@home': {
					templateUrl: "app/stateContent/admin/dataMonitors/liveAssetMonitor.html?seq=" + Date.now(),
					controller: "LiveAssetMonitorCtrl as vm"
				}
			}
		});





	$urlRouterProvider.otherwise("/");
	//$urlRouterProvider.when('', '/');



}]);

  
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

			//console.log("AssetModel change. AssetModel = %O", assetModel);
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
			indexedDBService.getDBInstance("iOPS", 45, [
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
				//console.log("LocalDB retrieved...");
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
			function (assetIdList, alarmsOnly) {
				//console.log("Loading tags into inventory for list of asset ids = " + assetIdList);

				var notLoadedAssetIds = ("" + assetIdList).split(',').distinct().where(function (assetId) {
					if (assetId != "") {					
						var asset = cache.assets.first(function (a) { return a.Id == +assetId });
						return (!alarmsOnly && asset && !asset.AllTagsLoaded) || (alarmsOnly && asset && !asset.AllAlarmTagsLoaded);
					}

				});

				//console.log("notLoadedAssetIds = %O", notLoadedAssetIds);
				if (notLoadedAssetIds.length == 0) {
					//console.log("Asset was loaded already");
					return $q.when(true);
				}

				//The asset object in the dataService might have already loaded all its tags into the running inventory. If it has, we do nothing.
				if (notLoadedAssetIds.length > 0) {



					return service.GetIOPSWebAPIResource(alarmsOnly ? "GSAlarmTagsByListOfAssetIdsCondensed" : "GSTagsByListOfAssetIdsCondensed")
						.query({
							assetIds: assetIdList
						},
							function (data) {


								console.log("Raw Data = %O", angular.copy(data));
								if (typeof data[0] == 'string' || data[0] instanceof String) {
									data = data.select(function (tstring) {

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
											DataType: 'DB'
										}

									});
								}


								console.log("Formatted data = %O", angular.copy(data));
								console.log("Loading tags into inventory Data Arrival = " + data.length + ' tags');
								console.log("Inventory length = " + cache.tags.length);

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

									//Since we were in load only mode, distinctify the cache.tags collection on tagId.
									cache.tags = cache.tags.distinct(function (a, b) { return a.TagId == b.TagId });

									console.log("attaching tags to assets and assets assets to tags.");

									assetIdList.split(',').forEach(function (assetId) {

										if (assetId != "") {
											
											var cacheAsset = cache.assets.first(function (asset) { return asset.Id == assetId });

											cacheAsset.Tags = cache.tags.where(function (t) { return t.AssetId == cacheAsset.Id });

											cacheAsset.Tags.forEach(function (t) {
												t.Asset = cacheAsset;

												//Also connect the JBTStandardObservation object.
												t.JBTStandardObservation = cache.jbtStandardObservations.first(function (s) {
													return s.Id == t.JBTStandardObservationId
												});
											});
										}

									});

									console.log("Loading tags into inventory for list of asset ids - cache processed");
									console.log("Inventory length = " + cache.tags.length);

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


						 data = data.select(function (tstring) {

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
											DataType: 'DB'
										}

									});
						
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


		function LoadSignalRObservationToInventory(newObservation, addOnly) {
			//+Load the tag represented by the observation into the local inventory of tags.
			if (newObservation.IsTest) {
				//console.log("Tag = %O", newObservation);
			}
			//addOnly = false;
			var tagThatWasInCache;


			if (newObservation.TagId || newObservation.TagName) {
				//Scan the inventory for it.

				if (!addOnly) {
					if (newObservation.TagId) {
						//console.log("Checking for tagid");
						if (!addOnly) {
							tagThatWasInCache = cache.tags.first(function (et) { return et.TagId == newObservation.TagId });
						}
					}

					if (!tag && newObservation.TagName) {
						if (!addOnly) {
							tagThatWasInCache = cache.tags.first(function (et) { return et.TagName == newObservation.TagName });
						}
					}

				} else {
					tagThatWasInCache = null;
				}

				//If we found the tag in the inventory, update it in our cache
				if (tagThatWasInCache) {

					//console.log("Tag found in inventory = %O", tag);
					if (tagThatWasInCache.DataType == 'DB' && newObservation.DataType == 'signalR') {
						tagThatWasInCache.DataType = 'signalR';
					}

					if (!tagThatWasInCache.Observations) {

						tagThatWasInCache.Observations = [];
					}
					if (!tagThatWasInCache.Asset) {
						//Set the asset object for the tag in the inventory if not yet already set.
						tagThatWasInCache.Asset = cache.assets.first(function (asset) { return asset.Id == tagThatWasInCache.AssetId });
						if (tagThatWasInCache.Asset) {
							//If we found a matching asset then add this tag to the tags collection for the asset.
							if (!tagThatWasInCache.Asset.Tags) {
								tagThatWasInCache.Asset.Tags = [];
							}
							tagThatWasInCache.Asset.Tags.push(tag);
						}
					}

					tagThatWasInCache.LastObservationTextValue = newObservation.Value;

					MetadataCounterUpdate(tagThatWasInCache);
					//console.log("Tag found in inventory (updated Metadata) = %O", tag);
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
							//console.log("Tag is from signalR and is historical. Tag in inventory = %O", tag);
							//console.log("Tag is from signalR and is historical. Tag from signalR = %O", newObservation);
							tagThatWasInCache.Metadata.Status.LastValueWasHistorical = true;
						}
					}

					//Attach the JBTStandardObservation object to the tag.
					tagThatWasInCache.JBTStandardObservation = cache.jbtStandardObservations.first(function (s) {
						return s.Id == tagThatWasInCache.JBTStandardObservationId;
					});

				} else {
					//We did not find the tag in the inventory.
					//Add the tag to the cache with an attached metadata object
					if (newObservation.IsTest) {
						//console.log("Tag NOT found in inventory.....");
					}


					AttachBlankMetadataObject(newObservation);
					//Attach the asset to the tag, and attach the tags collection to the asset - IF the asset is found

					if (!addOnly) {

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
					}

					var isTag = true;

					if (!addOnly) {
						MetadataCounterUpdate(newObservation, isTag);

						if (newObservation.Asset) {
							//MetadataCounterUpdate(newObservation.Asset);
							//MetadataCounterUpdate(newObservation.Asset.Company);
							//MetadataCounterUpdate(newObservation.Asset.System);
							//MetadataCounterUpdate(newObservation.Asset.Site);
						}

					}

					cache.tags.unshift(newObservation);

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

			operationMetadata.tagsWithOneSecondCountdowns = operationMetadata.tagsWithOneSecondCountdowns.where(function (t) {
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
			if (chart) {
				chart.setSize((widgetBodyDimensions.width), (widgetBodyDimensions.height - 10), false);
			}

		}


		$(window).bind('resize', service.MaintainScreenDimensionReferences);

		service.SetWidgetPanelBodyDimensions = function (widgetId) {
			var widgetPanelBody = $("#" + widgetId);
			if (widgetPanelBody[0]) {
				var panelElement = widgetPanelBody[0].parentElement;
				//Find the panel heading so we can determine its height
				var panelHeadingElement = $(panelElement).find(".panel-heading")[0];
				//console.log("Panel Heading Element Height = ", panelHeadingElement.offsetHeight);
				var panelWidth = panelElement.offsetWidth;
				var widgetContentHeight = panelElement.offsetHeight - panelHeadingElement.offsetHeight;
				widgetPanelBody.css('height', widgetContentHeight - 2);
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
			if (div) {

				var divWidth = div.offsetWidth;
				var divHeight = div.offsetHeight;
				return { width: divWidth, height: divHeight };
			} else {
				return { width: 0, height: 0 };

			}
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
				$(element).css('overflow-y', "auto");
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
				$(element).css('overflow-y', "auto");
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

		$(window).bind('resize',
			function () {
				SetPanelBodyHeight();
				$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
			});


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
						console.log("Indexed DB Not present in browser!");
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

					if (data.error) {
						//There was an error for some reason
						if (data.error.innererror &&
							data.error.innererror.internalexception &&
							data.error.innererror.internalexception.type &&
							(
								data.error.innererror.internalexception.type == 'System.Data.Entity.Core.EntityException'
									||
									data.error.innererror.internalexception.type == 'System.Data.Entity.Core.EntityException'
							)) {

							alertify.alert("iOPSPro is experiencing database issues. Try again later.");

						}
					}

					JoinUserSignalRGroups();

					$rootScope.$broadcast('securityService:authenticated', service.currentUser);
					return (data);
				});
			return promise;
		};


		$rootScope.$on("System.signalR Connected", function (event, obj) {
			//For some reason (like putting your system to sleep) the signalR service disconnected.
			//On reconnection, join the appropriate groups.

			$timeout(function () {

				JoinUserSignalRGroups();
			}, 50);
		});

		//$interval(function () {
		//	JoinUserSignalRGroups();
		//}, 3000);

		function JoinUserSignalRGroups() {
			if (Global.SignalR && Global.SignalR.Status == "Connected") {
				
				if (Global.User && Global.User.AuthorizedActivities) {
					if (Global.User.AuthorizedActivities.contains("AuthorizedActivity.AdministerSystem")) {
						signalR.JoinGroup("Admin");
					}

					Global.User.ReaderOf.forEach(function (ro) {
						var site = ro.replace('Site.', '')
						//console.log("User ReaderOf Sites site = to join = %O", site);
						signalR.JoinGroup(site);
					});
				}
			}
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
		$.connection.hub.logging = false;
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
		}, 10000);


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

			var browser = service.connectedClients.first(function (c) { return c.ClientId == clientId });
			if (browser) {
				console.log("SignalR Client Disconnect was a browser for client = %O", browser);
			}
			service.connectedClients = service.connectedClients.where(function (c) { return c.ClientId != clientId });
		}

		var messageCount = 0;
		var lastGroupName = "";




		//***G
		//++Angular SignalR central station. This is the only point of connection with SignalR in this entire Angular application.
		//+Angular will simply broadcast the SignalR messages and data to anybody who is listening.
		//---G

		//---B

		signalRHub.client.SignalRNotification = function (code, dataObject, callerConnectionId, groupName) {

			//if (messageCount++ % 1 == 0) {
			//    console.log("SignalR Messages = " + messageCount);
			//    console.log(" Last Hub->Me " + code + " %O", dataObject);
			//}


			var elapsedMS = Date.now() - startTime;
			if (!groupName) {
				groupName = "";
			}

			//if (dataObject && dataObject.indexOf) {
			//	if (dataObject.indexOf('TestTagName') > 0) {
			//		console.log("TestTagName Arrived in signalR Service = %O", dataObject);
			//	}
			//}


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

			//---B
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

			//---B
			case "System.ClientConnectionEstablished":

				//console.log("ngEvent: System.ClientConnectionEstablished Data:%O", dataObject);
				SaveUserByClientId(callerConnectionId, dataObject);

				//Tell the new user about us in response.
				service.SignalSpecificClient(dataObject.ClientId, "System.OnLineReportResponse", GetClientDataObject());
				ConsoleLogAllConnectedClients();
				//Tell the rest of the system about it, in case some application wants to listen in on client connection events.
				$rootScope.$broadcast(code, dataObject);
				break;

			//---B
			case "System.ClientLogout":

				//console.log("ngEvent: System.ClientLogout Data:%O", dataObject);
				//console.log("Our ClientId = " + $.connection.hub.id);
				if (dataObject) {

					RemoveUserByClientId(dataObject.ClientId);

					ConsoleLogAllConnectedClients();
					RemoveAllEntityLocksForClientId(dataObject.ClientId);
					//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
					$rootScope.$broadcast(code, dataObject);

				}
				break;

			//---B
			case "System.SignalR.ClientDisconnected":

				//console.log("ngEvent: System.ClientDisconnected Data:%O", dataObject);
				//The dataObject IS the clientID in this case.
				RemoveUserByClientId(dataObject.ClientId);
				ConsoleLogAllConnectedClients();
				RemoveAllEntityLocksForClientId(dataObject);
				//Tell the rest of the system about it, in case some application wants to listen in on client disconnection events.
				$rootScope.$broadcast(code, dataObject);
				break;

			//---B
			

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


			//---B
			case "System.ReportLockedEntities":
				service.SignalSpecificClient(callerConnectionId, "System.LockedEntitiesReport", service.OdataLockedEntities);
				break;

			//---B
			case "System.LockedEntitiesReport":
				dataObject.forEach(function (lockEntry) {
					AddEntityLockEntryToLocalList(lockEntry);
				});
				console.log("Current Locked Entities = %O", service.OdataLockedEntities);
				break;

			//---B
			case "System.EntityLocked":

				AddEntityLockEntryToLocalList(dataObject);
				console.log("Entity Has Been Locked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);
				$rootScope.$broadcast("System.EntityLocked", dataObject);
				break;

			//---B
			case "System.EntityUnlocked":
				//Remove it from our locked list
				RemoveEntityLockEntryFromLocalList(dataObject);
				console.log("Entity Has Been Unlocked. OdataLockedEntitiesList now = %O", service.OdataLockedEntities);

				//Tell the entire local system about it.
				$rootScope.$broadcast("System.EntityUnlocked", dataObject);

				break;



			//---B
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

		//***G
		//++Public Methods for Controllers and Directives to Use
		//***G
		//---B
		service.SignalAllClients = function (code, item) {
			//Signal down the chain locally. 
			//console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClients(code, item);
		}

		//---B
		service.SignalAllClientsInGroup = function (groupName, code, item) {
			//Signal down the chain locally. 
			console.log("Broadcasting " + code);
			$rootScope.$broadcast(code, item);
			return service.SignalOnlyOtherClientsInGroup(groupName, code, item);
		}

		//---B
		service.SignalOnlyOtherClients = function (code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			return signalRHub.server.notifyOtherClients(code, item);
		}

		//---B
		service.SignalOnlyOtherClientsInGroup = function (groupName, code, item) {
			//console.log("Sending SignalR to all clients. Code = " + code + " object = %O", item);
			return signalRHub.server.notifyOtherClientsInGroup(groupName, code, item);
		}

		//---B
		service.JoinGroup = function (groupName) {
			return signalRHub.server.joinGroup(groupName).then(function () {
				console.log("Joined signalR Group " + groupName);
			});
		}

		//---B
		service.LeaveGroup = function (groupName) {
			return signalRHub.server.leaveGroup(groupName).then(function () {
				//console.log("Left signalR Group " + groupName);
			});
		}

		//---B
		service.SignalSpecificClient = function (clientId, code, item) {
			//console.log("Local->Client " + clientId +  " Code:" + code + " Data:%O", item);
			return signalRHub.server.notifySpecificClient(clientId, code, item);
		}

		//---B
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
			//console.log("Clients Connected: %O", service.connectedClients);
			//console.log("hub = %O", $.connection.hub);
		}

		//---B
		service.SignalClientsForLogout = function () {
			service.SignalAllClients("System.ClientLogout", GetClientDataObject());
		}
		//***G
		//++End Of Public Methods for Controllers and Directives to Use
		//***G


		$window.onbeforeunload = service.SignalClientsForLogout;

		$.connection.hub.stateChanged(function (state) {
			var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
			console.log('SignalR state changed from: ' + stateConversion[state.oldState] + ' to: ' + stateConversion[state.newState]);
			service.connectionState = stateConversion[state.newState];
			if (service.connectionState == "connected") {
				$rootScope.$broadcast("System.signalR Connected");
				if (Global.SignalR) {
					Global.SignalR.Status = "Connected";
				}

			}
			if (service.connectionState == "disconnected") {
				$rootScope.$broadcast("System.signalR Disconnected");
				if (Global.SignalR) {					
					Global.SignalR.Status = "Disconnected";
				}
			}

		});

		service.connectionState = "";

		//Conduct a signalR round trip timing test
		function SignalRPerformanceTest() {

			startTime = performance.now();
			console.log("signalR Client = %O", service.Me);
			if (service.Me) {
				service.SignalSpecificClient(service.Me.ClientId, "signalRPerformanceTest", true);
			}
		}

		$rootScope.$on("signalRPerformanceTest", function (event, obj) {
			console.log("SignalR Trip Time = " + (performance.now() - startTime) / 2);
		});

		//++IMPORTANT!!!! - This has to be defined AFTER THE HUB IS DEFINED - PLACE THE START FUNCTION NEAR THE END OF THE SERVICE DEFINITION - WHERE IT IS NOW -     DO NOT MOVE IT TO THE TOP.
		function HubStart() {
			$.connection.hub.start({ withCredentials: false, transport: [ "webSockets", "serverSentEvents", "longPolling"] })

				.done(function () {
					//console.log("SignalR start is done.");
					if (!service.connected) {
						service.connected = true;
						console.log("Client Connect - Local ClientId:" + $.connection.hub.id);
						var dataObject = GetClientDataObject();
						if (dataObject) {
							service.Me = dataObject;
							SaveUserByClientId(dataObject.ClientId, dataObject);
							var u = store.get('currentUser');
							Global.SignalR = {
								ClientId: $.connection.hub.id,
								DateLoggedIn: u.DateLoggedIn,
								DateLoggedInFormatted: moment(u.DateLoggedIn).format("YYYY-MM-DD HH:mm:ss")
							}

							service.SignalAllClients("System.ClientConnectionEstablished", GetClientDataObject());
						}
						//$interval(SignalRPerformanceTest,500);
						service.connectionState = "connected";
						Global.SignalR.Status = "Connected";
						$rootScope.$broadcast("System.signalR Connected");
						SignalRPerformanceTest();
					}



				})

				.fail(function (error) {
						//console.log("SignalR Error " + error);
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


		service.ToFixed = function (number, fractionSize) {
			var fixed = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
			fixed = fixed.toString();
			//console.log(fixed);
			if (fixed.indexOf('.') < 0) {
				fixed += '.0';
			}
			return fixed;
		}



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
		console.log("utilityService timeZoneOffsetHoursFromUTC = %O", timeZoneOffsetHoursFromUTC);


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
			return moment(inputDate).format("YYYY-MM-DDTHH:mm:ss");
		}

		service.GetUTCQueryDate = function (inputDate) {
			//var newDate = moment(inputDate).add(timeZoneOffsetHoursFromUTC, 'hours');
			//return translateMomentDateToJavascriptDate(newDate);
			var newDate = moment(inputDate);
			return translateMomentDateToJavascriptDate(newDate);
		}
		service.GetUTCQueryDateMinutesAgo = function (inputDate) {
			//var newDate = moment(inputDate).add(timeZoneOffsetHoursFromUTC, 'hours');
			//return translateMomentDateToJavascriptDate(newDate);
			var newDate = moment(inputDate);
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
			var utc = new Date().toISOString();
			console.log("utc = %O", utc);
			return utc;
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

(function () {

	"use strict";

	angular.module("app")
		.directive('faSuspendable', function () {
			return {
				link: function (scope) {
					// Heads up: this might break is suspend/resume called out of order
					// or if watchers are added while suspended
					var watchers;

					scope.$on('suspend', function () {
						watchers = scope.$$watchers;
						scope.$$watchers = [];
					});

					scope.$on('resume', function () {
						if (watchers)
							scope.$$watchers = watchers;

						// discard our copy of the watchers
						watchers = void 0;
					});
				}
			};
		});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("checkboxInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "angular/common/directives/formFields/checkboxInputFieldTemplate.html?" + Date.now,
			replace: true,

			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				isChecked: "=",
				model: "=",
				checkboxName: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@"

 			}

		};
	});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("checkboxInputTdField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "angular/common/directives/formFields/checkboxInputTdFieldTemplate.html?" + Date.now,
			replace: true,

			scope: {				
				model: "="
 			}

		};
	});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("dropdownInputField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse)
		{
			return {
				restrict: "E",
				templateUrl: "app/directives/formFields/dropdownInputFieldTemplate.html?" + Date.now,
				replace: true,
				scope: {
					labelText: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					idText: "@",
					displayWidth: "@",
					liveSearch: "@",
					instructions: "@",
					dropdownData: "="
				},
				link: function (scope, element, attrs)
				{

					//scope.$watch(scope.model, function(newValue, oldValue) {
					//	console.log(newValue);
					//});
					//$timeout(function ()
					//{
					//	$rootScope.$apply(function ()
					//	{


					//		var jqSelector = "#" + scope.idText;
					//		$(jqSelector).selectpicker();
					//		element.selectpicker('refresh');

					//		$().on('change', function ()
					//		{
					//			console.log("selectpicker " + jqSelector + " changed------------------------------------");
					//			var value = $(jqSelector + " > option:selected").val();
					//			scope.model = value;
					//		});

					//		$(jqSelector).selectpicker('val', scope.model);
					//	});

					//}, 1000);

				}


			};
		}]);
}());



//link: function (scope, element, attrs) {

//console.log(scope.dropdownData);

//$(element).selectpicker();

//scope.$watch(attrs.mySlide, function (newValue, oldValue)
//$(element).on('change', function ()
//{
//	var value = $(jquerySelectorString + " > option:selected").val();
//	getter.assign(scope, value);
//});
//$(jquerySelectorString).selectpicker('val', getter(scope));

(function ()
{

	"use strict";

	angular.module("app")
		.directive("dropdownInputMultipleField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse)
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/formFields/dropdownInputMultipleFieldTemplate.html?" + Date.now,
				replace: true,
				scope: {
					labelText: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					idText: "@",
					liveSearch: "@",
					instructions: "@",
					dropdownData: "="
				}
			};
		}]);
}());



angular.module('app')
	.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});

					event.preventDefault();
				}
			});
		};
	});
(function ()
{

	var app = angular.module('app');

	app.directive('entityLocking',
		[
			"$state", "signalR",

			function ($state, signalR) {

				var controller = function ($scope)
				{

					var vm = this;
					vm.stateName = $state.current.name;

					//console.log("entityLocking directive controller invoked. vm.odataSource = " + vm.odataSource + "   vm.collection = " + vm.collection + "   vm.entityId = " + vm.entityId);
					

					var globalLockedEntities = signalR.OdataLockedEntities;

					vm.EntityIsLocked = false;
					vm.lockedNameDisplay = "";
					vm.showLockBackdrop = false;

					function CheckForLocked() {

						if (vm.entityId) {
							vm.LockingUser = signalR.GetLockingUserForEntity(vm.odataSource, vm.collection, vm.entityId);
							if (!vm.LockingUser) {
								//Entity is not locked by someone else, lock it for us!
								if (!vm.EntityIsLocked) {

									console.log("Entity was not locked by someone else, locking entity for us.");
									signalR.LockEntity(vm.odataSource, vm.collection, vm.entityId);
									vm.showLockBackdrop = false;

								}

							} else {
								console.log("signalR returned a locking user = %O", vm.LockingUser);
								vm.EntityIsLocked = true;
								vm.showLockBackdrop = true;
								vm.lockedNameDisplay = vm.LockingUser.GivenName + " " + vm.LockingUser.FamilyName;

							}

						}
					}

					CheckForLocked();

					$scope.$on(
						"$destroy",
						function handleDestroyEvent()
						{
							//$scope.$on("System.EntityUnlocked", function () { });
							signalR.UnlockEntity(vm.odataSource, vm.collection, vm.entityId);

						}
					);

					$scope.$on("System.EntityUnlocked", function (event, lockingData)
					{
						if (lockingData.odataSource == vm.odataSource && lockingData.collection == vm.collection && lockingData.Id == vm.entityId && signalR.Me.ClientId == lockingData.lockingClientId)
						{
							//This was us unlocking our own entity.
							return;
						}
						vm.LockingUser = null;
						vm.EntityIsLocked = false;
						vm.showLockBackdrop = false;
						vm.lockedNameDisplay = "";
						console.log("entityLocking directive - checking for locks");
						CheckForLocked();
					});

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					replace: true,
					templateUrl: "angular/common/directives/formFields/entityLockingTemplate.html?" + Date.now(),

					scope: {
						odataSource: "@",
						collection: "@",
						entityId: "="
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());
angular.module('app')
 .directive('focus', function focus()
 {
 	return {
 		link: function (scope, element)
 		{
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 			element[0].focus();
 		}
 	};
 });

(function ()
{

	var app = angular.module('app');

	app.directive('personnelSelectorList',
		[
			"odataService", "personnelService", "utilityService", "$odata", "dataCache", "$state", "hotkeys",

			function (odataService, personnelService, utilityService, $odata, dataCache, $state, hotkeys) {

				var controller = function ($scope)
				{

					var vm = this;
					vm.stateName = $state.current.name;
					vm.personnelService = personnelService;

					console.log("personnelSelectorList directive - vm.people = %O", vm.people);


					function IsInMyPeople(person) {
						if (vm.people) {
							for (var l = 0; l < vm.people.length; l++) {
								if (vm.people[l].MasterId == person.MasterId) {
									return true;
								}
							}
							return false;
						}
						return false;
					};


					vm.SelectContact = function (item, model, label, event) {
						personnelService.GetPersonById(item.MasterId).then(function(data) {
							console.log("Person Model from personnelService = %O", data);
							if (!IsInMyPeople(data)) {
								utilityService.ReplaceItemInArrayById(vm.people, data);
								vm.addPersonFunction()(data);
							}
							vm.Person = null;
						});
					};

					vm.searchPeople = function (searchTerm)
					{
						if (searchTerm.length > 2)
						{
							vm.searchingPeople = true;
							//console.log(searchTerm);
							return personnelService.GenericSearch(searchTerm);

						}
						return null;
					};

					vm.RemovePerson = function(person) {
						utilityService.RemoveItemFromArrayById(vm.people, person);
						vm.removePersonFunction()(person);
					};

					hotkeys.bindTo($scope)
					.add({
						combo: 'esc',
						description: 'Cancel and close any input form',
						allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
						callback: function ()
						{
							$state.go("^");
						}
					});


				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "angular/common/directives/panels/personnelSelectorListDirectiveTemplate.html?" + Date.now(),

					scope: {
						people: "=",
						listTitle: "@",
						removePersonFunction: "&",
						addPersonFunction: "&"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());
(function ()
{

	"use strict";

	angular.module("app")
		.directive("dropdownInputField", ['$timeout', '$rootScope', '$parse', function ($timeout, $rootScope, $parse)
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/formFields/dropdownInputFieldTemplate.html?" + Date.now,
				replace: true,
				scope: {
					labelText: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					idText: "@",
					displayWidth: "@",
					liveSearch: "@",
					instructions: "@",
					dropdownData: "="
				},
				link: function (scope, element, attrs)
				{

					//scope.$watch(scope.model, function(newValue, oldValue) {
					//	console.log(newValue);
					//});
					//$timeout(function ()
					//{
					//	$rootScope.$apply(function ()
					//	{


					//		var jqSelector = "#" + scope.idText;
					//		$(jqSelector).selectpicker();
					//		element.selectpicker('refresh');

					//		$().on('change', function ()
					//		{
					//			console.log("selectpicker " + jqSelector + " changed------------------------------------");
					//			var value = $(jqSelector + " > option:selected").val();
					//			scope.model = value;
					//		});

					//		$(jqSelector).selectpicker('val', scope.model);
					//	});

					//}, 1000);

				}


			};
		}]);
}());



//link: function (scope, element, attrs) {

//console.log(scope.dropdownData);

//$(element).selectpicker();

//scope.$watch(attrs.mySlide, function (newValue, oldValue)
//$(element).on('change', function ()
//{
//	var value = $(jquerySelectorString + " > option:selected").val();
//	getter.assign(scope, value);
//});
//$(jquerySelectorString).selectpicker('val', getter(scope));

(function ()
{

	"use strict";

	angular.module("app")
		.directive('selectpicker', ['$parse', function ($parse)
		{
			return {
				restrict: 'A',
				link: function (scope, element, attrs)
				{
					element.selectpicker($parse(attrs.selectpicker)());
					element.selectpicker('refresh');

					scope.$watch(attrs.ngModel, function (newVal, oldVal)
					{
						scope.$parent[attrs.ngModel] = newVal;
						scope.$evalAsync(function ()
						{
							if (!attrs.ngOptions || /track by/.test(attrs.ngOptions)) element.val(newVal);
							element.selectpicker('refresh');
						});
					});

					scope.$on('$destroy', function ()
					{
						scope.$evalAsync(function ()
						{
							element.selectpicker('destroy');
						});
					});
				}
			};
		}]);
}());

(function ()
{
	"use strict";

	angular.module("app")
		.directive("systemDropdown", function ($compile)
		{
			return {
				restrict: 'E',
				scope: {
					items: '=dropdownData',
					doSelect: '&selectVal',
					selectedItem: '=preselectedItem'
				},
				link: function (scope, element, attrs)
				{
					var html = '';
					switch (attrs.menuType)
					{
						case "button":
							html += '<div class="btn-group"><button class="btn button-label btn-info">Action</button><button class="btn btn-info dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>';
							break;
						default:
							html += '<div class="dropdown"><a class="dropdown-toggle" role="button" data-toggle="dropdown"  href="javascript:;">Dropdown<b class="caret"></b></a>';
							break;
					}
					html += '<ul class="dropdown-menu"><li ng-repeat="item in items"><a tabindex="-1" data-ng-click="selectVal(item)">{{item.name}}</a></li></ul></div>';
					element.append($compile(html)(scope));
					for (var i = 0; i < scope.items.length; i++)
					{
						if (scope.items[i].id === scope.selectedItem)
						{
							scope.bSelectedItem = scope.items[i];
							break;
						}
					}
					scope.selectVal = function (item)
					{
						switch (attrs.menuType)
						{
							case "button":
								$('button.button-label', element).html(item.name);
								break;
							default:
								$('a.dropdown-toggle', element).html('<b class="caret"></b> ' + item.name);
								break;
						}
						scope.doSelect({
							selectedVal: item.id
						});
					};
					scope.selectVal(scope.bSelectedItem);
				}
			};
		});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("textareaInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/textareaInputFieldTemplate.html?" + Date.now(),
			replace: true,

			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				cols: "@",
				rows: "@",
				placeholderText: "@",
				model: "=",
				inputName: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@"
			},
			link: function (scope, element)
			{

				element[0].focus();
			}
		};
	});

}());


(function () {

	"use strict";

	angular.module("app")
		.directive("textInputField", function () {
			return {
				restrict: 'E',
				templateUrl: "app/directives/formFields/textInput.html?" + Date.now,
				replace: true,
				priority: 10000,
				scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
					labelText: "@",
					model: "=",
					idText: "@",
					inputName: "@",
					inputType: "@",
					bootstrapLabelColumns: "@",
					bootstrapInputColumns: "@",
					placeholderText: "@",
					inputWidth: "@"
				}
			};
		});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("widgetTextareaInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/widgetTextareaInputFieldTemplate.html?" + Date.now(),
			replace: true,

			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				cols: "@",
				rows: "@",
				idText: "@",
				placeholderText: "@",
				model: "=",
				inputName: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@"
			},
			link: function (scope, element)
			{

				element[0].focus();
			}
		};
	});

}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("widgetTextInputField", function ()
		{
		return {
			restrict: 'E',
			templateUrl: "app/directives/formFields/widgetTextInput.html?" + Date.now,
			replace: true,
			priority: 10000,
			scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
				labelText: "@",
				model: "=",
				idText: "@",
				inputName: "@",
				inputType: "@",
				bootstrapLabelColumns: "@",
				bootstrapInputColumns: "@",
				placeholderText: "@",
				inputWidth: "@"
			}

		};
	});

}());


(function ()
{

	var app = angular.module('app');

	app.directive('fileUploadList',
		[
			"odataService", "personnelService", "utilityService", "$odata", "dataCache", "$state", "hotkeys", "displaySetupService", "$timeout", "FileUploader", "$http", "appSettings", "$odataresource", "$window", "$interval", "signalR", "securityService",

			function (odataService, personnelService, utilityService, $odata, dataCache, $state, hotkeys, displaySetupService, $timeout, FileUploader, $http, appSettings, $odataresource, $window, $interval, signalR, securityService)
			{

				var controller = function ($scope)
				{
					var vm = this;
					var iconmenu = "doc,docx,xls,xlsm,xlsx,msg,pdf,ppt,js,css,mp4,mp3,wav,zip,txt,json,config,cs,aspx,html,tif,tiff,,vsd,chm,asp,sql,hl7,xml,linq,rdl,wma,msi,exe.reg";

					var fileImageLibraryServerBaseAddress = "https://odataprod.utmb.edu/FileImageLibrary/";
					//var fileImageLibraryServerBaseAddress = "http://localhost:41840/";

					var uploadReordinal = 100000;
					personnelService.GetPersonById(securityService.GetCurrentUser().UserMasterId).then(function(person) {
						vm.CurrentUserPerson = person;
					});

					vm.state = $state;

					if (vm.mode) {
						if (vm.mode == "readOnly")
						{
							vm.readOnly = true;
						} else {
							vm.readOnly = false;
						}
					}

					var uploader = $scope.uploader = new FileUploader({
						url: fileImageLibraryServerBaseAddress + 'upload'
					});

					
					function traverseFileTree(item, path)
					{
						path = path || "";
						if (item.isFile)
						{
							// Get file
							item.file(function (file) {
								////console.log("Adding to queue in new routine");
								uploader.addToQueue(file);
								////console.log("File:", path + file.name);
							});
						} else if (item.isDirectory) {
							// Get folder contents
							var dirReader = item.createReader();
							dirReader.readEntries(function (entries)
							{
								for (var i = 0; i < entries.length; i++)
								{
									traverseFileTree(entries[i], path + item.name + "/");
								}
							});
						}
					}
					function handleFocus(event)
					{
						$("#pasteTarget").focus();
						$("#pasteTarget").click();

						//console.log("pasteTarget focused");
					}

					var win = angular.element($window).on("focus", handleFocus);
					var descSavePromise = $interval(function ()
					{
						vm.SaveAllModifiedDescriptions();
					}, 1000);

					$scope.$on("$destroy", function ()
					{
						win.off("focus", handleFocus);
						$interval.cancel(descSavePromise);

					});

					$timeout(function() {
						document.getElementById('pasteTarget').addEventListener("drop", function (event)
						{

							event.preventDefault();
							var items = event.dataTransfer.items;
							for (var i = 0; i < items.length; i++) {
								// webkitGetAsEntry is where the magic happens
								var item = items[i].webkitGetAsEntry();
								if (item && !item.isFile)
								{

									uploader.queue.pop();

									traverseFileTree(item);
								}
							}


						}, false);

					}, 200);

					//////////////////////////////////////////////////
					//Section that provides for table reordering
					//////////////////////////////////////////////////
					var fixHelperModified = function (e, tr)
					{
						var $originals = tr.children();
						var $helper = tr.clone();
						$helper.children().each(function (index)
						{
							$(this).width($originals.eq(index).width());
						});
						return $helper;
					},
					updateIndex = function (e, ui)
					{

						var inOrderIdList = "";
						var ordinal = 1;
						//console.log("---------------------------");
						var currentReorderNumber = 0;
						$('#fileUploadTable tbody tr').each(function ()
						{
							var currentImageKey = $(this).attr("ImageKey");

							if (vm.fileImageLibraryData) {
								vm.fileImageLibraryData.forEach(function (item)
								{
									if (item.ImageKey == currentImageKey)
									{
										item.Reordinal = currentReorderNumber += 10;
										if (item.Ordinal != item.Reordinal)
										{
											item.Ordinal = item.Reordinal;
											item.DescriptionModified = true;
											item.ModifierUserMasterId = securityService.GetCurrentUser().UserMasterId;
										}
									}

								});

							}

							uploader.queue.forEach(function(item) {
								if (item.ImageKey == currentImageKey)
								{
									item.Reordinal = currentReorderNumber += 10;
									if (item.Ordinal != item.Reordinal)
									{
										item.Ordinal = item.Reordinal;
										item.DescriptionModified = true;
										item.ModifierUserMasterId = securityService.GetCurrentUser().UserMasterId;
									}
								}
							});


							vm.SaveAllModifiedDescriptions();



							//Set the reorder field for all rows to a new number starting with 10, by 10
						});


					};



					if (!vm.readOnly) {
						
						$timeout(function ()
						{
							$('textarea').each(function (index, el)
							{
								el.style.height = "1px";
								el.style.height = (15 + el.scrollHeight) + "px";

							});
							$("#fileUploadTable tbody").sortable({
								helper: fixHelperModified,
								stop: updateIndex
							}).disableSelection();
						}, 150);
					}
				

					//////////////////////////////////////////////////
					//////////////////////////////////////////////////

					//Go and get the data from the file image library based on the image keys.
					//console.log("vm.imageKeys = %O", vm.imageKeys);

					function LoadList() {
						if (vm.imageKeys && vm.imageKeys.length > 0)
						{
							var list = vm.imageKeys.distinct().join(',');
							var reordinal = 0;


							vm.fileImageLibraryData = [];
							var url = fileImageLibraryServerBaseAddress + "ByImageKeyList?$format=application/json;odata.metadata=none";
							$http.post(url, list)
							.then(function (response)
							{
								var dataStruct = response.data.value.orderByDescending(function (f) { return f.CreationDate }).distinct(function (a, b) { return a.ImageKey == b.ImageKey });
								vm.fileImageLibraryData = dataStruct;
								//Setup the source url for the thumbnail if this is an image paste.
								vm.fileImageLibraryData.forEach(function (item)
								{
									var includeThumbnail = false;
									if (item.FileName == "Pasted Image")
									{
										includeThumbnail = true;
									}

									var fileExtension = item.FileName.split('.').pop().toLowerCase();
									////console.log(fileExtension);
									if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "jpg" || fileExtension == "gif" || fileExtension == "bmp")
									{
										includeThumbnail = true;
									}


									//Assign an icon for the file
									if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
									{
										//This is an icon file display. Assign the right one.
										item.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
									}


									if (includeThumbnail)
									{
										item.thumbnailUrl = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + item.ImageKey;
									}
									item.Reordinal = reordinal+=10;
									if (item.Ordinal != item.Reordinal) {
										item.Ordinal = item.Reordinal;
										item.DescriptionModified = true;
									}
									personnelService.GetPersonById(item.CreatorUserMasterId).then(function (person)
									{
										item.CreatorPerson = person;
									});
									personnelService.GetPersonById(item.ModifierUserMasterId).then(function (person)
									{
										item.ModifierPerson = person;
									});
								});
								//console.log("vm.fileImageLibraryData = %O", vm.fileImageLibraryData);
							});

						}

					}

					LoadList();


					$scope.$watchCollection("vm.imageKeys", function (newValue, oldValue)
					{
						if (oldValue != newValue)
						{

							//console.log("vm.imageKeys changed");
							//console.log("oldValue = %O", oldValue);
							//console.log("newValue = %O", newValue);

							//Find out What changed.
							var removedImageKeys = [];
							var addedImageKeys = [];

							//Collect the missing keys
							oldValue.forEach(function (oldKey) {
								var found = false;
								newValue.forEach(function(newKey) {
									if (oldKey == newKey) {
										found = true;
									}
								});
								if (!found) {
									removedImageKeys.push(oldKey);
								}
							});

							//Collect the added keys:
							newValue.forEach(function (newKey)
							{
								var found = false;
								oldValue.forEach(function (oldKey)
								{
									if (oldKey == newKey)
									{
										found = true;
									}
								});
								if (!found)
								{
									addedImageKeys.push(newKey);
								}
							});

							//console.log("removedImageKeys = %O", removedImageKeys);
							//console.log("addedImageKeys = %O", addedImageKeys);

							//Find the key in the previous and uploaded files and remove them.
							removedImageKeys.forEach(function(removedKey) {
								vm.fileImageLibraryData.forEach(function(item, index) {
									if (item.ImageKey == removedKey) {
										//console.log("Removing image key = " + removedKey + " at index " + index);
										vm.fileImageLibraryData.splice(index, 1);
									}
								});
								//console.log("vm.fileImageLibraryData is now %O", vm.fileImageLibraryData);

								uploader.queue.forEach(function(uploadedItem, index) {
									if (uploadedItem.fileImageLibraryEntry.ImageKey == removedKey) {
										uploader.queue.splice(index, 1);
									}
								});
							});


							//Add the new upload to the previous files collection
							addedImageKeys.forEach(function(newImageKey) {
								var url = "https://odataprod.utmb.edu/FileImageLibrary/ByImageKeyList?$format=application/json;odata.metadata=none";
								//var url = "http://localhost:41840/ByImageKeyList?$format=application/json;odata.metadata=none";
								$http.post(url, newImageKey)
								.then(function (response)
								{
									var item = response.data.value[0];
									if (item) {
										var includeThumbnail = false;
										if (item.FileName == "Pasted Image")
										{
											includeThumbnail = true;
										}

										var fileExtension = item.FileName.split('.').pop().toLowerCase();
										//console.log(fileExtension);
										if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "jpg" || fileExtension == "gif" || fileExtension == "bmp")
										{
											includeThumbnail = true;
										}


										//Assign an icon for the file
										if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
										{
											//This is an icon file display. Assign the right one.
											item.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
										}


										if (includeThumbnail)
										{
											item.thumbnailUrl = "https://odatatest.utmb.edu/FileImageLibrary/downloads/imagekey?ImageKey=" + item.ImageKey;
										}
										if (!vm.fileImageLibraryData) {
											vm.fileImageLibraryData = [];
										}
										//vm.fileImageLibraryData.push(item);

									}
								});

							});

							//var uploaderImageKeys = [];
							//uploader.queue.forEach(function(item) {

							//});


							//if (uploader.queue.length > 0) {
							//	for (var i = 0; i < uploader.queue.length; i++) {
							//		if(uploader.queue[i].fileImageLibraryEntry.ImageKey)
							//	}
							//}
							//LoadList();
						}
					});

					vm.markDescriptionModified = function (item)
					{
						item.DescriptionModified = true;
					}

					
					var intHSize = (window.screen.availWidth) * .70;
					var intVSize = (window.screen.availHeight) * .70;
					var intTop = (window.screen.availHeight - intVSize) / 2;
					var intLeft = (window.screen.availWidth - intHSize) / 2;


					var strFeatures = "";

					set_window_size(.85);

					function set_window_size(sngWindow_Size_Percentage)
					{
						intHSize = (window.screen.availWidth) * sngWindow_Size_Percentage * .6;
						intVSize = (window.screen.availHeight) * sngWindow_Size_Percentage;
						intTop = (window.screen.availHeight - intVSize) / 2;
						intLeft = (window.screen.availWidth - intHSize) / 2;
						strFeatures = "top=" + intTop + ",left=" + intLeft + ",height=" + intVSize + ",width=" + intHSize + ", scrollbars=yes, resizable=yes, location=no";
					}

					if (uploader.isHTML5) {
						vm.showHtml5CtrlVInstruction = "(To paste a clipboard image here: click on this panel, then Ctrl-V)";
					}
					if (!vm.readOnly) {
						vm.panelSubtitle = "Drop files anywhere below. Descriptions are editable. Drag item to re-order. Esc to exit. " + vm.showHtml5CtrlVInstruction;
					}

					function window_open(strURL)
					{
						var SRWindow = window.open(strURL, "SRWindow", strFeatures);
					}

					vm.SaveAndClose = function() {
						//Iterate through the ss that have changed and save all of them.
						vm.SaveAllModifiedDescriptions();
						//console.log(uploader.queue);
						$state.go("^");

					}


					$scope.$on("FileImageLibrary.ImageKeyDescription Changed", function(event, data) {
						//console.log("FileImageLibrary.ImageKeyDescription Changed event received. Data = %O", data);
						//search our image key sets and see if one of them need to have the description changed.

					});

					vm.SaveAllModifiedDescriptions = function() {
						//Iterate through the ss that have changed and save all of them.
						if (vm.fileImageLibraryData)
						{

							vm.fileImageLibraryData.forEach(function (previousFile)
							{
								if (previousFile.DescriptionModified)
								{
									var dto = {
										ImageKey: previousFile.ImageKey,
										Description: previousFile.Description,
										Ordinal: previousFile.Ordinal,
										CreatorUserMasterId: previousFile.CreatorUserMasterId,
										ModifierUserMasterId: securityService.GetCurrentUser().UserMasterId
									}
									$odataresource(fileImageLibraryServerBaseAddress + "Downloads/SaveDescription/").update(dto).$promise.then(function (data) {
										//console.log("Downloads/SaveDescription/ returned data = %O", data);
										signalR.SignalAllClients("FileImageLibrary.ImageKeyDescription Changed", dto);
									});
									//save it
									previousFile.DescriptionModified = false;
								}
							});
						}
						uploader.queue.forEach(function (upload)
						{
							if (upload.DescriptionModified)
							{
								////console.log("upload item = %O", upload);
								var dto = {
									ImageKey: upload.fileImageLibraryEntry.ImageKey,
									Description: upload.Description,
									Ordinal: upload.Ordinal,
									CreatorUserMasterId: securityService.GetCurrentUser().UserMasterId
							}
								////console.log("dto = %O", dto);
								$odataresource(fileImageLibraryServerBaseAddress + "Downloads/SaveDescription/").update(dto);
								upload.DescriptionModified = false;
								signalR.SignalAllClients("FileImageLibrary.ImageKeyDescription Changed", dto);
							}
						});
					}




					vm.removeAllUploads = function ()
					{
						if (confirm("You have just chosen to remove and delete all the uploads below!. Are you sure you want to do this?")) {
							uploader.queue.forEach(function (uploadItem) {
								////console.log("upload item to be removed = %O", uploadItem);
								vm.removeUploadFunction()(uploadItem.fileImageLibraryEntry.ImageKey);
							});
							uploader.clearQueue();

							if (vm.fileImageLibraryData) {
								vm.fileImageLibraryData.forEach(function (previousFile)
								{
									vm.removeUploadFunction()(previousFile.ImageKey);
								});
								vm.fileImageLibraryData = null;

							}

						}
					}

					vm.receivedFile = function (file)
					{
						//console.log('received file!', file);
					}



					function handlePaste(e)
					{
						if (!vm.readOnly) {

							//console.log("Clipboard Data Items Count = %O", e.clipboardData.items.length);
							//console.log("Clipboard Data Files Count = %O", e.clipboardData.files.length);
							//console.log("Clipboard Data Types Count = %O", e.clipboardData.types.length);
							e.clipboardData.types.forEach(function(t) {
								//console.log(t);
							});

							for (var i = 0; i < e.clipboardData.items.length; i++)
							{

								//var items = (e.clipboardData || e.originalEvent.clipboardData).items;
								//for (var index in items)
								//{
								//	var item = items[index];
								//	if (item.kind === 'file')
								//	{
								//		var blob = item.getAsFile();
								//		var reader = new FileReader();
								//		reader.onload = function (event) {
								//			//console.log(event.target.result);
								//		}; // data url!
								//		reader.readAsDataURL(blob);
								//	}
								//}

								//console.log("e.clipboardData = %O", e.clipboardData);

								var item = (e.clipboardData || e.originalEvent.clipboardData).items[i];
								//console.log("item = %O", item);
								if (item.type.indexOf("image" == -1))
								{
									var pastedImageAsFile = item.getAsFile();
									//console.log("pastedImageAsFile = %O", pastedImageAsFile);
									var URLObj = window.URL || window.webkitURL;
									try {
										var sourceUrl = URLObj.createObjectURL(pastedImageAsFile);
										//console.log("sourceUrl = " + sourceUrl);
										pastedImageAsFile.name = "Pasted Image";
										pastedImageAsFile.imageDisplayUrl = sourceUrl;
										uploader.addToQueue(pastedImageAsFile);
										$timeout(function() {
											$scope.$apply();
										}, 100);

									} catch (err) {
										
									}
								} else
								{
									//console.log("Discardingimage paste data");
								}

								e.preventDefault();
							}

						}
					}

					$timeout(function ()
					{
						document.getElementById("pasteTarget").addEventListener("paste", handlePaste);
					}, 200);

					vm.viewItem = function (item)
					{
						var url = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + item.ImageKey;
						window_open(url);


					}


					vm.ViewItemIfReadOnly = function (item)
					{
						if (vm.mode == "readOnly") {
							vm.viewItem(item);
						}
					}



					vm.imageSourceUrl = function(imageKey) {
						var url = "";
						////console.log(item);
						if (imageKey)
						{
							url = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + imageKey;
						} 
					}


					// FILTERS

					uploader.filters.push({
						name: 'customFilter',
						fn: function (item /*{File|FileLikeObject}*/, options)
						{
							return this.queue.length < 1000;
						}
					});

					// CALLBACKS
					//$window.open('url', '_blank');

					uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options)
					{
						//console.info('onWhenAddingFileFailed', item, filter, options);
					};
					uploader.onAfterAddingFile = function (fileItem) {
						////console.log("fileItem uploading = %O", fileItem);
						fileItem.upload();
						//Assign an icon for the file
						var fileExtension = fileItem.file.name.split('.').pop();
						if (iconmenu.indexOf(fileExtension.toLowerCase()) > -1)
						{
							//This is an icon file display. Assign the right one.
							fileItem.iconFile = "images/FileUpload/icon-" + fileExtension + ".png";
						}
						fileItem.DescriptionModified = false;
						//console.info('onAfterAddingFile', fileItem);
					};
					uploader.onAfterAddingAll = function (addedFileItems)
					{
						//console.info('onAfterAddingAll', addedFileItems);
					};
					uploader.onBeforeUploadItem = function (item)
					{
						//console.info('onBeforeUploadItem', item);
					};
					uploader.onProgressItem = function (fileItem, progress)
					{
						//console.info('onProgressItem', fileItem, progress);
					};
					uploader.onProgressAll = function (progress)
					{
						//console.info('onProgressAll', progress);
					};
					uploader.onSuccessItem = function (fileItem, response, status, headers)
					{
						var alreadyPresent = false;
						////console.log("Server response from upload = %O", response);
						////console.log("fileItem = %O", fileItem);
						uploader.queue.forEach(function (item)
						{
							if (item.fileImageLibraryEntry && item.fileImageLibraryEntry.ImageKey == response.ImageKey)
							{
								alreadyPresent = true;
							}
						});
						if (vm.fileImageLibraryData) {
							
							vm.fileImageLibraryData.forEach(function (item)
							{
								if (item.ImageKey == response.ImageKey)
								{
									alreadyPresent = true;
								}

							});
						}


						var fileDataObject = {
							ImageKey: response.ImageKey,
							size: {
								original: response.intOriginal_Size,
								compressed: response.intCompressed_Size
							},
							name: response.strFilename
						}
						fileItem.ImageKey = response.ImageKey;
						fileItem.FileName = response.strFilename;
						fileItem.CreatorUserMasterId = securityService.GetCurrentUser().UserMasterId;
						fileItem.CreatorPerson = vm.CurrentUserPerson;
						fileItem.fileImageLibraryEntry = fileDataObject;
						////console.log("fileDataObject before description = %O", fileDataObject);
						if (response.Description == null || response.Description == "") {
							fileItem.Description = fileItem.file.name.split('.').shift();
							
						} else {
							
							fileItem.Description = response.Description;
						}
						var includeThumbnail = false;

						var fileExtension = fileItem.file.name.split('.').pop().toLowerCase();
						if (fileExtension == "jpg" || fileExtension == "png" || fileExtension == "gif" || fileExtension == "bmp")
						{
							includeThumbnail = true;
						}


						if (includeThumbnail)
						{
							fileItem.thumbnailUrl = fileImageLibraryServerBaseAddress + "downloads/imagekey?ImageKey=" + response.ImageKey;
						}
						//Only call the add upload function for the file image if it was not already there
						if (!alreadyPresent) {
							vm.imageKeys.push(fileDataObject.ImageKey);
							//console.log("ImageKeys array = %O", vm.imageKeys);
							//console.log("FileUploadDirective about to call the upload external function with an ImageKey = " + fileDataObject.ImageKey);
							vm.addUploadFunction()(fileDataObject.ImageKey);
							//console.log("Finished calling the external upload function");
						}


						fileItem.Ordinal = uploadReordinal++;

						$timeout(function ()
						{
							$('textarea').each(function (index, el)
							{
								el.style.height = "1px";
								el.style.height = (15 + el.scrollHeight) + "px";

							});
						}, 150);
						fileItem.DescriptionModified = true;
						//console.info('onSuccessItem', fileItem, response, status, headers);
					};

					vm.removeUploaderItem = function (item)
					{
						if (confirm("You have just chosen to remove and delete an upload!. Are you sure you want to do this?"))
						{
							vm.removeUploadFunction()(item.fileImageLibraryEntry.ImageKey);
							item.remove();
						}

					}

					vm.removePreviousFile = function (previousFile)
					{
						if (confirm("You have just chosen to remove and delete an upload!. Are you sure you want to do this?"))
						{
							//Find the file in the local array and get rid of it
							for (var i = 0; i < vm.fileImageLibraryData.length; i++)
							{
								if (vm.fileImageLibraryData[i].ImageKey == previousFile.ImageKey)
								{
									vm.fileImageLibraryData.splice(i, 1);
								}
							}



							vm.removeUploadFunction()(previousFile.ImageKey);

							//The above is equivalent to:
							//var func = vm.removeUploadFunction();
							//func(previousFile.ImageKey);
						}

					}
					uploader.onErrorItem = function (fileItem, response, status, headers)
					{
						//console.info('onErrorItem', fileItem, response, status, headers);
					};
					uploader.onCancelItem = function (fileItem, response, status, headers)
					{
						//console.info('onCancelItem', fileItem, response, status, headers);
					};
					uploader.onCompleteItem = function (fileItem, response, status, headers)
					{
						//console.info('onCompleteItem', fileItem, response, status, headers);
					};
					uploader.onCompleteAll = function ()
					{
						//console.info('onCompleteAll');
						//console.log("Queue = %O", uploader.queue);
					};

					//console.info('uploader', uploader);

					$timeout(function ()
					{
						displaySetupService.SetPanelDimensions();
					}, 100);


					hotkeys.bindTo($scope)
						.add({
							combo: 'esc',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function ()
							{
								vm.SaveAllModifiedDescriptions();
								$timeout(function() {
									$state.go("^");
								}, 150);

							}
						});


				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "angular/common/directives/panels/fileUploadListDirectiveTemplate.html?" + Date.now(),

					scope: {
						
						imageKeys: "=",
						listTitle: "@",
						removeUploadFunction: "&",
						updateDescriptionFunction: "&",
						addUploadFunction: "&",
						hideCloseButton: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());
(function ()
{

	var app = angular.module('app');

	app.directive('personnelSelectorList',
		[
			"odataService", "personnelService", "utilityService", "$odata", "dataCache", "$state", "hotkeys", "displaySetupService", "$timeout",

			function (odataService, personnelService, utilityService, $odata, dataCache, $state, hotkeys, displaySetupService, $timeout)
			{

				var controller = function ($scope)
				{

					var vm = this;
					vm.stateName = $state.current.name;
					vm.personnelService = personnelService;

					console.log("personnelSelectorList directive - vm.people = %O", vm.people);


					function IsInMyPeople(person) {
						if (vm.people) {
							for (var l = 0; l < vm.people.length; l++) {
								if (vm.people[l].MasterId == person.MasterId) {
									return true;
								}
							}
							return false;
						}
						return false;
					};


					vm.SelectContact = function (item, model, label, event) {
						personnelService.GetPersonById(item.MasterId).then(function(data) {
							console.log("Person Model from personnelService = %O", data);
							if (!IsInMyPeople(data)) {
								utilityService.ReplaceItemInArrayById(vm.people, data);
								vm.addPersonFunction()(data);
							}
							vm.Person = null;
						});
					};

					vm.searchPeople = function (searchTerm)
					{
						if (searchTerm.length > 2)
						{
							vm.searchingPeople = true;
							//console.log(searchTerm);
							return personnelService.GenericSearch(searchTerm);

						}
						return null;
					};

					vm.RemovePerson = function(person) {
						utilityService.RemoveItemFromArrayById(vm.people, person);
						vm.removePersonFunction()(person);
					};

					hotkeys.bindTo($scope)
					.add({
						combo: 'esc',
						description: 'Cancel and close any input form',
						allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
						callback: function ()
						{
							$state.go("^");
						}
					});

					$timeout(function() {
						displaySetupService.SetPanelDimensions();
					},10);

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "angular/common/directives/panels/personnelSelectorListDirectiveTemplate.html?" + Date.now(),

					scope: {
						people: "=",
						listTitle: "@",
						removePersonFunction: "&",
						addPersonFunction: "&"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());
(function () {

	"use strict";

	angular.module("app")
		.directive('sglclick',
			[
				'$parse', function ($parse) {
					return {
						restrict: 'A',
						link: function (scope, element, attr) {
							var fn = $parse(attr['sglclick']);
							var delay = 200, clicks = 0, timer = null;
							element.on('click',
								function (event) {
									clicks++; //count clicks
									if (clicks === 1) {
										timer = setTimeout(function () {
												scope.$apply(function () {
													fn(scope, { $event: event });
												});
												clicks = 0; //after action performed, reset counter
											},
											delay);
									} else {
										clearTimeout(timer); //prevent single-click action
										clicks = 0; //after action performed, reset counter
									}
								});
						}
					};
				}
			]);
}());

(function ()

{
	"use strict";

	angular.module("app")
		.directive("systemForm", function ()
		{
			return {
				restrict: "E",
				templateUrl: "app/directives/panels/systemForm.html?" + Date.now,
				replace: true,
				scope: {
					name: "@"
				},
				transclude: true

			};
		});
}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemFullscreenPanel", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemFullscreenPanel.html?" + Date.now,
				replace: true,
				transclude: true
			};
		});
}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemModalPanel", function ($compile)
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemModalPanel.html?" + Date.now(),
				priority:  -1,
				replace: true,
				transclude: true,
				scope: {				//Create a new isolated scope for the directive contents being placed into the dom and set the labelText scope property 
					maxWidth: "@"
				}
			};
		});
}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemPanelHeading", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemPanelHeading.html?" + Date.now,
				replace: true,
				scope: {
					panelTitle: "@",
					panelSubTitle: "@",
					panelHeadingId: "@"
				},
				transclude: true

			};
		});
}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemPanelHeadingButtons", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemPanelHeadingButtons.html?" + Date.now,
				replace: true,
				transclude: true

			};
		});
}());


(function ()
{

	"use strict";

	angular.module("app")
		.directive("systemStaticPanel", function ()
		{
			return {
				restrict: "E",
				templateUrl: "angular/common/directives/panels/systemStaticPanel.html?" + Date.now,
				replace: true,
				transclude: true,
				scope: {
					maxPanelWidth: "@"
				}

			};
		});
}());


(function ()
{
	"use strict";


	function SystemIframeCtrl($state, $stateParams, $sce, $scope, displaySetupService, $timeout, hotkeys)
	{
		var vm = this;


		console.log("SystemIframeCtrl invoked");
		displaySetupService.SetPanelDimensions();

		vm.reportTitle = $stateParams.title;

		vm.state = $state;

		vm.url = $sce.trustAsResourceUrl($stateParams.url);

		console.log($stateParams);

		
		$scope.$emit("dataLoaded", null);

		$timeout(function() {
			displaySetupService.SetPanelDimensions();
		}, 500);



	}

	angular
			.module("app")
			.controller("SystemIframeCtrl", [
				"$state",
				"$stateParams",
				"$sce",
				"$scope",
				"displaySetupService",
				"$timeout",
				"hotkeys",
				SystemIframeCtrl
			]);



})();
(function () {

	var app = angular.module('app');

	app.directive('bhsActiveAlarms',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//Used for header font sizes
					var fontFactor = .01;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {

							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsActiveAlarms Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					//console.log("vm.diffDays = " + vm.diffDays);

					function GetChartData(refresh) {

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds" : "BHSActiveAlarmSummaryByHourWithAverageDurationInSeconds")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSActiveAlarmSummaryByDayWithAverageDurationInSeconds initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.AlarmDay || item.AlarmHour)).getTime(), item.AlarmCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							});
					}


					GetChartData();

					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (chart && widgetBodyDimensions) {
							chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						try {
							vm.chart = Highcharts.chart('containerBhsActiveAlarms' + vm.widget.Id, {
								chart: {
									type: 'spline',
									animation: false,
									marginRight: 10,
									events: {
										load: function () {

											// set up the updating of the chart each second
											vm.chartSeries = this.series[0];
										}
									}
								},
								animation: false,
								credits: { enabled: false },
								title: {
									text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour',
									style: {
										fontSize: '.8em'
									}
								},
								xAxis: {
									type: 'datetime',
									dateTimeLabelFormats: {
										day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
										month: '%b \'%y'
									},
									labels: {
										autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
										style: {
											fontSize: '10px',
											fontFamily: 'Verdana, sans-serif'
										}
									}
								},
								yAxis: {
									title: {
										text: ''
									},
									plotLines: [{
										value: 0,
										width: 1,
										color: '#808080'
									}]
								},
								tooltip: {
									formatter: function () {

										//console.log("Current this = %O", this);
										return '<b>' + this.series.name + '</b><br/>' +
											Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
											+ '<br/>' +
											Highcharts.numberFormat(this.y, 0) + ' Alarms';
									}
								},
								legend: {
									enabled: false
								},
								exporting: {
									enabled: true
								},
								series: [{
									name: 'Alarms',
									data: vm.chartData
								}]
							});

						} catch (e) {

						}

					}


					//console.log("bhsCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("bhsCurrentAlarmsTable dashboard = %O", vm.dashboard);
					//console.log("bhsActiveAlarms widgetId = %O", vm.widget.Id);

					$scope.$on("BHS.CurrentAlarm", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm event. Alarm = %O", a);
						formatAlarm(a);
						calculateAlarmDuration(a);
						vm.alarms = [a].concat(vm.alarms).distinct(function (a, b) { return +a.Id == +b.Id }).where(function (a) { return a.TransactionType != 'Inactive' && (!a.Hide || a.Hide == 0) });

						GetChartData(true);

					});

					$scope.$on("BHS.CurrentAlarm.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});

					function GetData() {
						dataService.GetIOPSResource("BHSCurrentAlarms")
												.query().$promise.then(function (data) {


													//console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {


														formatAlarm(a);
														calculateAlarmDuration(a);

													});


													vm.alarms = data.where(function (a) { return a.TransactionType != 'Inactive' && a.Hide == 0 });

													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


													$interval(function () {
														SetChartSizeLine(vm.widget.Id, vm.chart);

													}, 50, 20);

												});
					}

					GetData();



					vm.sortField = '-ActiveDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								calculateAlarmDuration(a);

							});

						}
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.secondInterval);

					});






				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsActiveAlarms.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsAlarmHistoryTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.alarms = [];

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
				

					$scope.$on("BHS.AlarmHistory", function (event, a) {
						GetData();
					});

					$scope.$on("Dashboard", function (event, a) {
						GetData();
					});


					vm.columnwidths = {
						ActiveDateTime: 10,
						BHSName: 10,
						Location: 12,
						Alarm: 20,
						AcknowledgeDateTime: 10,
						InactiveDateTime: 10,
						DurationActiveToAcknowledgeSeconds: 10,
						DurationActiveToInactiveSeconds: 10


                    }




					$scope.$on("BHS.AlarmHistory.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});
					GetData();


                    

					vm.sortField = '-ActiveDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}


					//Id the dashboard parameteres change, then reload the data based upon the date range.
					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboard.Id) {
							vm.dashboard = dashboard;

						}

					});


					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeDateTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeDateTime);

						if (a.InactiveDateTime) {
							a.InactiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.InactiveDateTime);

						}
						a.DurationActiveToAcknowledge = utilityService.SecondsToString(a.DurationActiveToAcknowledgeSeconds);
						a.DurationActiveToInactive = utilityService.SecondsToString(a.DurationActiveToInactiveSeconds);
						
					}


					vm.leastId = 0;

					function GetData(lessThanId) {

						if (!lessThanId) {
							lessThanId = 999999999999;
						}

						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


						dataService.GetIOPSWebAPIResource("BHSAlarmsHistoryByAlarmTypeAndDateRangeWithDurationInSeconds")
							.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									siteId: 81463,
									alarmType: "%"
								},
								function(data) {
									vm.data = data;

									data.forEach(function (a) {


										formatAlarm(a);

									});


									vm.alarms = data;
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

									$scope.$$postDigest(function () {
										$timeout(function () {
											displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
										}, 1);

									});



								});


						
					}




					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								
							},50,20);
						}
					});



					vm.scrolledToEnd = function () {
						console.log("Scrolled to end fired");
						//var leastId = vm.alarms.min(function (d) { return d.Id });
						//GetData(leastId);

					}




				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsAlarmHistoryTable.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	;

	var app = angular.module('app');

	app.directive('bhsBagDimensionerReadAccuracySummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsBagDimensionerReadAccuracySummary vm.dashboard = %O", vm.dashboard);


					var fontFactor = .0055;
					var fontMax = 3;


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsBagDimensionerReadAccuracySummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

						//+Only react if this dashboard change signal is the one we are on.
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							vm.overallGoodReadRate = null;
							vm.overallFailedReadRate = null;
							vm.scannerReadRates = null;
							GetData();
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetData() {
						dataService.GetIOPSWebAPIResource("BHSBagDimensionerPercentReadRateReportGroupedByDateRange")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSBagDimensionerPercentReadRateReportGroupedByDateRange initial data = %O", data);
								vm.detailReadRates = data.take(data.length - 1);
								vm.summaryReadRates = data.skip(data.length - 1).first();

								vm.totalInGaugeReadsMessage = (vm.summaryReadRates.PercentInGaugeReads || 0) + "% In";
								vm.totalOutOfGaugeReadsMessage = (vm.summaryReadRates.PercentOutOfGaugeReads || 0) + "% Out";
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								if (vm.widgetDimensions) {

									vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
									if (vm.largeTextSize > fontMax) {
										vm.largeTextSize = fontMax;
									}

									$timeout(function () {
										displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									}, 100);
								}

							});
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
					}



					GetData();

					vm.updateInterval = $interval(function() {
						GetData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
								if (vm.largeTextSize > fontMax) {
									vm.largeTextSize = fontMax;
								}
							},50,20);
						}
					});



				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsBagDimensionerReadAccuracySummary.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsBagJamsWithHistoryChart',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;

					var fontFactor = .01;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {

							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsBagJamsWithHistoryChart Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					//console.log("vm.diffDays = " + vm.diffDays);

					function GetChartData(refresh) {

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds" : "BHSActiveAlarmSummaryByAlarmTypeAndHourWithAverageDurationInSeconds")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463,
								alarmType: 'Jam'
							}, function (data) {
								//console.log("BHSActiveAlarmSummaryByAlarmTypeAndDayWithAverageDurationInSeconds initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.AlarmDay || item.AlarmHour)).getTime(), item.AlarmCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Jams Per Day' : 'Jams Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();
							});

					}


					GetChartData();

					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (chart && widgetBodyDimensions) {
							chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						try {
							vm.chart = Highcharts.chart('containerBhsBagJamsWithHistoryChart' + vm.widget.Id, {
								chart: {
									type: 'spline',
									animation: false,
									marginRight: 10,
									events: {
										load: function () {

											// set up the updating of the chart each second
											vm.chartSeries = this.series[0];
										}
									}
								},
								animation: false,
								credits: { enabled: false },
								title: {
									text: (vm.diffDays > 5) ? 'Jams Per Day' : 'Jams Per Hour',
									style: {
										fontSize: '.8em'
									}
								},
								xAxis: {
									type: 'datetime',
									dateTimeLabelFormats: {
										day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
										month: '%b \'%y'
									},
									labels: {
										autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
										style: {
											fontSize: '10px',
											fontFamily: 'Verdana, sans-serif'
										}
									}
								},
								yAxis: {
									title: {
										text: ''
									},
									plotLines: [{
										value: 0,
										width: 1,
										color: '#808080'
									}]
								},
								tooltip: {
									formatter: function () {

										//console.log("Current this = %O", this);
										return '<b>' + this.series.name + '</b><br/>' +
											Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
											+ '<br/>' +
											Highcharts.numberFormat(this.y, 0) + ' Jams';
									}
								},
								legend: {
									enabled: false
								},
								exporting: {
									enabled: true
								},
								series: [{
									name: 'Jams',
									data: vm.chartData
								}]
							});

						} catch (e) {

						}


					}


					//console.log("bhsCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("bhsCurrentAlarmsTable dashboard = %O", vm.dashboard);
					//console.log("bhsBagJamsWithHistoryChart widgetId = %O", vm.widget.Id);

					$scope.$on("BHS.CurrentAlarm", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm event. Alarm = %O", a);
						formatAlarm(a);
						calculateAlarmDuration(a);
						vm.alarms = [a].concat(vm.alarms).distinct(function (a, b) { return +a.Id == +b.Id }).where(function (a) { return a.TransactionType != 'Inactive' && a.Description == 'Jam' });

						GetChartData(true);

					});

					$scope.$on("BHS.CurrentAlarm.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});

					function GetData() {
						dataService.GetIOPSResource("BHSCurrentAlarms")
												.filter("Description", "Jam")
												.query().$promise.then(function (data) {


													//console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {


														formatAlarm(a);
														calculateAlarmDuration(a);

													});


													vm.alarms = data.where(function (a) { return a.TransactionType != 'Inactive' });

													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


													$interval(function () {
														SetChartSizeLine(vm.widget.Id, vm.chart);

													}, 50, 20);
												});
					}

					GetData();



					vm.sortField = '-ActiveDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								calculateAlarmDuration(a);

							});

						}
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.secondInterval);

					});






				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsBagJamsWithHistoryChart.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsCurrentAlarmsTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data



					//console.log("bhsCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("bhsCurrentAlarmsTable dashboard = %O", vm.dashboard);
					console.log("bhsCurrentAlarmsTable widgetId = %O", vm.widget.Id);

					$scope.$on("BHS.CurrentAlarm", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						//console.log("BHS.CurrentAlarm event. Alarm = %O", a);
						formatAlarm(a);
						calculateAlarmDuration(a);
						vm.alarms = [a].concat(vm.alarms).distinct(function (a, b) { return +a.Id == +b.Id }).where(function(a){return a.TransactionType != 'Inactive'});
					});

					$scope.$on("BHS.CurrentAlarm.Delete", function (event, a) {
						a = dataService.GetJsonFromSignalR(a);
						console.log("BHS.CurrentAlarm.Delete event. Alarm = %O", a);
						vm.alarms = vm.alarms.where(function (alarm) { return +a.Id != +alarm.Id });

					});

					function GetData() {
						dataService.GetIOPSResource("BHSCurrentAlarms")
												.query().$promise.then(function (data) {


													//console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {


														formatAlarm(a);
														calculateAlarmDuration(a);

													});


													vm.alarms = data.where(function(a){return a.TransactionType != 'Inactive'});

													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
												});
					}

					GetData();



					vm.sortField = '-ActiveDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								calculateAlarmDuration(a);

							});

						}
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.secondInterval);

					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								
							},50,20);
						}
					});





				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsCurrentAlarmsTable.html?" + Date.now(),

					scope: {

						widget: "=",
						dashboard: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsJamAlarmsTable',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					GetData();

					vm.sortField = '-AlarmDateTime';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;
								vm.alarms = vm.alarms.orderBy(function (alarm) {
									return alarm[fieldName];
								});


							} else {
								vm.sortField = "-" + fieldName;
								vm.alarms = vm.alarms.orderByDescending(function (alarm) {
									return alarm[fieldName];
								});
								
							}
						} else {
							vm.sortField = fieldName;
							vm.alarms = vm.alarms.orderBy(function (alarm) {
								return alarm[fieldName];
							});

						}
					}


					function GetData() {
						dataService.GetIOPSResource("BHSJamAlarms")
												.orderBy("Id", "desc")
												.take(100)
												.query().$promise.then(function (data) {


													console.log("data from OData Source = %O", angular.copy(data));
													data.forEach(function (a) {



														a.AlarmDateTime = utilityService.GetLocalDateFromUTCDateString(a.AlarmDateTime);

														if (a.ReturnToNormalTime) {
															a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

														}
														//console.log("a.ReturnToNormalTime = %O", a.ReturnToNormalTime);

														if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {
															if (a.ReturnToNormalTime && a.ReturnToNormalTime.getTime() < 1000) {
																a.ReturnToNormalTime = null;
																if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {
																	a.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
																}
															} else {
																a.Duration = moment.utc(moment(a.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss").diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
															}
														}

													});


													vm.alarms = data;
													//console.log("vm.alarms = %O", angular.copy(vm.alarms));
													//displaySetupService.SetPanelDimensions();
													displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
												});
					}


					vm.secondInterval = $interval(function () {
						if (vm.alarms) {
							vm.alarms.forEach(function (a) {

								if (a.TransactionType == 'Alarm Active' || a.TransactionType == 'Alarm Acknowledge') {

									if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
										a.ReturnToNormalTime = null;
										a.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss")
											.diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
									} else {
										a.Duration = moment.utc(moment(a.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss")
											.diff(moment(a.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
									}
								}

							});

						}
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.secondInterval);
					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								
							},50,20);
						}
					});


					$scope.$on("BHS.JamAlarm", function (event, signalRData) {
						var jamAlarmData = dataService.GetJsonFromSignalR(signalRData);

						jamAlarmData.AlarmDateTime = utilityService.GetLocalDateFromUTCDateString(jamAlarmData.AlarmDateTime);
						jamAlarmData.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(jamAlarmData.ReturnToNormalTime);

						if (jamAlarmData.TransactionType == 'Alarm Active' || jamAlarmData.TransactionType == 'Alarm Acknowledge') {
							if (jamAlarmData.ReturnToNormalTime.getTime() < 1000) {
								jamAlarmData.ReturnToNormalTime = null;
								jamAlarmData.Duration = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(jamAlarmData.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
							} else {
								jamAlarmData.Duration = moment.utc(moment(jamAlarmData.ReturnToNormalTime, "DD/MM/YYYY HH:mm:ss").diff(moment(jamAlarmData.AlarmDateTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
							}

						}


						vm.alarms = [jamAlarmData].concat(vm.alarms).distinct(function (a, b) { return a.Id == b.Id }).orderByDescending(function (a) { return a.Id });

					});

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsJamAlarmsTable.html?" + Date.now(),

					scope: {

						imageKeys: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsPercentBagsToCbra',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


				    //console.log("BHSPercentCBRAPerDay controller invoked");

					


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {							
							$interval(function() {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								
							},50,20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
					    //console.log("BHSPercentCBRAPerDay Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
					    dataService.GetIOPSWebAPIResource("BHSPercentCBRAPerDay")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    siteId: 81463
							}, function (data) {
							    console.log("BHSPercentCBRAPerDay initial data = %O", data);

							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data
										.forEach(function (d) {
										    //Find the data point that matches the area and bhs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.BHSName }).update(d.TotalCBRABags, false);
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                $timeout(function () {
							                    displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							                },
												50);
							            }, 50);
							        });
							    }
							    vm.data = data;

							});

					}

					GetChartData();

					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						GetChartData();
					});




					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsPercentBagsToCbra" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Percent Bags to CBRA',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.BHSName }),
								labels: {
								   
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								//tickInterval: 3600,
								//labels: {
								//	formatter: function () {
								//		var hours = this.value / 3600;

								//		return hours == 0 ? '' : hours + ' Hr';
								//	}
								//}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'CBRA Bags : <b>{point.y:.0f} </b><br/>Click for details'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
									}
								},
								

								series: {
								    cursor: 'pointer',
								    point: {
								        events: {
								            click: function (e) {
								                console.log("this = %O", this);
								                console.log("window = %O", window);
								                var filterCategory = this.category;
								                var chartThis = this;
								                dataService.GetIOPSWebAPIResource("BHSPercentCBRAPerDay")
                                                               .query({
                                                                   beginDate: vm.dashboard.webApiParameterStartDate,
                                                                   endDate: vm.dashboard.webApiParameterEndDate,
                                                                   siteId: 81463
                                                               }, function (data) {
                                                                   console.log("data from OData Source = %O", angular.copy(data));


                                                                   hs.htmlExpand(null, {
                                                                       pageOrigin: {
                                                                           x: e.pageX || e.clientX,
                                                                           y: e.pageY || e.clientY
                                                                       },

                                                                       headingText: 'CBRA Percent of Bags',
                                                                       maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
                                                                                          "<thead>" +
                                                                                              "<th>Area-Date</th>" +
                                                                                              "<th>Total Bag Count</th>" +
                                                                                              "<th>CBRA Bags</th>" +
                                                                                              "<th>CBRA Percent</th>" +

                                                                                           "</thead>" +
                                                                                           "<tbody>" +
                                                                                               data.select(function (d) {
                                                                                                   return "<tr>" +
                                                                                                  "<td>"
                                                                                                  + d.BHSName +
                                                                                                  "<td>"
                                                                                                  + d.TokenCount +
                                                                                                   "<td>"
                                                                                                  + d.TotalCBRABags +
                                                                                                   "<td>"
                                                                                                  + d.CBRAPercentOfTotal +"%"+
                                                                                                  "</tr>";
                                                                                               }).join("") +
                                                                                          "</tbody>" +
                                                                                       "</table>",


                                                                       width: 500,
                                                                       height: window.outerHeight * .3


                                                                   });


                                                               });


								            }
								        }
								    },
								    marker: {
								        lineWidth: 1
								    }
								}
							},
							series: [{ data: data.select(function (item) { return item.TotalCBRABags}) }]
						};

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.chart('bhsPercentBagsToCbra' + vm.widget.Id, chartOptions);
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsPercentBagsToCbra.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsPercentOfFailsafe',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					console.log("bhsPercentOfFailsafe controller invoked");



					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								
							},50,20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(false); //
						}
					});

					vm.state = $state;

				

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));





					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSPercentOfFailSafePerDay" : "BHSPercentOfFailSafePerHour")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTopFiveJamDevicesWithCount initial data = %O", data);
								console.log("data = %O", data);
								var formattedData = data.select(function(item) {

									return {
										BHSName: item.BHSName,
										TimeWindow: utilityService.GetLocalDateFromUTCDate(item.Hour || item.Day),
										NormalBagCount: item.PEBagCount - item.AlarmCount,
										FailsafeBagCount: item.AlarmCount,
										PercentFailsafe: item.Percent
									};

								})
								.orderBy(function (item) { return item.BHSName })
								.thenBy(function(item){return item.TimeWindow});

								console.log("FormattedData = %O", formattedData);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.DeviceName }).update(d.AlarmCount, false);
											//console.log("Updating the old data");
											//oldScanner.ChartObject.series[0].setData(newScannerData.Data.select(function (d) { return { y: d.GoodReads } }));
											//oldScanner.ChartObject.series[1].setData(newScannerData.Data.select(function (d) { return { y: d.BadReads } }));
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											$timeout(function() {
													displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
													displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

												},
												50);
										}, 50);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();









					//Refresh data on the 15 second system clock tick
					vm.updateInterval = $interval(function() {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});

					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'spline',
								renderTo: "bhsPercentOfFailsafe" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Percent of Failsafe Bags',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.AlarmType + ' (' + item.DeviceNameList + ')' }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								tickInterval: 3600,
								labels: {
									formatter: function () {
										var hours = this.value / 3600;

										return hours == 0 ? '' : hours + ' Hr';
									}
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Longest Duration: <b>{point.y:.0f} seconds</b>'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {

									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										//shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, .5)',
										borderWidth: 1,
										borderColor: '#aaa',
										style: {
											fontSize: '.85em',
											fontWeight: 'normal'
										},
										formatter: function () {
											//this.percentage	Stacked series and pies only. The point's percentage of the total.
											//this.point	The point object. The point name, if defined, is available through this.point.name.
											//this.series:	The series object. The series name is available through this.series.name.
											//this.total	Stacked series only. The total value at this point's x value.
											//this.x:	The x value.
											//this.y:	The y value.
											return utilityService.SecondsToString(this.y);
										}
									}

								}
							},
							series: [{ data: data.select(function (item) { return item.MaxDurationSec }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsPercentOfFailsafe' + vm.widget.Id, chartOptions);
						} catch (e) {

						} 
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsPercentOfFailsafe.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	;

	var app = angular.module('app');

	app.directive('bhsReadRatesHistoryChart',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsReadRatesHistoryChart vm.dashboard = %O", vm.dashboard);

					function CalculateDateRange() {
						var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
						vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						//console.log("vm.diffDays = " + vm.diffDays);
					}
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					CalculateDateRange();


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsReadRatesHistoryChart Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

						//+Only react if this dashboard change signal is the one we are on.
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							CalculateDateRange();
							GetChartData(true);
						}
					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							vm.data.forEach(function (item) {
								SetChartSize(item);
							});
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.data.forEach(function (item) {
									SetChartSize(item);
								});

							}, 100, 40);
						}
					});

					vm.state = $state;



					function SetChartSize(dataItem) {
						//Set the bar chart to be 40% high, 60% wide
						var containerDimensions = displaySetupService.GetDivDimensionsById(dataItem.ChartContainerId);
						if (dataItem.ChartObject) {
							dataItem.ChartObject.setSize(containerDimensions.width, containerDimensions.height - 30, false);
						}
					}


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetChartData(refresh) {


						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSAutomaticTokenReaderPercentReadRateReportGroupedByDay" : "BHSAutomaticTokenReaderPercentReadRateReportGroupedByHour")
								.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									siteId: 81463
								}, function (data) {
									//console.log("BHSAutomaticTokenReaderPercentReadRateReportGroupedByxxx initial data = %O", data);



									var formattedData = data
											.groupBy(function (t) { return t.Location })
												.orderBy(function (t) { return t.key })
												.select(function (group) {

													var scannerData = {
														Scanner: group.key,
														ChartObject: null,
														ChartContainerId: "chartContainer-" + vm.widget.Id + "-" + group.key,
														Data: group
															.orderBy(function (item) { return item.ScanHour || item.ScanDay })
															.select(function (item) {

																return {
																	TimeWindow: utilityService.GetLocalDateFromUTCDate(item.ScanHour || item.ScanDay),
																	TimeWindowAsString: "",
																	BadReads: item.BadReads,
																	GoodReads: item.GoodReads,
																	PercentFailedReads: item.PercentFailedReads,
																	PercentGoodReads: item.PercentReads,
																	TotalReads: item.TotalReads
																};
															})
													};

													//console.log("Scanner Data Grouped = %O", scannerData);

													//Caclculate the total good and bad for the chart being generated and add it as properties to the group.
													scannerData.totalGoodReads = scannerData.Data.sum(function (item) { return item.GoodReads });
													scannerData.totalBadReads = scannerData.Data.sum(function (item) { return item.BadReads });

													if (!vm.data || refresh) {

														$timeout(function () {
															displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
															scannerData.ChartObject = CreateChart(scannerData);
															SetChartSize(scannerData);
														});
													}


													return scannerData;

												});




									if (!vm.data || refresh) {
										vm.data = formattedData;
									} else {
										//The chart already exists.
										//Just update the data content of the vm.data object, and run the setData() method on the chart to keep it updated.
										vm.data.forEach(function (oldScanner) {
											//Find the chart and data collection to update.
											var newScannerData = formattedData.first(function (sd) { return sd.Scanner == oldScanner.Scanner });
											oldScanner.Data = newScannerData.Data;
											//console.log("Updating the old data");
											oldScanner.ChartObject.series[0].setData(newScannerData.Data.select(function (d) { return { y: d.GoodReads } }));
											oldScanner.ChartObject.series[1].setData(newScannerData.Data.select(function (d) { return { y: d.BadReads } }));
										});


									}

								});

					}


					function CreateChart(scannerData) {


						//If the chart object is already there then just refresh the data.

						//console.log("Chart regen = %O", scannerData.Data.select(function (d) { return { y: d.GoodReads } }));
						try {

							return Highcharts.chart(scannerData.ChartContainerId,
							{
								chart: {
									type: 'area'

								},
								title: {
									text: scannerData.Scanner + " - Read Rate " + (vm.diffDays > 5 ? "Per Day" : "Per Hour") + ' - ' + scannerData.totalGoodReads + ' Good Reads - ' + scannerData.totalBadReads + ' Bad Reads',
									style: {
										fontSize: '.8em'
									}
								},
								animation: false,
								credits: { enabled: false },
								xAxis: {
									//type: 'datetime',
									dateTimeLabelFormats: {
										day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
										month: '%b \'%y'
									},
									labels: {
										autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
										style: {
											fontSize: '10px',
											fontFamily: 'Verdana, sans-serif'
										}
									},
									//These are the date or hour entries
									categories: scannerData.Data.select(function (sd) {
										return vm.diffDays > 5 ? moment(sd.TimeWindow).format("MM/DD") : moment(sd.TimeWindow).format("MM/DD HH:00");
									}),
									tickmarkPlacement: 'on',
									title: {
										enabled: false
									}
								},
								yAxis: {
									title: {
										text: ''
									},
									visible: false
								},
								tooltip: {
									pointFormat: '<span>{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} Times)<br/>',
									split: true,
									hideDelay: 2000
								},
								plotOptions: {
									series: {
										animation: false
									},
									area: {
										stacking: 'percent',
										lineColor: '#ffffff',
										lineWidth: 1,
										marker: {
											lineWidth: 1,
											lineColor: '#ffffff'
										}
									}
								},
								legend: {
									enabled: false
								},
								series: [
									{
										name: 'Good Reads',
										data: scannerData.Data.select(function (d) { return { y: d.GoodReads } }),
										color: {
											linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
											stops: [
												[0, '#bbbbbb'],
												[1, '#ffffff']
											]
										}
									},
									{
										name: 'Failed Reads',
										data: scannerData.Data.select(function (d) { return { y: d.BadReads } }),
										color: {
											linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
											stops: [
												[0, '#ff0000'],
												[1, '#f4a4a4']
											]
										},

									}
								]

							});
						} catch (e) {

						}

					}


					GetChartData(false);

					vm.updateInterval = $interval(function() {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsReadRatesHistoryChart.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	;

	var app = angular.module('app');

	app.directive('bhsReadRatesSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {

					var vm = this;
					//console.log("bhsReadRatesSummary vm.dashboard = %O", vm.dashboard);


					var fontFactor = .003;
					var fontMax = 8;

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("readRatesSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);

						//+Only react if this dashboard change signal is the one we are on.
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							vm.overallGoodReadRate = null;
							vm.overallFailedReadRate = null;
							vm.scannerReadRates = null;
							GetData();
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetData() {
						dataService.GetIOPSWebAPIResource("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSAutomaticTokenReaderPercentReadRateReportGroupedByDateRange initial data = %O", data);
								vm.scannerReadRates = data.skip(1);
								vm.overallGoodReadRate = (data[0].PercentGoodReads || 0) + '% - ' + (data[0].GoodReads || 0) + ' Reads';
								vm.overallFailedReadRate = (data[0].PercentFailedReads || 0) + '% - ' + (data[0].BadReads || 0) + ' Reads';
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

								if (vm.widgetDimensions) {

									vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
									if (vm.largeTextSize > fontMax) {
										vm.largeTextSize = fontMax;
									}
									vm.data = data;
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								}
							});
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
					}

					GetData();

					vm.updateInterval = $interval(function() {
						GetData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.data.forEach(function (item) {
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
									vm.largeTextSize = vm.widgetDimensions.width * fontFactor;
									if (vm.largeTextSize > fontMax) {
										vm.largeTextSize = fontMax;
									}
								});

							}, 50, 20);
						}
					});

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsReadRatesSummary.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsSystemBagsProcessed',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsSystemBagsProcessed controller invoked. dashboard = %O", vm.dashboard);




					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							
							$interval(function() {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								
							},50,20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

							GetChartData(true); //
						}
					});


					function GetQueryParametersObject() {

						var obj = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};
						//console.log("Query Parameters Object = %O", obj);

						return obj;

					}







					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);


					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					//console.log("vm.diffDays = " + vm.diffDays);
					//console.log("Derived start date translated to utc = %O", utilityService.GetUTCDateFromLocalDate(vm.dashboard.derivedStartDate));

					function GetChartData(refresh) {


						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
							.query(GetQueryParametersObject(), function (data) {
								//console.log("BHSTotalSystemThroughputController initial data = %O", data);
								//Compile a list of the distinct sections found and key them by section.

								vm.data = data;
								//console.log("vm.data = %O", vm.data);

								if (refresh) {
									UpdateChartWithNewData(data);

								} else {
									RenderChart();

								}
							});

					}


					GetChartData();



					function RenderChart() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {

						var chartOptions = {
							chart: {
								type: 'column'
							},
							colors: ['#e5e04c', '#849d8c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								},
								categories: vm.data.select(function (d) { return d.Location }).distinct()
							},
							yAxis: {
								allowDecimals: false,
								min: 0,
								title: {
									text: ''
								},

								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold',
										"font-size": ".8em",
										color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								}


							},
							plotOptions: {
								column: {
									stacking: 'normal',
									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, 1)',
										//borderWidth: 1,
										//borderColor: '#FFF',
										style: {
											fontSize: '.75em',
											fontWeight: 'normal'
										},
										formatter: function () {
											if (this.y != 0) {
												return this.y;
											} else {
												return null;
											}
										}
									}
								},
								legend: {
									enabled: true
								},
								tooltip: {
									enabled: false,
									headerFormat: '<b>{point.x}</b><br/>',
									pointFormat: '{series.name}:<br/>Bags: {point.stackTotal}'
								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var chartThis = this;

												hs.htmlExpand(null, {
													pageOrigin: {
														x: e.pageX || e.clientX,
														y: e.pageY || e.clientY
													},
													headingText: 'Data Details',
													maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																		"<thead>" +
																			"<th>System</th>" +
																			"<th>Array</th>" +
																			"<th>Count</th>" +
																		"</thead>" +
																		"<tbody>" +
																		vm.data.select(function (d) {
																			return "<tr>" +
																				"<td>" +
																					d.BHSName +
																				"</td>" +
																				"<td>" +
																				d.Location +
																				"</td>" +
																				"<td>" +
																				d.BagCount +
																				"</td>" +
																				"</tr>";

																		}).join("") +
																		"</tbody>" +
														"</table>",
													width: 800
												});


											}
										}
									},
									marker: {
										lineWidth: 1
									}
								}

							},
							series: vm.data
										.select(function (d) { return d.BHSName })
										.distinct()
											.select(function (bhs) {
												return {
													name: bhs,
													data: vm.data.where(function (d1) { return d1.BHSName == bhs }).select(function (d1) { return d1.BagCount })
												};
											})

						}

						//console.log("chartOptions = %O", chartOptions);
						try {
							
							vm.chart = Highcharts.chart('bhsSystemBagsProcessed' + vm.widget.Id, chartOptions);
						} catch (e) {

						} 

					}




					vm.updateInterval = $interval(function () {
						RefreshData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});



					function RefreshData() {

						//console.log("Refreshing Data");

						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
												.query(GetQueryParametersObject(),
													function (data) {
														if (vm.data && vm.data.length == data.length) {
															vm.data = data;
															UpdateChartWithNewData(data);
														} else {
															vm.data = data;
															RenderChart();
														}
													});

					}


					function UpdateChartWithNewData(data) {
						//console.log("vm.chart = %O", vm.chart);
						vm.data = data;
						vm.locationCategoryIndex = 0;
						vm.bhsCounter = 0;
						vm.data
							.select(function (d) { return d.Location })
							.distinct()
							.forEach(function (location) {
								vm.data.select(function (d) { return d.BHSName }).distinct().forEach(function (bhs) {
									var matchingDataRow = vm.data.first(function (d1) { return d1.Location == location && d1.BHSName == bhs });
									var countForDataRow = matchingDataRow ? matchingDataRow.BagCount : 0;

									//console.log("location = " + location + "   BHSName = " + bhs);
									if (vm.chart && vm.chart.series) {
										var seriesData = vm.chart.series[vm.bhsCounter++].data[vm.locationCategoryIndex];									
										seriesData.update(countForDataRow, false);
									}



								});
								vm.bhsCounter = 0;
								vm.locationCategoryIndex++;
							});



						vm.chart.redraw();
						vm.bhsCounter = 0;
						vm.locationCategoryIndex = 0;
					}






				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsSystemBagsProcessed.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveAlarmAreas',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveAlarmAreas controller invoked");




					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							}, 50, 20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsTopFiveAlarmAreas Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						var queryParameters = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};

						//console.log("vm.dashboard = %O", vm.dashboard);


						//console.log("queryParamters = %O", queryParameters);

						dataService.GetIOPSWebAPIResource("BHSAlarmAreaCount")
							.query(queryParameters, function (data) {
								data = data.orderByDescending(function (d) { return d.AlarmCount }).take(5).orderBy(function (d) { return d.Area });

								//console.log("BHSTop5AlarmTypes initial data = %O", data);
								var dataIndex = 0;

								if (updateOnly) {
									data
										.forEach(function (d) {

											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value


											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.BHSName + ' - ' + d.Area }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();
									//console.log("vm.chart = %O", vm.chart);

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
										}, 100);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});




					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveAlarmAreas" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Areas',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.BHSName + ' - ' + item.Area }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								//tickInterval: 3600,
								//labels: {
								//	formatter: function () {
								//		var hours = this.value / 3600;

								//		return hours == 0 ? '' : hours + ' Hr';
								//	}
								//}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b><br/>Click for details'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
										//formatter: function () {
										//	//this.percentage	Stacked series and pies only. The point's percentage of the total.
										//	//this.point	The point object. The point name, if defined, is available through this.point.name.
										//	//this.series:	The series object. The series name is available through this.series.name.
										//	//this.total	Stacked series only. The total value at this point's x value.
										//	//this.x:	The x value.
										//	//this.y:	The y value.
										//	return utilityService.SecondsToString(this.y);
										//}
									}
								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var filterBHSName = filterCategory.split(' - ')[0];
												var filterAreaName = filterCategory.split(' - ')[1];
												var chartThis = this;

												var queryParamters = {

												};


												dataService.GetIOPSWebAPIResource("BHSAlarmAreaCountDetails")
													.query({
														beginDate: vm.dashboard.webApiParameterStartDate,
														endDate: vm.dashboard.webApiParameterEndDate,
														bhsName: filterBHSName,
														area: filterAreaName,
														siteId: 81463
													}, function (data) {
														data = data.orderBy(function (d) { return d.ActiveDateTime });

														//console.log("data from OData Source = %O", angular.copy(data));
														var highSlideWindow = hs.htmlExpand(null, {
															pageOrigin: {
																x: e.pageX || e.clientX,
																y: e.pageY || e.clientY
															},
															headingText: chartThis.y + ' Total Alarms for ' + chartThis.category,
															maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																				"<thead>" +
																					"<th>Active Date</th>" +
																					"<th>Alarm</th>" +
																					"<th>Device</th>" +
																					"<th>Duration</th>" +
																				"</thead>" +
																				"<tbody>" +
																				data.select(function (d) {
																					return "<tr>" +
																						"<td>" +
																						utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ActiveDateTime) +
																						"</td>" +
																						"<td>" +
																						d.Alarm +
																						"</td>" +
																						"<td>" +
																						d.DeviceNameList +
																						"</td>" +
																						"<td>" +
																						utilityService.SecondsToString(d.duration) +
																						"</td>" +
																						"</tr>";

																				}).join("") +
																				"</tbody>" +
																"</table>",
															width: 800,
															height: window.outerHeight * .6
														});

													});



											}
										}
									},
									marker: {
										lineWidth: 1
									}

								}


							},
							series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveAlarmAreas' + vm.widget.Id, chartOptions);
						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveAlarmAreas.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveAlarmDurations',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveAlarmDurations controller invoked");



					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							}, 50, 20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("bhsSystemBagsProcessed Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource("BHSTop5AlarmTypeLongestDuration")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("bhsTopFiveAlarmDurations initial data = %O", data);

								if (updateOnly) {
									data
										.forEach(function (d) {
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.AlarmType + ' (' + d.DeviceNameList + ')' }).update(d.MaxDurationSec, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
										}, 100);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					vm.updateInterval = $interval(function() {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});

					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveAlarmDurations" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Durations',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.AlarmType + ' (' + item.DeviceNameList + ')' }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								tickInterval: 3600,
								labels: {
									formatter: function () {
										var hours = this.value / 3600;

										return hours == 0 ? '' : hours + ' Hr';
									}
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Longest Duration: <b>{point.y:.0f} seconds</b>'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {

									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										//shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, .5)',
										borderWidth: 1,
										borderColor: '#aaa',
										style: {
											fontSize: '.85em',
											fontWeight: 'normal'
										},
										formatter: function () {
											//this.percentage	Stacked series and pies only. The point's percentage of the total.
											//this.point	The point object. The point name, if defined, is available through this.point.name.
											//this.series:	The series object. The series name is available through this.series.name.
											//this.total	Stacked series only. The total value at this point's x value.
											//this.x:	The x value.
											//this.y:	The y value.
											return utilityService.SecondsToString(this.y);
										}
									}

								}
							},
							series: [{ data: data.select(function (item) { return item.MaxDurationSec }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveAlarmDurations' + vm.widget.Id, chartOptions);
						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveAlarmDurations.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveAlarmTypes',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveAlarmTypes controller invoked");


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							}, 50, 20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveAlarmTypes Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource("BHSTop5AlarmTypes")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTop5AlarmTypes initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.AlarmType }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
										}, 100);
									});
								}
								vm.data = data;

							});

					}



					dataService.GetIOPSWebAPIResource("Top5ObservationExceptions")
						.query({
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 2
						}, function (data) {
							console.log("Top5ObservationExceptions initial data = %O", data);



						});



					GetChartData();

					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveAlarmTypes" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Alarm Types',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.AlarmType }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								//tickInterval: 3600,
								//labels: {
								//	formatter: function () {
								//		var hours = this.value / 3600;

								//		return hours == 0 ? '' : hours + ' Hr';
								//	}
								//}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b><br/>Click for details'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
										//formatter: function () {
										//	//this.percentage	Stacked series and pies only. The point's percentage of the total.
										//	//this.point	The point object. The point name, if defined, is available through this.point.name.
										//	//this.series:	The series object. The series name is available through this.series.name.
										//	//this.total	Stacked series only. The total value at this point's x value.
										//	//this.x:	The x value.
										//	//this.y:	The y value.
										//	return utilityService.SecondsToString(this.y);
										//}
									}

								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var chartThis = this;

												dataService.GetIOPSResource("BHSAlarmHistories")
																			.orderBy("Id", "desc")

																			.filter("ActiveDateTime", "!=", null)
																			.filter("ActiveDateTime", ">", vm.dashboard.webApiParameterStartDate)
																			.filter("ActiveDateTime", "<", vm.dashboard.webApiParameterEndDate)
																			.filter("Alarm", filterCategory)
																			.query().$promise.then(function (data) {


																				//console.log("data from OData Source = %O", angular.copy(data));
																				hs.htmlExpand(null, {
																					pageOrigin: {
																						x: e.pageX || e.clientX,
																						y: e.pageY || e.clientY
																					},
																					headingText: chartThis.y + ' ' + chartThis.category + 's',
																					maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																										"<thead>" +
																											"<th>Active Date</th>" +
																											"<th>Location</th>" +
																											"<th>Acknowledge Time</th>" +
																										"</thead>" +
																										"<tbody>" +
																										data.select(function (d) {
																											return "<tr>" +
																												"<td>" +
																												utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ActiveDateTime) +
																												"</td>" +
																												"<td>" +
																												d.Location +
																												"</td>" +
																												"<td>" +
																												utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.AcknowledgeTime || "") +
																												"</td>" +
																												"</tr>";

																										}).join("") +
																										"</tbody>" +
																						"</table>",
																					width: 800,
																					height: window.outerHeight * .6
																				});


																			});


											}
										}
									},
									marker: {
										lineWidth: 1
									}
								}

							},
							series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveAlarmTypes' + vm.widget.Id, chartOptions);
						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveAlarmTypes.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveJamDevicesWithCount',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveJamDevicesWithCount controller invoked");


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {							
							$interval(function() {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								
							},50,20);
						}
					});



					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveJamDevicesWithCount Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource("BHSTop5JamDevicesWithCount")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTopFiveJamDevicesWithCount initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.DeviceName }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											$timeout(function() {
													displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
													displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

												},
												50);
										}, 50);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveJamDevicesWithCount" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Jam Alarm Devices - With Count',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.DeviceName }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								//tickInterval: 3600,
								//labels: {
								//	formatter: function () {
								//		var hours = this.value / 3600;

								//		return hours == 0 ? '' : hours + ' Hr';
								//	}
								//}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b>'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										enabled: true,
										//formatter: function () {
										//	//this.percentage	Stacked series and pies only. The point's percentage of the total.
										//	//this.point	The point object. The point name, if defined, is available through this.point.name.
										//	//this.series:	The series object. The series name is available through this.series.name.
										//	//this.total	Stacked series only. The total value at this point's x value.
										//	//this.x:	The x value.
										//	//this.y:	The y value.
										//	return utilityService.SecondsToString(this.y);
										//}
									}

								}

							},
							series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
						};

						//console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveJamDevicesWithCount' + vm.widget.Id, chartOptions);
						} catch (e) {

						} 
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveJamDevicesWithCount.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('bhsTopFiveJamDevicesWithLongestDuration',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("bhsTopFiveJamDevicesWithLongestDuration controller invoked");


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						//console.log("Widget resize event");
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							}, 50, 20);
						}
					});


					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveJamDevicesWithLongestDuration Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					function GetChartData(updateOnly) {
						dataService.GetIOPSWebAPIResource("BHSTop5JamDevicesWithLongestDuration")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								siteId: 81463
							}, function (data) {
								//console.log("BHSTopFiveJamDevicesWithCount initial data = %O", data);

								if (updateOnly) {
									//console.log("vm.chart = %O",vm.chart);
									data
										.forEach(function (d) {
											//Find the data point that matches the area and bhs name and update THAT ONE to the right data value
											vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.DeviceName }).update(d.AlarmCount, false);
										});
									vm.chart.redraw();

								} else {

									$(function () {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
										//Render the chart
										$timeout(function () {
											CreateChart(data);
											$timeout(function () {
												displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
												displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

											},
												50);
										}, 50);
									});
								}
								vm.data = data;

							});

					}

					GetChartData();

					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					function CreateChart(data) {

						var chartOptions = {
							chart: {
								type: 'bar',
								renderTo: "bhsTopFiveJamDevicesWithCount" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'Top 5 Jam Alarm Devices - With Longest Durations',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								categories: data.select(function (item) { return item.DeviceName }),
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										wordWrap: 'break word',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: '',
									style: {
										fontSize: '10px'
									}
								},
								stackLabels: {
									enabled: true,
									style: {
										fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
									}
								},
								tickInterval: 3600,
								labels: {
									formatter: function () {
										var hours = this.value / 3600;

										return hours == 0 ? '' : hours + ' Hr';
									}
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Longest Alarm Duration: <b>{point.y:.0f} Seconds</b><br/>Click for details'
							},
							plotOptions: {
								stacking: 'normal',
								bar: {
									dataLabels: {
										//color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
										color: 'black',
										align: 'center',
										//shadow: true,
										enabled: true,
										borderRadius: 5,
										backgroundColor: 'rgba(255,255,255, .5)',
										borderWidth: 1,
										borderColor: '#aaa',
										style: {
											fontSize: '.85em',
											fontWeight: 'normal'
										},
										formatter: function () {
											//this.percentage	Stacked series and pies only. The point's percentage of the total.
											//this.point	The point object. The point name, if defined, is available through this.point.name.
											//this.series:	The series object. The series name is available through this.series.name.
											//this.total	Stacked series only. The total value at this point's x value.
											//this.x:	The x value.
											//this.y:	The y value.
											return utilityService.SecondsToString(this.y);
										}
									}

								},
								series: {
									cursor: 'pointer',
									point: {
										events: {
											click: function (e) {
												console.log("this = %O", this);
												console.log("window = %O", window);
												var filterCategory = this.category;
												var chartThis = this;

												hs.htmlExpand(null, {
													pageOrigin: {
														x: e.pageX || e.clientX,
														y: e.pageY || e.clientY
													},
													headingText: chartThis.y + ' ' + chartThis.category + 's',
													maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
																		"<tr>" +
																			"<td>" +
																				"Alarm Count" +
																			"</td>" +
																			"<td>" +
																				vm.data.first(function (item) { return item.DeviceName == chartThis.category }).AlarmCount +
																			"</td>" +
																		"</tr>" +
																	"</table>",
													width: 150,
													height: 250
												});


											}
										}
									},
									marker: {
										lineWidth: 1
									}
								}

							},
							series: [{ data: data.select(function (item) { return item.MaxDurationSec }) }]
						};

						console.log("chartOptions = %O", chartOptions);
						try {
							vm.chart = Highcharts.chart('bhsTopFiveJamDevicesWithLongestDuration' + vm.widget.Id, chartOptions);
						} catch (e) {

						}
					}
				};

				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/bhsTopFiveJamDevicesWithLongestDuration.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

    var app = angular.module('app');

    app.directive('bhsTopFiveJamTypeCount',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

			    var controller = function ($scope) {
			        var vm = this;


			        //console.log("bhsTopFiveAlarmAreas controller invoked");




			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });

			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            //console.log("bhsTopFiveAlarmAreas Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSWebAPIResource("BHSFilterByAlarmTypesbyArea")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    alarmTypeList: 'Jam',
							    topNumber: 5,
							    siteId: 81463
							}, function (data) {
							    console.log("bhsTopFiveJamTypeCount initial data = %O", data);

							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data
										.forEach(function (d) {
										    //Find the data point that matches the area and bhs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) { return dataPoint.category == d.Area }).update(d.AlarmCount, false);
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                $timeout(function () {
							                    displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

							                },
												50);
							            }, 50);
							        });
							    }
							    vm.data = data;

							});

			        }

			        GetChartData();

			        //Refresh data on the 15 second system clock tick
			        $scope.$on("System.ClockTick15", function () {
			            GetChartData();
			        });




			        function CreateChart(data) {

			            var chartOptions = {
			                chart: {
			                    type: 'bar',
			                    renderTo: "bhsTopFiveJamTypeCount" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: 'Top 5 Jam Area',
			                    style: {
			                        fontSize: '.8em'
			                    }
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                xAxis: {
			                    type: 'category',
			                    categories: data.select(function (item) { return item.Area }),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        style: {
			                            fontWeight: 'bold'
			                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
			                        }
			                    },
			                    //tickInterval: 3600,
			                    //labels: {
			                    //	formatter: function () {
			                    //		var hours = this.value / 3600;

			                    //		return hours == 0 ? '' : hours + ' Hr';
			                    //	}
			                    //}
			                },
			                legend: {
			                    enabled: false
			                },
			                tooltip: {
			                    pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b>'
			                },
			                plotOptions: {
			                    stacking: 'normal',
			                    bar: {
			                        dataLabels: {
			                            enabled: true,
			                            //formatter: function () {
			                            //	//this.percentage	Stacked series and pies only. The point's percentage of the total.
			                            //	//this.point	The point object. The point name, if defined, is available through this.point.name.
			                            //	//this.series:	The series object. The series name is available through this.series.name.
			                            //	//this.total	Stacked series only. The total value at this point's x value.
			                            //	//this.x:	The x value.
			                            //	//this.y:	The y value.
			                            //	return utilityService.SecondsToString(this.y);
			                            //}
			                        }
			                    },
			                    //series: {
			                    //    cursor: 'pointer',
			                    //    point: {
			                    //        events: {
			                    //            click: function (e) {
			                    //                console.log("this = %O", this);
			                    //                console.log("window = %O", window);
			                    //                var filterCategory = this.category;
			                    //                var filterBHSName = filterCategory.split(' - ')[0];
			                    //                var filterAreaName = filterCategory.split(' - ')[1];
			                    //                var alarmType = 'Jam';
			                    //                var chartThis = this;

			                    //                dataService.GetIOPSResource("BHSAlarmHistories")
                                //                     .filter("SiteId", 81463)
                                //                     .filter("ActiveDateTime", ">=", vm.dashboard.webApiParameterStartDate)
                                //                     .filter("ActiveDateTime", "<=", vm.dashboard.webApiParameterEndDate)
                                //                     .filter("BHSName", filterBHSName)
                                                     
                                //                     .filter("Alarm", alarmType)
                                                 
			                    //                 .query().$promise.then(function (data) {
			                                        
			                    //                     console.log("data from OData Source = %O", angular.copy(data));

			                    //                     hs.htmlExpand(null, {
			                    //                         pageOrigin: {
			                    //                             x: e.pageX || e.clientX,
			                    //                             y: e.pageY || e.clientY
			                    //                         },
								//					        headingText: chartThis.y + ' Total Alarms for ' + chartThis.category,
								//					        maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
								//												"<thead>" +
								//													"<th>Active Date</th>" +
								//													"<th>Alarm</th>" +
								//													"<th>Device</th>" +
								//													"<th>Location</th>" +
								//												"</thead>" +
								//												"<tbody>" +
								//												data.select(function (d) {
								//												    return "<tr>" +
								//														"<td>" +
								//														utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ActiveDateTime) +
								//														"</td>" +
								//														"<td>" +
								//														d.Alarm +
								//														"</td>" +
								//														"<td>" +
								//														d.DeviceNameList +
								//														"</td>" +
								//														"<td>" +
								//														d.Location +
								//														"</td>" +
								//														"</tr>";

								//												}).join("") +
								//												"</tbody>" +
								//								"</table>",
								//					        width: 800,
								//					        height: window.outerHeight * .6
								//					    });

								//					});



			                    //            }
			                    //        }
			                    //    },
			                    //    marker: {
			                    //        lineWidth: 1
			                    //    }

			                    //}


			                },
			                series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
			            };

			            //console.log("chartOptions = %O", chartOptions);

			            vm.chart = Highcharts.chart('bhsTopFiveJamTypeCount' + vm.widget.Id, chartOptions);
                    }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/bhsTopFiveJamTypeCount.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());
(function () {
	;

	var app = angular.module('app');

	app.directive('dashboard',
		[
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

			function ($rootScope, $state, displaySetupService, dataService, signalR, $interval, $stateParams, $timeout, $q, uibButtonConfig, utilityService) {

				var controller = function ($scope) {

					var vm = this;

					console.log("Dashboard directive invoked. $scope = %O", $scope);
					console.log("vm = %O", vm);
					console.log("$scope = %O", $scope);

					function ReportStep(stepNumber) {

						//console.log("Step = " + stepNumber);

					}

					if (!vm.widget) {
						//console.log("No Widget Present");
						displaySetupService.SetPanelDimensions();
					} else {
						//console.log("Widget Present");
						displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
					}

					ReportStep(1);


					vm.openSettingsDash = function ($event, widget) {
						$state.go('.widgetSettings', { widget: widget });
					}

					ReportStep(2);

					vm.AddTagsToSpecificWidgetGraph = function (widget) {
						$rootScope.$broadcast("Widget.AddTagsToGraph", widget);
					}


					vm.AddTagsToGraph = function (tagObjectCollectionFromWidget) {
						vm.dashboard.tagsToGraph = tagObjectCollectionFromWidget.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
						if (vm.dashboard.tagsToGraph.length > 0) {
							$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
						} else {
							$rootScope.$broadcast("Dashboard.TagsToGraph", null);
						}
					}

					ReportStep(3);

					vm.AddGraphWidgetToDashboard = function () {




						//Find the hidden system type called tagGraph and add one to this dashboard.
						dataService.GetIOPSCollection("WidgetTypes", "AngularDirectiveName", "tagGraph").then(function (data) {
							var tagGraphWidgetType = data[0];

							dataService.AddEntity("Widgets", {
								Name: 'Tag History',
								WidgetTypeId: tagGraphWidgetType.Id,
								ParentDashboardId: vm.dashboard.Id,
								EmbeddedDashboardId: null,
								Width: tagGraphWidgetType.InitialWidth,
								Height: tagGraphWidgetType.InitialHeight,
								Row: 0,
								Col: 0
							}).then(function (newWidget) {

								//Save all of the tag ids to the WidgetGraphTag table
								$q.all(vm.dashboard.tagsToGraph.select(function (t) {
									return dataService.AddEntity("WidgetGraphTags", { WidgetId: newWidget.Id, TagId: t.TagId });

								})).then(function () {

									//This will cause all graph selecting widgets to clear their local collection of tags to graph, causing all of the buttons depressed to reset.
									$rootScope.$broadcast("GraphWidgetAdded", newWidget);

									//Clear out the selection of tag to graph
									vm.dashboard.tagsToGraph = [];
								});
							});
						});




					}



					ReportStep(4);


					uibButtonConfig.activeClass = 'radio-active';

					//If this is an embedded dashboard, then a lot of things change.
					if (vm.widget) {
						if (vm.widget.WidgetResource.EmbeddedDashboard) {
							vm.dashboardId = vm.widget.WidgetResource.EmbeddedDashboard.Id;
							vm.dashboard = vm.widget.WidgetResource.EmbeddedDashboard;
							GetDashboardData();
							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
						} else {
							if (vm.widget.WidgetResource.EmbeddedDashboardId) {
								dataService.GetEntityById("Dashboards", vm.widget.WidgetResource.EmbeddedDashboardId).then(function (db) {
									vm.dashboardId = db.Id;
									vm.dashboard = db;
									GetDashboardData();
									displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
								});

							}
						}

						vm.supressWidgetHeaders = true;

					} else {
						if (vm.dashboardId) {
							vm.dashboardId = +vm.dashboardId;

						} else {
							if (vm.dashboard) {
								vm.dashboardId = vm.dashboard.Id;
							}
						}
						vm.supressWidgetHeaders = false;
						GetDashboardData();
					}


					ReportStep(5);




					function GetAllAssetIdsForDashboard() {

						//console.log("vm = %O", vm);
						
							var multiAssetIds = vm.widgets.where(function(w) { return w.assetIds }).selectMany(function(w) {
								return w.assetIds.split(',');
							});


							//console.log("Dashboard multi asset id list = %O", multiAssetIds);


							var assetIdList = vm.widgets.select(function (widget) { return widget.WidgetResource.AssetId })
								.where(function (assetId) { return assetId })
								.concat(multiAssetIds)
								.distinct().join(',');

						//console.log("Dashboard asset id list = %O", assetIdList);

						vm.assetIdList = assetIdList;
					}



					function GetDashboardData() {
						dataService.GetExpandedDashboardById(vm.dashboardId)
						.then(function (data) {
							vm.dashboard = data;
							vm.dashboard.tagsToGraph = [];

							SetSubTitleBasedOnDashboardTimeScope();
							//console.log("vm.dashboard = %O", vm.dashboard);
						})
						.then(function () {
							dataService.GetIOPSResource("Widgets")
								.filter("ParentDashboardId", vm.dashboardId)
								.filter("ParentWidgetId", null)
								.expand("WidgetType")
								.expand("EmbeddedDashboard")
								.query()
								.$promise
								.then(function (widgets) {

									ReportStep(6);







									//dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetIdList).then(
									//	function () {

									var dashboardWidgets = widgets.select(function (w) {
										return {
											sizeX: w.Width,
											sizeY: w.Height,
											row: w.Row,
											col: w.Col,
											prevRow: w.Row,
											prevCol: w.Col,
											Id: w.Id,
											Name: w.Name,
											WidgetResource: w,
											HasChanged: false
										}
									});





									//+Collect all of the asset Ids in any widget in the dashboard and collect all of the Tags for thos assets all at once.
									var assetIdList = dashboardWidgets.where(function(w) { return w.WidgetResource.AssetId }).select(function (w) { return w.WidgetResource.AssetId + "" }).join(',');


									console.log("Dashboard assetId list = " + assetIdList);



									dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetIdList, false).then(function() {
										vm.widgets = dashboardWidgets;



										vm.dashboard.widgets = vm.widgets;
										//console.log("Dashboard widgets = %O", vm.widgets);
										
									});

									//console.log("Dashboard widgets = %O", vm.widgets);

									ReportStep(7);


									if (!vm.widget) {
										//console.log("No widget this invokation");
										displaySetupService.SetPanelDimensions();
									} else {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
									}
									//console.log("Dashboard Widgets = %O", vm.widgets);
									//});








								});
						});

					}

					vm.CamelCaseToSnakeCase = function (cc) {

						return cc.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });





					}


					vm.openSettings = function (widget) {
						console.log("Opening Settings. widget = %O", widget);
						return hs.htmlExpand(this, { contentId: 'highslide-html' + widget.Id, headingText: widget.Name + ' Settings' });
					}




					vm.fullscreen = false;
					vm.screenSwitchClass = "static-panel";

					vm.ToggleFullScreen = function () {
						vm.fullscreen = !vm.fullscreen;
						if (vm.fullscreen) {
							vm.screenSwitchClass = "fullscreen-panel";

						} else {
							vm.screenSwitchClass = "static-panel";
						}
						$scope.$$postDigest(function () {
							$interval(function () {
								$rootScope.$broadcast("WidgetResize", 0);
								displaySetupService.SetPanelDimensions();
							}, 25, 10);
						});

					}


					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboardId) {
							vm.dashboard = dashboard;
							SetSubTitleBasedOnDashboardTimeScope();
						}

					});

					vm.SetTimeScope = function (days) {
						vm.timeScopeDays = days;
						dataService.GetDashboardTimeScopes().then(function (timeScopes) {
							var timeScope = timeScopes.first(function (ts) { return ts.Days == days });
							if (timeScope) {
								vm.dashboard.DashboardTimeScope = timeScope;
								vm.dashboard.TimescopeId = timeScope.Id;
								vm.dashboard.CustomStartDate = null;
								vm.dashboard.CustomEndDate = null;

								//Get a pure copy of the dashboard, set the TimeScopeId, save it, and signal the change via signalr
								dataService.GetEntityById("Dashboards", vm.dashboard.Id).then(function (db) {
									db.TimeScopeId = timeScope.Id;
									db.CustomStartDate = null;
									db.CustomEndDate = null;
									db.$save().then(function () {
										dataService.SetDashboardDerivedDatesFromDayCount(vm.dashboard);
										signalR.SignalAllClients("Dashboard", vm.dashboard);
									});
								});
							}
						});
					}



					//Set the begin time for the dashboard window forward each second.
					//Dashboard widgets depend on these values to refresh the values within the window.
					vm.timeScopeUpdateInterval = $interval(function () {
						dataService.SetDashboardDerivedDatesFromDayCount(vm.dashboard);
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.timeScopeUpdateInterval);

					});

					function SetSubTitleBasedOnDashboardTimeScope() {
						//Figure out the date ranges and list it on the subtitle for the dashboard header.
						if (vm.dashboard.DashboardTimeScope) {
							vm.subTitle = vm.dashboard.DashboardTimeScope.Description;
						} else {
							vm.subTitle = vm.dashboard.CustomStartDate + " to " + vm.dashboard.CustomEndDate;
						}
					}








					$scope.$on("WidgetAdded", function (event, widget) {
						console.log("Widget Event - widget passed = %O", widget);
						if (widget.ParentDashboardId == vm.dashboardId) {
							AddWidgetStructureToTheList(widget);
						}

					});




					$scope.$on("GraphWidgetAdded",
						function (event, widget) {
							console.log("Widget Event");
							if (widget.ParentDashboardId == vm.dashboardId) {
								AddWidgetStructureToTheList(widget);
							}
						});



					function AddWidgetStructureToTheList(widget) {

						dataService.GetJBTData().then(function (jbtData) {

							widget.WidgetType = jbtData.WidgetTypes.first(function (wt) { return wt.Id == widget.WidgetTypeId });
							var newWidgetStructure = {
								sizeX: widget.Width,
								sizeY: widget.Height,
								row: widget.Row,
								col: widget.Col,
								prevRow: widget.Row,
								prevCol: widget,
								Id: widget.Id,
								Name: widget.Name,
								WidgetResource: widget,
								HasChanged: false

							};


							vm.widgets.push(newWidgetStructure);


						});

					}


					$scope.$on("Widget.Deleted", function (event, deletedWidget) {

						console.log("Deleted widget = %O", deletedWidget);
						console.log("vm.dashboard = %O", vm.dashboard);

						if (deletedWidget.ParentDashboardId == vm.dashboard.Id) {
							vm.widgets = vm.widgets.where(function (w) { return w.Id != deletedWidget.Id });
							vm.dashboard.widgets = vm.widgets;

							//Set a timer half a second into the future that will save the possible new positions of all of the widgets left on the screen
							$timeout(function () {
								SaveAllChangedWidgets();
							},
								500);

						}

					});


					//The user might be in a specific dashboard, and then delete it via the menu. If we are in the one that was deleted then go back to home.
					$scope.$on("Dashboard.Deleted", function (event, deletedDashboard) {

						if (deletedDashboard.Id == vm.dashboardId) {
							//We are in a deleted dashboard! Get out
							$state.go("^");
						}
					});



					function DeleteWidgetFromDatabase(widget) {
						dataService.GetIOPSResource("Widgets").filter("Id", widget.Id).query().$promise.then(function (widgetToDeleteArray) {
							var widgetToDelete = widgetToDeleteArray[0];





							//Delete any WidgetGraphTag rows that might be associated with this widget
							$q.all(

								[
									//Delete any associated graphtags
									dataService.GetIOPSCollection("WidgetGraphTags", "WidgetId", widget.Id).then(function (graphTags) {
										return $q.all(
											graphTags.select(function (graphTag) {
												graphTag.Id = -graphTag.Id;
												return graphTag.$save();
											})
										);
									})
									//,

									//Delete any child widgets tied to this one. (Pop-up type widgets)
									//dataService.GetIOPSCollection("Widgets", "ParentWidgetId", widget.Id).then(function (childWidgets) {
									//	console.log("Child Widgets to delete = %O", childWidgets);
									//	return $q.all(
									//		childWidgets.select(function (childWidget) {
									//			childWidget.Id = -childWidget.Id;
									//			return childWidget.$save();
									//		})
									//	);
									//})

								]




							).then(function () {
								//console.log("Widget to delete = %O", widgetToDelete);
								widgetToDelete.Id = -widgetToDelete.Id;
								widgetToDelete.$save().then(function () {
									console.log("Widget Deleted");
									widgetToDelete.Id = -widgetToDelete.Id;
									signalR.SignalAllClients("Widget.Deleted", widgetToDelete);
								});
							});
						});
					}


					vm.deleteWidget = function (widget, confirm) {


						if (confirm) {
							alertify.set({
								labels: {
									ok: 'Yes, Delete the "' + widget.Name + '" Widget',
									cancel: "Cancel, I don't want to do this"
								},
								buttonFocus: "cancel"
							});

							var message = 'Are you SURE you want to delete the "' + widget.Name + '" widget from this dashboard? ';

							alertify.confirm(message,
								function (e) {
									if (e) {
										// user clicked "ok"
										DeleteWidgetFromDatabase(widget);
									} else {
										// user clicked "no"
										toastr.info(widget.Name, "Widget was NOT deleted!");
									}
								});

						} else {
							DeleteWidgetFromDatabase(widget);
						}


					}




					vm.gridsterOpts = {
						columns: 60, // the width of the grid, in columns
						pushing: true, // whether to push other items out of the way on move or resize
						floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
						swapping: true, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
						width: 3800, // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
						colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
						rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
						margins: (vm.widget && vm.widget.WidgetResource.EmbeddedDashboard) ? [0, 0] : [5, 5], // the pixel distance between each widget
						outerMargin: true, // whether margins apply to outer edges of the grid
						sparse: true, // "true" can increase performance of dragging and resizing for big grid (e.g. 20x50)
						isMobile: false, // stacks the grid items if true
						mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
						mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
						minColumns: 1, // the minimum columns the grid must have
						minRows: 2, // the minimum height of the grid, in rows
						maxRows: 5000,
						defaultSizeX: 2, // the default width of a gridster item, if not specifed
						defaultSizeY: 1, // the default height of a gridster item, if not specified
						minSizeX: 1, // minimum column width of an item
						maxSizeX: null, // maximum column width of an item
						minSizeY: 1, // minumum row height of an item
						maxSizeY: null, // maximum row height of an item
						resizable: {
							enabled: true,
							handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
							start: function (event, $element, widget) { }, // optional callback fired when resize is started,
							resize: function (event, $element, widget) {
								//console.log("widget resize = %O", widget);
								//console.log("resize:  widget x = %O", widget.sizeX);
								//console.log("resize:  $element= %O", $element);
								widget.HasChanged = true;
								displaySetupService.SetPanelBodyWithIdHeight(widget.Id);
								$rootScope.$broadcast("WidgetResize", widget.Id);


							},
							// optional callback fired when item is finished resizing
							stop: function (event, $element, widget) {
								$rootScope.$broadcast("WidgetResize.Stop", widget.Id);
								SaveWidget(widget);
							}
						},
						draggable: {
							enabled: true, // whether dragging items is supported
							handle: '.panel-heading', // optional selector for drag handle
							start: function (event, $element, widget) { }, // optional callback fired when drag is started,
							drag: function (event, $element, widget) { widget.HasChanged = true }, // optional callback fired when item is moved,
							stop: function (event, $element, widget) { SaveWidget(widget) } // optional callback fired when item is finished dragging
						}
					};


					vm.logWidget = function (widget) {
						console.log("Widget Clicked = %O", widget);
					}





					function SaveWidget(widget) {

						//If for some reason the widget resource is not a real one, then go get a real one.
						//console.log("Widget to be saved = %O", widget);
						(widget.WidgetResource.$save && !widget.WidgetResource.EmbeddedDashboard
							? $q.when(widget.WidgetResource)
							: dataService.GetIOPSResource("Widgets").filter("Id", widget.Id).expand("WidgetType").query().$promise.then(function (data) {
								widget.WidgetResource = data[0];
								return widget.WidgetResource;
							})).then(function (data) {
								widget.WidgetResource = data;
								widget.WidgetResource.Row = widget.row;
								widget.WidgetResource.Col = widget.col;
								widget.prevCol = widget.col;
								widget.prevRow = widget.row;
								widget.WidgetResource.Width = widget.sizeX;
								widget.WidgetResource.Height = widget.sizeY;




								widget.WidgetResource.$save().then(function (widget1) {
									signalR.SignalAllClients("Widget", widget1);
								});

								//console.log("Changed Other widgets = %O",vm.widgets.where(function (w) { return (w.col != w.prevCol || w.row != w.prevRow) && w.Id != widget.Id }));


								//Save all the other widgets that have changed positions because of the other one moving. This is not captured by the gridster control
								vm.widgets.where(function (w) { return (w.col != w.prevCol || w.row != w.prevRow) && w.Id != widget.Id }).forEach(function (widget1) {
									widget1.WidgetResource.Row = widget1.row;
									widget1.WidgetResource.Col = widget1.col;
									widget1.prevCol = widget1.col;
									widget1.prevRow = widget1.row;

									widget1.WidgetResource.Width = widget1.sizeX;
									widget1.WidgetResource.Height = widget1.sizeY;

									widget1.WidgetResource.$save().then(function (widget2) {
										signalR.SignalAllClients("Widget", widget2);
									});
								});
							});
					}


					vm.saveChangeInterval = $interval(function () {
						SaveAllChangedWidgets();
					},1000);

					vm.saveChangeInterval = $interval(function () {
						GetAllAssetIdsForDashboard();
						dataService.RefreshAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(vm.assetIdList);
					},60000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.saveChangeInterval);

					});

					vm.LogWidget = function (widget) {
						console.log("Clicked Widget data = %O", widget);
					}

					function SaveAllChangedWidgets() {
						if (vm.widgets) {

							vm.widgets.where(function (w) { return w.col != w.prevCol || w.row != w.prevRow }).forEach(function (widget1) {
								widget1.WidgetResource.Row = widget1.row;
								widget1.WidgetResource.Col = widget1.col;
								widget1.prevCol = widget1.col;
								widget1.prevRow = widget1.row;

								widget1.WidgetResource.Width = widget1.sizeX;
								widget1.WidgetResource.Height = widget1.sizeY;

								widget1.WidgetResource.$save().then(function (widget2) {
									signalR.SignalAllClients("Widget.Updated", widget2);
								});
							});
						}

					}

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/dashboard.html?" + Date.now(),
					replace: true,
					scope: {

						dashboardId: "=",
						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
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

(function () {

	var app = angular.module('app');

	app.directive('gpuSummary',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;
					//console.log("gpuSummary controller = %O", vm);
					function GetHeadingExtraTitle() {

						return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-PLCLocalDate',
						alarmDataSortField: '-PLCLocalDate',
						warningsDataSortField: '-PLCLocalDate',
						headingExtraTitle: '',
						obscureGraphics: true,
						commLossTag: false,
						headingSearchField: true
				}

					vm.scrolledToEnd = function () {
						//console.log("gpu Data Scrolled to end");
					}

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							//console.log("Saving widget resource........");
							//console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							//console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.tagsToGraph = [];

					vm.alarmFilterFunction = function(element) {
						return element.ValueWhenActive == element.Value;
					};


					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("Initial vm.widget = %O", vm.widget);


					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}






					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						//console.log("Opening settings vm.Asset = %O", vm.Asset);


						if (!vm.gpu) {
							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}



					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						console.log("vm in vm.ProcessTagsToGraph = %O", vm);

						vm.dashboard.tagsToGraph = vm.tagsToGraphObjects.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
						if (vm.dashboard.tagsToGraph.length > 0) {
							$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
						} else {
							$rootScope.$broadcast("Dashboard.TagsToGraph", null);
						}

						return;
					}


					vm.tagFilterFunction = function (element) {
						if ((vm.widget.searchText || '') != '') {
							return element.JBTStandardObservation.Name.toLowerCase().indexOf((vm.widget.searchText || '').toLowerCase()) > -1;
						} else {
							return true;
						}
					};

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});


					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						vm.gpu = vm.Asset;
						//console.log("gpuSummary Asset = %O", vm.Asset);
						GetGPUAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.gpu = null;

								SaveWidgetResourceObjectIfChanged();
								GetGPUAssetForGate();
							}
						}
					});

					vm.SetDefaultNavPill = function (defaultValue) {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = defaultValue;
							SaveWidgetResourceObjectIfChanged();
						}, 100);
					}


					vm.GenerateAmpsCharts = function () {
						//console.log("Generating...");
						GeneratePhaseAAmpsOutLinearMeter();
						GeneratePhaseBAmpsOutLinearMeter();
						GeneratePhaseCAmpsOutLinearMeter();
						GenerateAmpsInAverageLinearMeter();
						GenerateAmpsOutAverageLinearMeter();
					}

					vm.GenerateVoltsCharts = function () {
						//console.log("Generating...");
						GeneratePhaseAVoltsOutLinearMeter();
						GeneratePhaseBVoltsOutLinearMeter();
						GeneratePhaseCVoltsOutLinearMeter();
						GenerateVoltsInAverageLinearMeter();
						GenerateVoltsOutAverageLinearMeter();
					}

					function GetGPUAssetForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;

							vm.gpu = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'GPU' });


							vm.Asset = vm.gpu;

							if (vm.widget.WidgetResource.GateSystemId) {

								vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

							}

							//console.log("vm.gpu = %O", vm.gpu);

							vm.widget.WidgetResource.AssetId = vm.gpu.Id;

							SaveWidgetResourceObjectIfChanged();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.gpu.Id).then(function () {


								vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.gpu.Id });


								vm.AssetGraphics.forEach(function (ag) {
									ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
									ag.showImage = false;
								});
								$timeout(function () {
									SetupSplitter();
									SetTabBodyHeight(5);
								}, 50);

								//console.log("Asset Graphics = %O", vm.AssetGraphics);
								vm.gpu.Tags.forEach(function (tag) {
									UpdateGraphicsVisibilityForSingleTag(tag);
								});

								vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
								vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
								SetHeadingBackground();
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								vm.GenerateVoltsCharts();
								vm.GenerateAmpsCharts();

								var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

								vm.alarms = vm.gpu.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsAlarm && !commLossStandardObservationIds.any(function(a){ return a == dsTag.JBTStandardObservationId })});
								vm.warnings = vm.gpu.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsWarning});
								vm.commLossTag = vm.gpu.Tags.first(function(t){return commLossStandardObservationIds.any(function(clso){ return clso == t.JBTStandardObservationId})});

								vm.widget.displaySettings.commLossTag = vm.commLossTag;
								//console.log("CommLossTag = %O", vm.commLossTag);

								//dataService.GetIOPSResource("ObservationExceptions")
								//	.filter("AssetId", vm.widget.WidgetResource.AssetId)
								//	.filter("TerminatingObservationId", null)
								//	.expand("Tag")
								//	.query()
								//	.$promise.then(function(exceptionData) {

								//		vm.alarms = exceptionData.where(function (d) { return d.Tag.IsAlarm });
								//		//console.log("vm.alarms = %O", vm.alarms);
								//		vm.warnings = exceptionData.where(function(d) { return d.Tag.IsWarning });
								//		//console.log("vm.warnings = %O", vm.warnings);

								//	});

								vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';


								$timeout(function () {
									vm.showWidget = true;
								}, 200);


							});
						});
					}



					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {
								
								if (vm.widget.WidgetResource.IsModalPopUp) {
									heightToSet = widgetDimensions.height - tabDimensions.height - 20;
								} else {
									heightToSet = widgetDimensions.height - tabDimensions.height-3;	
								}
							
								//console.log("Height to set = " + heightToSet);
								$("#tab-content" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-alarms" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-warnings" + vm.widget.Id).css('height', heightToSet);
								vm.showTags = true;
							}

						}, 50, repeatCount);
					}



					vm.tagClicked = function(tag) {
						console.log("tag clicked = %O", tag);
					}

					


					function SetHeadingBackground() {
						if (vm.alarms && vm.alarms.length > 0 && vm.alarms.any(function (a) { return a.ValueWhenActive == a.Value })) {

							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFDDDD)';


							return;
						}



						//+Commented out the yellow header on warnings present - Can put back in if needed.
						//if(vm.warnings && vm.warnings.length > 0) {

						//	vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FFFF00, #FFFFee)';


						//	return;
						//}
						
						if (AtLeastOneGraphicIsVisible() && (!vm.commLossTag || vm.commLossTag.Value != "1")) {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';
						} else {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';
						}
					}

					function AtLeastOneGraphicIsVisible() {
						if (vm.AssetGraphics) {
							return vm.AssetGraphics.any(function (ag) { return ag.showImage }) || vm.gpu.Tags.where(function (t) { return t.JBTStandardObservationId == 12246 }).any(function (t) { return +t.Value == 1 });
						}




						return false;
					}


					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerGraphics' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage, vm.widget.WidgetResource.SplitRightPercentage],
											minSize: 0,
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

												SaveWidgetResourceObjectIfChanged();
											}

										});
									vm.splitterIsSetup = true;

								});


							});

						}


					}





					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});

					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {


						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						console.log("Widget.AddTagsToGraph event at GPU Summary");

						//Clear the add tag checkbox buttons
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph = [];
					});




					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						UpdatePhaseAAmpsOutLinearMeter(updatedTag);
						UpdatePhaseBAmpsOutLinearMeter(updatedTag);
						UpdatePhaseCAmpsOutLinearMeter(updatedTag);
						UpdateAmpsInAverageLinearMeter(updatedTag);
						UpdateAmpsOutAverageLinearMeter(updatedTag);

						UpdatePhaseAVoltsOutLinearMeter(updatedTag);
						UpdatePhaseBVoltsOutLinearMeter(updatedTag);
						UpdatePhaseCVoltsOutLinearMeter(updatedTag);
						UpdateVoltsInAverageLinearMeter(updatedTag);
						UpdateVoltsOutAverageLinearMeter(updatedTag);
						SetHeadingBackground();
					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.gpu) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.gpu.Id) {
								//console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								if (vm.AssetGraphics) {


									vm.AssetGraphics.forEach(function (ag) {

										//Set the "showImage" flag on each appropriately.
										ag.AssetGraphicVisibleValues.forEach(function (vv) {
											if (vv.JBTStandardObservationId == updatedTag.JBTStandardObservationId) {
												vv.showImage = +updatedTag.Value == +vv.ValueWhenVisible || updatedTag.Value == vv.ValueWhenVisible;
											}
										});


										//Set the upper AssetGraphic flag if ALL of the lower flags are set.
										ag.showImage = ag.AssetGraphicVisibleValues.length > 0 && ag.AssetGraphicVisibleValues.all(function (av) {
											return av.showImage;
										});



									});



								}
							}

						}
						//console.log("vm.widget = %O", vm.widget);

						vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
						

					}




					//***G




					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("gpuSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						}
					});

					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});



					vm.meterRanges = {
						ampsIn: {
							min: 0,
							max: 400,
							lowStart: 0,
							lowEnd: 10,
							highStart: 300,
							HighEnd: 400
						},
						ampsOut: {
							min: 0,
							max: 400,
							lowStart: 0,
							lowEnd: 10,
							highStart: 300,
							HighEnd: 400
						},
						voltsIn: {
							min: 0,
							max: 600,
							lowStart: 0,
							lowEnd: 10,
							highStart: 500,
							HighEnd: 600
						},
						voltsOut: {
							min: 0,
							max: 150,
							lowStart: 0,
							lowEnd: 50,
							highStart: 130,
							HighEnd: 150
						}
					}


					//+Generate the Amps In Average Linear Meter
					function GenerateAmpsInAverageLinearMeter() {

						vm.ampsInAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [2242].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ampsInAverageDataTag) {
							vm.ampsInAverage = +vm.ampsInAverageDataTag.Value;
						}
					}

					function UpdateAmpsInAverageLinearMeter(updatedTag) {

						if (vm.ampsInAverageDataTag && updatedTag.TagId == vm.ampsInAverageDataTag.TagId) {
							vm.ampsInAverage = +vm.ampsInAverageDataTag.Value;
						}
					}


					//+Generate the Amps Out Average Linear Meter
					function GenerateAmpsOutAverageLinearMeter() {

						vm.ampsOutAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [1942].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ampsOutAverageDataTag) {
							vm.ampsOutAverage = +vm.ampsOutAverageDataTag.Value;
						}
					}

					function UpdateAmpsOutAverageLinearMeter(updatedTag) {

						if (vm.ampsOutAverageDataTag && updatedTag.TagId == vm.ampsOutAverageDataTag.TagId) {
							vm.ampsOutAverage = +vm.ampsOutAverageDataTag.Value;
						}
					}


					//+Generate the Phase A Amps Out Linear Meter
					function GeneratePhaseAAmpsOutLinearMeter() {

						vm.phaseAAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1857, 4439].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						//console.log("vm.phaseAAmpsOutDataTag = %O", vm.phaseAAmpsOutDataTag);
						if (vm.phaseAAmpsOutDataTag) {
							vm.phaseAAmpsOut = +vm.phaseAAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseAAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseAAmpsOutDataTag && updatedTag.TagId == vm.phaseAAmpsOutDataTag.TagId) {
							vm.phaseAAmpsOut = +vm.phaseAAmpsOutDataTag.Value;
						}
					}


					//+Generate the Phase B Amps Out Linear Meter
					function GeneratePhaseBAmpsOutLinearMeter() {

						vm.phaseBAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1858, 4441, 2754].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseBAmpsOutDataTag) {
							vm.phaseBAmpsOut = +vm.phaseBAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseBAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseBAmpsOutDataTag && updatedTag.TagId == vm.phaseBAmpsOutDataTag.TagId) {
							vm.phaseBAmpsOut = +vm.phaseBAmpsOutDataTag.Value;
						}
					}



					//+Generate the Phase C Amps Out Linear Meter
					function GeneratePhaseCAmpsOutLinearMeter() {

						vm.phaseCAmpsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [1859, 4443].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseCAmpsOutDataTag) {
							vm.phaseCAmpsOut = +vm.phaseCAmpsOutDataTag.Value;
						}
					}

					function UpdatePhaseCAmpsOutLinearMeter(updatedTag) {

						if (vm.phaseCAmpsOutDataTag && updatedTag.TagId == vm.phaseCAmpsOutDataTag.TagId) {
							vm.phaseCAmpsOut = +vm.phaseCAmpsOutDataTag.Value;
						}
					}

					//+Generate the Volts In Average Linear Meter
					function GenerateVoltsInAverageLinearMeter() {

						vm.voltsInAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [2244].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.voltsInAverageDataTag) {
							vm.voltsInAverage = +vm.voltsInAverageDataTag.Value;
						}
					}

					function UpdateVoltsInAverageLinearMeter(updatedTag) {

						if (vm.voltsInAverageDataTag && updatedTag.TagId == vm.voltsInAverageDataTag.TagId) {
							vm.voltsInAverage = +vm.voltsInAverageDataTag.Value;
						}
					}


					//+Generate the Volts Out Average Linear Meter
					function GenerateVoltsOutAverageLinearMeter() {

						vm.voltsOutAverageDataTag = vm.gpu.Tags.where(function (tag) {
							return [1935].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.voltsOutAverageDataTag) {
							vm.voltsOutAverage = +vm.voltsOutAverageDataTag.Value;
						}
					}

					function UpdateVoltsOutAverageLinearMeter(updatedTag) {

						if (vm.voltsOutAverageDataTag && updatedTag.TagId == vm.voltsOutAverageDataTag.TagId) {
							vm.voltsOutAverage = +vm.voltsOutAverageDataTag.Value;
						}
					}


					//+Generate the Phase A Volts Out Linear Meter
					function GeneratePhaseAVoltsOutLinearMeter() {

						vm.phaseAVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4440, 1860].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						//console.log("vm.phaseAVoltsOutDataTag = %O", vm.phaseAVoltsOutDataTag);
						if (vm.phaseAVoltsOutDataTag) {
							vm.phaseAVoltsOut = +vm.phaseAVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseAVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseAVoltsOutDataTag && updatedTag.TagId == vm.phaseAVoltsOutDataTag.TagId) {
							vm.phaseAVoltsOut = +vm.phaseAVoltsOutDataTag.Value;
						}
					}


					//+Generate the Phase B Volts Out Linear Meter
					function GeneratePhaseBVoltsOutLinearMeter() {

						vm.phaseBVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4442, 1861].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseBVoltsOutDataTag) {
							vm.phaseBVoltsOut = +vm.phaseBVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseBVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseBVoltsOutDataTag && updatedTag.TagId == vm.phaseBVoltsOutDataTag.TagId) {
							vm.phaseBVoltsOut = +vm.phaseBVoltsOutDataTag.Value;
						}
					}



					//+Generate the Phase C Volts Out Linear Meter
					function GeneratePhaseCVoltsOutLinearMeter() {

						vm.phaseCVoltsOutDataTag = vm.gpu.Tags.where(function (tag) {
							return [4444, 1862].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.phaseCVoltsOutDataTag) {
							vm.phaseCVoltsOut = +vm.phaseCVoltsOutDataTag.Value;
						}
					}

					function UpdatePhaseCVoltsOutLinearMeter(updatedTag) {

						if (vm.phaseCVoltsOutDataTag && updatedTag.TagId == vm.phaseCVoltsOutDataTag.TagId) {
							vm.phaseCVoltsOut = +vm.phaseCVoltsOutDataTag.Value;
						}
					}




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/gpuSummary.html",

					scope: {

						dashboard: "=",
						widget: "=",
						addTagsToGraphFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	"use strict";


	function GPUSummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {

		var vm = this;


		vm.AddTagsToGraphModal = function (tagObjectCollectionFromWidget) {
			vm.dashboard.tagsToGraph = tagObjectCollectionFromWidget.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
			console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
			if (vm.dashboard.tagsToGraph.length > 0) {
				$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
			} else {
				$rootScope.$broadcast("Dashboard.TagsToGraph", null);
			}
		}


		vm.state = $state;


		vm.widget = $stateParams.widget;
		vm.assetId = $stateParams.assetId;
		vm.dashboard = $stateParams.dashboard;



		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function(data) {
			vm.JBTData = data;
			vm.gpu = data.Assets.first(function (a) { return a.Id == vm.assetId });
			vm.panelTitle = vm.widget.Name;
			vm.panelSubtitle = 'esc to close';

			vm.showScreen = true;


		});


		vm.AddToDashboard = function() {

			dataService.GetEntityById("WidgetTypes", vm.widget.WidgetResource.WidgetTypeId).then(function(wt) {


				return dataService.AddEntity("Widgets",
					{
						Name: 'GPU Summary',
						WidgetTypeId: vm.widget.WidgetResource.WidgetTypeId,
						ParentDashboardId: vm.dashboard.Id,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 100,
						Col: 0,
						AssetId: vm.widget.WidgetResource.AssetId,
						DefaultNavPill: "Amps",
						GateSystemId: vm.widget.WidgetResource.GateSystemId,
						SiteId: vm.widget.WidgetResource.SiteId,
						SplitLeftPercentage: 50,
						SplitRightPercentage: 50,
						SystemId: vm.widget.WidgetResource.SystemId,
						TerminalSystemId: vm.widget.WidgetResource.TerminalSystemId,
						ZoneSystemId: vm.widget.WidgetResource.ZoneSystemId
					}).then(function(widget) {
						signalR.SignalAllClients("WidgetAdded", widget);
				});


			});

		}


		hotkeys.bindTo($scope)
		.add({
			combo: 'esc',
			description: 'Cancel and close any input form',
			allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
			callback: function () {
				$state.go("^");
			}
		});

		console.log("GPUSummaryModalCtrl invoked = %O", vm);

	}

	angular
			.module("app")
			.controller("GPUSummaryModalCtrl", [
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
				GPUSummaryModalCtrl
			]);



})();
(function () {

    var app = angular.module('app');

    app.directive('gsEquipmentHoursOfUsage',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsEquipmentHoursOfUsage controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }

			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("gsEquipmentHoursOfUsage Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSWebAPIResource("gSEquipmentUsage_TVF_Query")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    siteId: vm.widget.WidgetResource.SiteId
							}, function (data) {
							    console.log("webApiParameterStartDate", vm.dashboard.webApiParameterStartDate);
							    console.log("webApiParameterEndDate", vm.dashboard.webApiParameterEndDate);
							    console.log("EquipmentUsage initial data = %O", data);
							    
							    vm.chartData = data;
							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data.forEach(function (d) {
										    //Find the data point that matches the area and gs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) {

										        return dataPoint.category == d.Gate
										    })
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							            }, 100);
							        });
							    }
							    vm.data = data;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }



					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


			        function CreateChart(data) {


			            var chartOptions = {
			                chart: {
			                    type: 'column',
			                    renderTo: "gsEquipmentHoursOfUsage" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: 'Equipment Hours Of Usage Summary',
			                    style: {
			                        fontSize: '.8em'
			                    }
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                xAxis: {
			                    type: 'category',
			                    categories: data.select(function (item) { return item.Gate}),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        formatter: function () {
			                            return Highcharts.numberFormat(this.total, 1);
			                        },
			                        style: {
			                            fontWeight: 'bold'
			                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
			                        }
			                    },
			                    //tickInterval: 3600,
			                    //labels: {
			                    //	formatter: function () {
			                    //		var hours = this.value / 3600;

			                    //		return hours == 0 ? '' : hours + ' Hr';
			                    //	}
			                    //}
			                },
			                legend: {
			                    align: 'center',
			                    verticalAlign: 'bottom',
			                    x: 0,
			                    y: 0
			                },
			                tooltip: {
			                    headerFormat: '<b>{point.x}</b><br/>',
			                    pointFormat: '{series.name}: {point.y:.1f}<br/>Click for details'
			                },
			                plotOptions: {
			                    column: {
			                        stacking: 'normal',
			                        dataLabels: {
			                            enabled: true,
			                            formatter: function () {
			                                return Highcharts.numberFormat(this.y, 1);
			                            }
			                        }

			                    },
			                    series: {
			                        cursor: 'pointer',
			                        point: {
			                            events: {
			                                click: function (e) {
			                                    console.log("this = %O", this);
			                                    console.log("window = %O", window);
			                                    var filterCategory = this.category;
			                                    var chartThis = this;
			                                    dataService.GetIOPSWebAPIResource("gSEquipmentUsage_TVF_Query")
                                                               .query({
                                                                   beginDate: vm.dashboard.webApiParameterStartDate,
                                                                   endDate: vm.dashboard.webApiParameterEndDate,
                                                                   siteId: vm.widget.WidgetResource.SiteId
                                                               }, function (data) {
                                                                    console.log("data from OData Source = %O", angular.copy(data));
                                    
                                                                   
                                    hs.htmlExpand(null, {
                                        pageOrigin: {
                                            x: e.pageX || e.clientX,
                                            y: e.pageY || e.clientY
                                        },

                                         headingText: 'All Gates Summary',
                                         maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
                                                            "<thead>" +
                                                                "<th>Gate</th>" +
                                                                "<th>PBB Hours</th>" +
                                                                "<th>PCA Hours</th>" +
                                                                "<th>GPU Hours</th>" +
                                                                "<th>PBB Times Used</th>" +
                                                                "<th>PCA Times Used</th>" +
                                                                "<th>GPU Times Used</th>" +
                                                               
                                                             "</thead>" +
                                                             "<tbody>" +
                                                                 data.select(function (d) {
                                                                     return "<tr>" +
                                                                    "<td>"
                                                                    + d.Gate +
                                                                    "<td>"
                                                                    + (d.PBB_Hours).toFixed(1) +
                                                                    "<td>"
                                                                    + (d.PCA_Hours).toFixed(1) +
                                                                    "<td>"
                                                                    + (d.GPU_Hours).toFixed(1) +
                                                                    "<td>"
                                                                    + d.PBB_Times_Used +
                                                                     "<td>"
                                                                    + d.PCA_Times_Used +
                                                                     "<td>"
                                                                    + d.GPU_Times_Used +
                                                                    "</tr>";
                                                                 }).join("") +
                                                            "</tbody>" +
                                                         "</table>",


                                        width: 400,
                                        height: window.outerHeight * .6


                                    });


                                });


			                                }
			                            }
			                        },
			                        marker: {
			                            lineWidth: 1
			                        }
			                    }

			                },
			                series: [
                              { name: 'PBBHours', data: data.select(function (item) { return item.PBB_Hours })},
                              { name: 'PCAHours', data: data.select(function (item) { return item.PCA_Hours }) },
                              { name: 'GPUHours', data: data.select(function (item) { return item.GPU_Hours }) }
			                ]
			            };

			            console.log("chartOptions = %O", chartOptions);

			            vm.chart = Highcharts.chart('gsEquipmentHoursOfUsage' + vm.widget.Id, chartOptions);
			        }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/gsEquipmentHoursOfUsage.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());

(function () {

    var app = angular.module('app');

    app.directive('gsEquipmentUsage',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsEquipmentUsage controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }

			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("gsEquipmentUsage Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSWebAPIResource("gSEquipmentUsage_TVF_Query")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    siteId: vm.widget.WidgetResource.SiteId
							}, function (data) {
							    console.log("webApiParameterStartDate", vm.dashboard.webApiParameterStartDate);
							    console.log("webApiParameterEndDate", vm.dashboard.webApiParameterEndDate);
							    console.log("EquipmentUsage initial data = %O", data);
							    
							    vm.chartData = data;
							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data.forEach(function (d) {
										    //Find the data point that matches the area and gs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) {

										        return dataPoint.category == d.Gate
										    }).update(d.PBB_Hours, false);
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							            }, 100);
							        });
							    }
							    vm.data = data;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }

			        var x = 67;


					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


			        function CreateChart(data) {


			            var chartOptions = {
			                chart: {
			                    type: 'column',
			                    renderTo: "gsEquipmentUsage" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: 'Equipment Cycle Count Summary',
			                    style: {
			                        fontSize: '.8em'
			                    }
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                xAxis: {
			                    type: 'category',
			                    categories: data.select(function (item) { return item.Gate}),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        style: {
			                            fontWeight: 'bold'
			                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
			                        }
			                    },
			                    //tickInterval: 3600,
			                    //labels: {
			                    //	formatter: function () {
			                    //		var hours = this.value / 3600;

			                    //		return hours == 0 ? '' : hours + ' Hr';
			                    //	}
			                    //}
			                },
			                legend: {
			                    align: 'center',
			                    verticalAlign: 'bottom',
			                    x: 0,
			                    y: 0
			                },
			                tooltip: {
			                    headerFormat: '<b>{point.x}</b><br/>',
			                    pointFormat: '{series.name}: {point.y}<br/>Click for details'
			                },
			                plotOptions: {
			                    column: {
			                        stacking: 'normal',
			                        dataLabels: {
			                            enabled: true,
			                        }

			                    },
			                    series: {
			                        cursor: 'pointer',
			                        point: {
			                            events: {
			                                click: function (e) {
			                                    console.log("this = %O", this);
			                                    console.log("window = %O", window);
			                                    var filterCategory = this.category;
			                                    var chartThis = this;
			                                    dataService.GetIOPSWebAPIResource("gSEquipmentUsage_TVF_Query")
                                                               .query({
                                                                   beginDate: vm.dashboard.webApiParameterStartDate,
                                                                   endDate: vm.dashboard.webApiParameterEndDate,
                                                                   siteId: vm.widget.WidgetResource.SiteId
                                                               }, function (data) {
                                                                    console.log("data from OData Source = %O", angular.copy(data));
                                    

                                    hs.htmlExpand(null, {
                                        pageOrigin: {
                                            x: e.pageX || e.clientX,
                                            y: e.pageY || e.clientY
                                        },

                                         headingText: 'All Gates Summary',
                                         maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
                                                            "<thead>" +
                                                                "<th>Gate</th>" +
                                                                "<th>PBB Hours</th>" +
                                                                "<th>PCA Hours</th>" +
                                                                "<th>GPU Hours</th>" +
                                                                "<th>PBB Times Used</th>" +
                                                                "<th>PCA Times Used</th>" +
                                                                "<th>GPU Times Used</th>" +
                                                               
                                                             "</thead>" +
                                                             "<tbody>" +
                                                                 data.select(function (d) {
                                                                     return "<tr>" +
                                                                    "<td>"
                                                                    + d.Gate +
                                                                    "<td>"
                                                                    + (d.PBB_Hours).toFixed(2) +
                                                                    "<td>"
                                                                    + (d.PCA_Hours).toFixed(2) +
                                                                    "<td>"
                                                                    + (d.GPU_Hours).toFixed(2) +
                                                                    "<td>"
                                                                    + d.PBB_Times_Used +
                                                                     "<td>"
                                                                    + d.PCA_Times_Used +
                                                                     "<td>"
                                                                    + d.GPU_Times_Used +
                                                                    "</tr>";
                                                                 }).join("") +
                                                            "</tbody>" +
                                                         "</table>",


                                        width: 400,
                                        height: window.outerHeight * .6


                                    });


                                });


			                                }
			                            }
			                        },
			                        marker: {
			                            lineWidth: 1
			                        }
			                    }

			                },
			                series: [
                              { name: 'PBBCycleCount', data: data.select(function (item) { return item.PBB_Times_Used })},
                              { name: 'PCACycleCount' ,data: data.select(function (item) { return item.PCA_Times_Used })},
                              { name: 'GPUCycleCount' ,data: data.select(function (item) { return item.GPU_Times_Used })}
			                ]
			            };

			            console.log("chartOptions = %O", chartOptions);

			            vm.chart = Highcharts.chart('gsEquipmentUsage' + vm.widget.Id, chartOptions);
			        }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/gsEquipmentUsage.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());

(function () {

    var app = angular.module('app');

    app.directive('gsEquipmentUtilizationSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsEquipmentUtilizationSummary controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }

			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
			                SetChartSizeLine(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
			                    SetChartSizeLine(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("gsEquipmentUtilizationSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            var startDate = vm.dashboard.webApiParameterStartDate;
			            var endDate = vm.dashboard.webApiParameterEndDate;
			            var siteId = vm.widget.WidgetResource.SiteId;
			            
			            dataService.GetIOPSWebAPIResource("GSEquipmentUsage_TVF_Query")
							.query({
							    beginDate: startDate,
							    endDate: endDate,
							    siteId: siteId

							}, function (info) {
							    console.log("GSEquipmentUsage_TVF_Query initial data = %O", info);
							    vm.totalPBBHours = info.sum(function (item) { return item.PBB_Hours }).toFixed(2);
							    vm.totalPCAHours = info.sum(function (item) { return item.PCA_Hours }).toFixed(2);
							    vm.totalGPUHours = info.sum(function (item) { return item.GPU_Hours }).toFixed(2);
							    vm.totalPBBTimesUsed = info.sum(function (item) { return item.PBB_Times_Used });
							    vm.totalPCATimesUsed = info.sum(function (item) { return item.PCA_Times_Used });
							    vm.totalGPUTimesUsed = info.sum(function (item) { return item.GPU_Times_Used });
							    });

			            dataService.GetIOPSWebAPIResource("GSEquipmentUsageByGate_TVF_Query")
                               .query({
                                   beginDate: startDate,
                                   endDate: endDate,
                                   siteId: siteId,
                                   gate:'All'

                               }, function (data) {
                                   console.log("GSEquipmentUsageByGate_TVF_Query initial data = %O", data);
                                   vm.PBBGatesPresent = data.sum(function (item) { return item.PBB_Hours });
                                   vm.PCAGatesPresent = data.sum(function (item) { return item.PCA_Hours });
                                   vm.GPUGatesPresent = data.sum(function (item) { return item.GPU_Hours });
                                   vm.PBBGatesUsed = data.sum(function (item) { return item.PBB_Times_Used });
                                   vm.PCAGatesUsed = data.sum(function (item) { return item.PCA_Times_Used });
                                   vm.GPUGatesUsed = data.sum(function (item) { return item.GPU_Times_Used });

							    var usagePBB; var usagePCA; var usageGPU;
							    
							    var diff;
							    var today = new Date().toISOString().slice(0, 10);
							    var startDateString = startDate.toISOString().slice(0, 10);
							    
							    if (startDateString == today) {
							        diff = 1;
							    }
							    else
							        diff = Math.floor((Date.parse(today) - Date.parse(startDateString)) / 86400000);

							    console.log("days total", diff);
							    if (vm.totalPBBHours != 0)
							        usagePBB = parseFloat(((vm.totalPBBHours / (24 * diff * vm.PBBGatesPresent)) * 100).toFixed(2));
							    else usagePBB = 0.00;
							    if (vm.totalPCAHours != 0)
							        usagePCA = parseFloat(((vm.totalPCAHours / (24 * diff * vm.PCAGatesPresent)) * 100).toFixed(2));
							    else usagePCA = 0.00;
							    if (vm.totalGPUHours != 0)
							        usageGPU = parseFloat(((vm.totalGPUHours / (24 * diff * vm.GPUGatesPresent))*100).toFixed(2));
							    else usageGPU = 0.00;

							    vm.usagePBB = usagePBB; vm.usagePCA = usagePCA; vm.usageGPU = usageGPU;

							    vm.chartData = data;
							   

							    console.log("vm.usagePBB", vm.usagePBB);
							    console.log("vm.usagePCA", vm.usagePCA);
							    console.log("vm.usageGPU", vm.usageGPU);


							    $(function () {
							        displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							        //Render the chart
							        $timeout(function () {
							            CreateChart(data);
							            SetChartSizeLine(vm.widget.Id, vm.chart);
							        }, 100);
							    });
							    
							    vm.data = data;
							    vm.showWidget = true;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }



			        //Refresh data 
			            vm.updateInterval = $interval(function () {
			                GetChartData();
			            }, 120000);

			            $scope.$on("$destroy", function () {
			                $interval.cancel(vm.updateInterval);

			            });

			        function SetChartSizeLine(widgetId, chart) {
			            //Set the bar chart to be 40% high, 60% wide
			            var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
			            if (chart) {
			                chart.setSize((widgetBodyDimensions.width * .99), (widgetBodyDimensions.height * .65) - 10, false);
			            }
			        }
			        function renderIcons() {

			            
			            if (!this.series[0].icon) {
			                this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
                                .attr({
                                    'stroke': '#303030',
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': 2,
                                    'zIndex': 10
                                })
                                .add(this.series[2].group);
			            }
			            this.series[0].icon.translate(
                            this.chartWidth / 2 - 10,
                            this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
                                (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
                        );

			            
			            if (!this.series[1].icon) {
			                this.series[1].icon = this.renderer.path(
                                ['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8,
                                    'M', 8, -8, 'L', 16, 0, 8, 8]
                                )
                                .attr({
                                    'stroke': '#ffffff',
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': 2,
                                    'zIndex': 10
                                })
                                .add(this.series[2].group);
			            }
			            this.series[1].icon.translate(
                            this.chartWidth / 2 - 10,
                            this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
                                (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
                        );

			           
			            if (!this.series[2].icon) {
			                this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
                                .attr({
                                    'stroke': '#303030',
                                    'stroke-linecap': 'round',
                                    'stroke-linejoin': 'round',
                                    'stroke-width': 2,
                                    'zIndex': 10
                                })
                                .add(this.series[2].group);
			            }

			            this.series[2].icon.translate(
                            this.chartWidth / 2 - 10,
                            this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
                                (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
                        );
			        }
			        function CreateChart(data) {


			            var chartOptions = {
			                chart: {
			                    type: 'solidgauge',
			                    events: {
			                        render: renderIcons
			                    },
			                    renderTo: "gsEquipmentUtilizationSummary" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: '',
			                   
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                //xAxis: {
			                //    type: 'category',
			                //    categories: ['PBB', 'GPU', 'PCA'],
			                //    labels: {
			                //        style: {
			                //            fontSize: '10px',
			                //            wordWrap: 'break word',
			                //            fontFamily: 'Verdana, sans-serif'
			                //        }
			                //    },
			                //},
			                pane: {
			                    startAngle: 0,
			                    endAngle: 360,
			                    background: [{ 
			                        outerRadius: '112%',
			                        innerRadius: '88%',
			                        backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[4])
                                        .setOpacity(0.3)
                                        .get(),
			                        borderWidth: 0
			                    }, { 
			                        outerRadius: '87%',
			                        innerRadius: '63%',
			                        backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[7])
                                        .setOpacity(0.3)
                                        .get(),
			                        borderWidth: 0
			                    }, { 
			                        outerRadius: '62%',
			                        innerRadius: '38%',
			                        backgroundColor: Highcharts.Color(Highcharts.getOptions().colors[8])
                                        .setOpacity(0.3)
                                        .get(),
			                        borderWidth: 0
			                    }]
			                },
			                yAxis: {
			                    min: 0,
			                    max: 100,
			                    lineWidth: 0,
			                    tickPositions: []
			                },
			                
			                plotOptions: {
			                    solidgauge: {
			                        dataLabels: {
			                            enabled: false
			                        },
			                        linecap: 'round',
			                        stickyTracking: false,
			                        rounded: true
			                    },


			                },
			                tooltip: {
			                    borderWidth: 0,
			                    backgroundColor: 'none',
			                    shadow: false,
			                    style: {
			                        fontSize: '8px'
			                    },
			                    pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
			                    positioner: function (labelWidth) {
			                        return {
			                            x: (this.chart.chartWidth - labelWidth) / 2,
			                            y: (this.chart.plotHeight / 2) - 15
			                        };
			                    }
			                },
			             
			               
			                series: [{
			                    name: 'PBB',
			                    data: [{
			                        color: Highcharts.getOptions().colors[4],
			                        radius: '112%',
			                        innerRadius: '88%',
			                        y: vm.usagePBB
			                    }]
			                   }, {
			                    name: 'GPU',
			                    data: [{
			                        color: Highcharts.getOptions().colors[7],
			                        radius: '87%',
			                        innerRadius: '63%',
			                        y: vm.usageGPU
			                     }]
			                    }, {
			                    name: 'PCA',
			                    data: [{
			                        color: Highcharts.getOptions().colors[8],
			                        radius: '62%',
			                        innerRadius: '38%',
			                        y: vm.usagePCA
			                     }]
			                }]
			            };

			            console.log("chartOptions = %O", chartOptions);

			            vm.chart = Highcharts.chart('gsEquipmentUtilizationSummary' + vm.widget.Id, chartOptions);
			        }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/gsEquipmentUtilizationSummary.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());

(function () {

    var app = angular.module('app');

    app.directive('gsServiceCounters',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata", "$q",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata, $q) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsServiceCounters controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite && vm.GateSystem) {
			                return ' - ' + vm.widgetSite.Name + ' - ' + vm.GateSystem.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }



			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    //displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("gsTopFiveAlarmTypes Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetData();
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {

			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);
			            if (vm.widget.WidgetResource.GateSystemId) {

			                vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

			            }
			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.GateSystemId",
                     function (newValue, oldValue) {
                         if (vm.widget.WidgetResource.GateSystemId && vm.widget.WidgetResource.SiteId) {

                             //console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

                             if (newValue != oldValue) {
                                 vm.widget.WidgetResource.$save();
                                 dataService.GetEntityById("SystemGroups", newValue).then(function (gateSystem) {
                                     vm.GateSystem = gateSystem;
                                     GetData();
                                 });

                             }

                         }
                     });




			        function GetData() {

			            var stdObsIds = [3782, 13740, 4504, 3819, 12455, 12452, 12374, 3879, 3795, 3808, 4001, 4745, 4002, 4003, 12578, 4074, 4075, 3844, 3789, 3837, 3843, 3770, 3820, 14241, 14388];
			            var dataCollector = [];
			            dataService.GetIOPSResource("Tags")
                                                   .select(["Id", "JBTStandardObservationId", "JBTStandardObservationName"])
                                                   .filter("SiteId", vm.widget.WidgetResource.SiteId)
                                                   .filter("GateName", vm.GateSystem.Name)
			                                       .filter($odata.Predicate.or(stdObsIds.select(function (id)
			                                       { return new $odata.Predicate("JBTStandardObservationId", id) })))
                            .query().$promise.then(function (tags) {
                                $q.all(
                                    tags.select(function (tag) {
                                        return dataService.GetIOPSResource("Observations")
                                                    .filter("TagId", tag.Id)
                                                   .filter("Date", ">=", vm.dashboard.webApiParameterStartDate)
                                                   .filter("Date", "<=", vm.dashboard.webApiParameterEndDate)
                                                   .filter("BooleanValue", true)
                                                   .count()
                                                   .$promise.then(function (data) {
                                                       dataCollector.push({ Tag: tag, Count: data.result });
                                                   });
                                    })
                                            ).then(function () {
                                                console.log("Here are the tags =%O", dataCollector);
                                            });
                            });




			            $(function () {
			                displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

			            });

			            vm.data = dataCollector;
			            vm.showWidget = true;
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			            console.log("In Vm.data  =%O ", vm.data);



			        }


			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/gsServiceCounters.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());


(function () {

    var app = angular.module('app');

    app.directive('gsTopFiveAlarmTypes',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR","$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR,$odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsTopFiveAlarmTypes controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId 

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }

			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            //console.log("gsTopFiveAlarmTypes Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });

			

			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' 

			            })
							.select(function (s) { return s.split('.')[1] });

			            //console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);
					    
			            if (vm.userSites.length == 1) {
			                //console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id ==vm.widget.WidgetResource.SiteId });
					        //console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSWebAPIResource("top5ObservationExceptions")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    siteId:  vm.widget.WidgetResource.SiteId
							}, function (data) {
							    console.log("webApiParameterStartDate", vm.dashboard.webApiParameterStartDate);
							    console.log("webApiParameterEndDate", vm.dashboard.webApiParameterEndDate);
							    console.log("GSTop5AlarmTypes initial data = %O", data);
							    vm.chartData = data;
							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data
										.forEach(function (d) {
										    //Find the data point that matches the area and gs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) { 

										        return dataPoint.category == d.AlarmType }).update(d.AlarmCount, false);
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                displaySetupService.SetLoneChartSize(vm.widget.Id,vm.chart);
							            }, 100);
							        });
							    }
							    vm.data = data;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }

					

					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


			        function CreateChart(data) {
					   

			            var chartOptions = {
			                chart: {
			                    type: 'bar',
			                    renderTo: "gsTopFiveAlarmTypes" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: 'Top 5 Alarm Types',
			                    style: {
			                        fontSize: '.8em'
			                    }
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                xAxis: {
			                    type: 'category',
			                    categories: data.select(function (item) { return item.AlarmType }),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        style: {
			                            fontWeight: 'bold'
										// color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
			                        }
			                    },
			                    //tickInterval: 3600,
			                    //labels: {
			                    //	formatter: function () {
			                    //		var hours = this.value / 3600;

			                    //		return hours == 0 ? '' : hours + ' Hr';
			                    //	}
			                    //}
			                },
			                legend: {
			                    enabled: false
			                },
			                tooltip: {
			                    pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b><br/>Click for details'
			            },
			                plotOptions: {
			                stacking: 'normal',
			                bar: {
			                        dataLabels: {
			                            enabled: true,
			                            //formatter: function () {
			                            //	//this.percentage	Stacked series and pies only. The point's percentage of the total.
			                            //	//this.point	The point object. The point name, if defined, is available through this.point.name.
                                        //	//this.series:	The series object. The series name is available through this.series.name.
                                        //	//this.total	Stacked series only. The total value at this point's x value.
			                            //	//this.x:	The x value.
			                            //	//this.y:	The y value.
			                            //	return utilityService.SecondsToString(this.y);
			                            //}
			                        }

			                },
			                    series: {
			                        cursor: 'pointer',
			                        point: {
			                            events: {
			                                    click: function (e) {
			                                        console.log("this = %O", this);
			                                        console.log("window = %O", window);
			                                        var filterCategory = this.category;
			                                        var chartThis = this;
			                                        console.log("vm = %O" , vm);
			                                        var JBTStandardObservationId = vm.chartData.first(function (d) { return d.AlarmType == filterCategory }).JBTStandardObservationIdList;
			                                            console.log("JBTStandardObservationId:" + JBTStandardObservationId);
			                                            console.log("siteId:" + vm.widget.WidgetResource.SiteId);
			                                        dataService.GetIOPSResource("Tags")
                                                        .filter("SiteId", vm.widget.WidgetResource.SiteId)
                                                        .filter("JBTStandardObservationId", JBTStandardObservationId)
                                                        .filter("IsAlarm",true)
                                                                            
			                                        .expandPredicate("ObservationExceptions")
			                                            .filter("ExceptionStartDate", ">=", vm.dashboard.webApiParameterStartDate)
			                                            .filter("ExceptionStartDate", "<=", vm.dashboard.webApiParameterEndDate)
                                                        .filter("DurationMS",">",0)
			                                        .finish()

                                    .query().$promise.then(function (data) {
								
                                        var flattenedData = data.selectMany(function (tag) { return tag.ObservationExceptions });
                                        console.log("flattenedData", flattenedData);
                                        console.log("data from OData Source = %O", angular.copy(data));
                                        
                                        hs.htmlExpand(null, {
											 pageOrigin: {
                                                x: e.pageX || e.clientX,
                                                y: e.pageY || e.clientY
										 },
											headingText: chartThis.y + ' ' + chartThis.category + 's',
                                            maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
                                                                "<thead>" +
                                                                    "<th>Alarm Date Time</th>" +
																    "<th>Cleared Date Time</th>" +
                                                                    "<th>Alarm Text</th>" +
                                                                    "<th>Gate</th>" +
                                                                    "<th>Equipment</th>" +
																 "</thead>" +
															     "<tbody>" +
																	 flattenedData.select(function (d) {
																	    var tagRow = data.first(function (c) { return c.Id == d.TagId });
																	    return "<tr>" +
																		"<td>"
                                                                        + utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ExceptionStartDate) +
																		"<td>"
                                                                        + utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ExceptionEndDate || "") +
                                                                        "<td>"
																	     // trying to match the first Id from Tag(data) and TagId from observationException(flattenedData) and 
																		// retrive JBTStandardObservationName out of it
                                                                        + tagRow.JBTStandardObservationName +
																	    "<td>"
                                                                        + tagRow.GateName +
                                                                         "<td>"
                                                                        + tagRow.AssetName +
																		"</tr>";
														              }).join("") +
																"</tbody>" +
															 "</table>",
																		

                                            width: 700,
											 height: window.outerHeight * .6
																		

                                        });


																		

                                    });


			                                                                }
			                                                        }
			                                                    },
			                                                    marker: {
			                                                        lineWidth: 1
			                                                    }
			                                                }

			                                            },
			                                        series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
			                                    };

			                                    console.log("chartOptions = %O", chartOptions);

			                                    vm.chart = Highcharts.chart('gsTopFiveAlarmTypes' + vm.widget.Id, chartOptions);
			                                }
			                            };

                                controller.$inject = ["$scope"];

                                return {
                                    restrict: 'E', //Default for 1.3+
                                    templateUrl: "app/widgetDirectives/gsTopFiveAlarmTypes.html?" + Date.now(),

                                    scope: {

                                        dashboard: "=",
                                        widget: "=",
                                        signalUpdateFunction: "&",
                                        setPanelHeadingColorFunction: "&",
                                        mode: "@"
                                    },

                                    controllerAs: 'vm',
                                    controller: controller,
                                    bindToController: true //required in 1.3+ with controllerAs
                                };
                            }
                 ]);

        }());

(function () {

    var app = angular.module('app');

    app.directive('gsTopFiveAlarmTypesByEquipment',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("gsTopFiveAlarmTypes controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }

			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }

			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("gsTopFiveAlarmTypes Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSWebAPIResource("top5EquipmentWithMostAlarms")
							.query({
							    beginDate: vm.dashboard.webApiParameterStartDate,
							    endDate: vm.dashboard.webApiParameterEndDate,
							    siteId: vm.widget.WidgetResource.SiteId
							}, function (data) {
							    console.log("webApiParameterStartDate", vm.dashboard.webApiParameterStartDate);
							    console.log("webApiParameterEndDate", vm.dashboard.webApiParameterEndDate);
							    console.log("GSTop5AlarmTypes initial data = %O", data);
							    vm.chartData = data;
							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data
										.forEach(function (d) {
										    //Find the data point that matches the area and gs name and update THAT ONE to the right data value
										    vm.chart.series[0].data.first(function (dataPoint) {

										        return dataPoint.category == d.AlarmType
										    }).update(d.AlarmCount, false);
										});
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							            }, 100);
							        });
							    }
							    vm.data = data;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }



					vm.updateInterval = $interval(function () {
						GetChartData();
					},120000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


			        function CreateChart(data) {


			            var chartOptions = {
			                chart: {
			                    type: 'bar',
			                    renderTo: "gsTopFiveAlarmTypesByEquipment" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: 'Top 5 Equipment With Most Alarms',
			                    style: {
			                        fontSize: '.8em'
			                    }
			                },
			                //subtitle: {
			                //	text: ''
			                //},
			                xAxis: {
			                    type: 'category',
			                    categories: data.select(function (item) { return item.display}),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        style: {
			                            fontWeight: 'bold'
			                            // color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
			                        }
			                    },
			                    //tickInterval: 3600,
			                    //labels: {
			                    //	formatter: function () {
			                    //		var hours = this.value / 3600;

			                    //		return hours == 0 ? '' : hours + ' Hr';
			                    //	}
			                    //}
			                },
			                legend: {
			                    enabled: false
			                },
			                tooltip: {
			                    pointFormat: 'Alarm Count: <b>{point.y:.0f} Alarms</b><br/>Click for details'
			                },
			                plotOptions: {
			                    stacking: 'normal',
			                    bar: {
			                        dataLabels: {
			                            enabled: true,
			                            //formatter: function () {
			                            //	//this.percentage	Stacked series and pies only. The point's percentage of the total.
			                            //	//this.point	The point object. The point name, if defined, is available through this.point.name.
			                            //	//this.series:	The series object. The series name is available through this.series.name.
			                            //	//this.total	Stacked series only. The total value at this point's x value.
			                            //	//this.x:	The x value.
			                            //	//this.y:	The y value.
			                            //	return utilityService.SecondsToString(this.y);
			                            //}
			                        }

			                    },
			                    series: {
			                        cursor: 'pointer',
			                        point: {
			                            events: {
			                                click: function (e) {
			                                    console.log("this = %O", this);
			                                    console.log("window = %O", window);
			                                    var filterCategory = this.category;
			                                    var chartThis = this;
			                                    console.log("vm = %O", vm);
			                                    var chartRow = vm.chartData.first(function (d) { return d.display == filterCategory });
			                                    console.log("GateName:" + chartRow.Gate);
			                                    console.log("AssetName:" + chartRow.AlarmType);
			                                    console.log("siteId:" + vm.widget.WidgetResource.SiteId);
			                                    dataService.GetIOPSResource("Tags")
                                                    .filter("SiteId", vm.widget.WidgetResource.SiteId)
                                                    .filter("GateName", chartRow.Gate)
                                                    .filter("AssetName", chartRow.AlarmType)
                                                    .filter("IsAlarm", true)

                                                .expandPredicate("ObservationExceptions")
                                                    .filter("ExceptionStartDate", ">=", vm.dashboard.webApiParameterStartDate)
                                                    .filter("ExceptionStartDate", "<=", vm.dashboard.webApiParameterEndDate)
                                                    .filter("DurationMS", ">", 0)
                                                .finish()

                                .query().$promise.then(function (data) {

                                    var flattenedData = data.selectMany(function (tag) { return tag.ObservationExceptions });
                                    console.log("flattenedData", flattenedData);
                                    console.log("data from OData Source = %O", angular.copy(data));

                                    hs.htmlExpand(null, {
                                        pageOrigin: {
                                            x: e.pageX || e.clientX,
                                            y: e.pageY || e.clientY
                                        },

                                        headingText: chartThis.y + ' ' + chartThis.category + ' ' +'Alarms',
                                        maincontentText: "<table class='table table-condensed table-striped' style='font-size: .75em;'>" +
                                                            "<thead>" +
                                                                "<th>Alarm Date Time</th>" +
                                                                "<th>Cleared Date Time</th>" +
                                                                "<th>Alarm Text</th>" +
                                                               
                                                             "</thead>" +
                                                             "<tbody>" +
                                                                 flattenedData.select(function (d) {
                                                                     return "<tr>" +
                                                                    "<td>"
                                                                    + utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ExceptionStartDate) +
                                                                    "<td>"
                                                                    + utilityService.GetFormattedLocalDisplayDateFromUTCDate(d.ExceptionEndDate || "") +
                                                                    "<td>"
                                                                     // trying to match the first Id from Tag(data) and TagId from observationException(flattenedData) and 
                                                                    // retrive JBTStandardObservationName out of it
                                                                    + data.first(function (c) { return c.Id == d.TagId }).JBTStandardObservationName +
                                                                    "</tr>";
                                                                 }).join("") +
                                                            "</tbody>" +
                                                         "</table>",


                                        width: 500,
                                        height: window.outerHeight * .6


                                    });




                                });


			                                }
			                            }
			                        },
			                        marker: {
			                            lineWidth: 1
			                        }
			                    }

			                },
			                series: [{ data: data.select(function (item) { return item.AlarmCount }) }]
			            };

			            console.log("chartOptions = %O", chartOptions);

			            vm.chart = Highcharts.chart('gsTopFiveAlarmTypesByEquipment' + vm.widget.Id, chartOptions);
			        }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/gsTopFiveAlarmTypesByEquipment.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());

(function () {

	var app = angular.module('app');

	app.directive('iframeWidget',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$sce",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $sce) {

				var controller = function ($scope) {
					var vm = this;

					vm.widget.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#3eff3e, #eefeee)',
						tagDataSortField: '-LastObservationDate',
						headingExtraTitle: '',
						obscureGraphics: true
					}



					

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
					$timeout(function() {					
						SetIFrameHeight();
					},25);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.OpenSettingsIfNoURLAndCloseIfURLIsPresent = function () {

						console.log("vm.OpenSettingsIfNoURLAndCloseIfURLIsPresent ");

						if (!vm.widget.WidgetResource.TargetURL || vm.widget.WidgetResource.TargetURL == '') {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id)
								.css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideDown();
						} else {
							$("#gridster" + vm.widget.Id).css('z-index', '2');
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
						}
					}



					$timeout(function () {
						if (!vm.widget.WidgetResource.TargetURL || vm.widget.WidgetResource.TargetURL == '') {

							var element = $("#widget-settings-" + vm.widget.WidgetResource.Id)[0].parentNode.parentNode.offsetParent;
							var position = $(element).offset();
							position.width = $(element).width();

							$("#gridster" + vm.widget.Id).css('z-index', '35');
							$("#widget-settings-" + vm.widget.WidgetResource.Id).css({ left: position.left + 20, top: position.top + 35, width: 500, 'z-index': 35 });
							$("#widget-settings-" + vm.widget.WidgetResource.Id).slideToggle();
						}
					}, 200);

					//Start watching for TargetURL changes	
					$scope.$watch("vm.widget.WidgetResource.TargetURL",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TargetURL && vm.widget.WidgetResource.TargetURL != '') {

							if (newValue != oldValue) {
								vm.widget.WidgetResource.$save();
								vm.url = $sce.trustAsResourceUrl(vm.widget.WidgetResource.TargetURL);
							}

						}
					});

					vm.CloseSettings = function () {
						$("#widget-settings-" + vm.widget.WidgetResource.Id).slideUp();
					}


					vm.url = $sce.trustAsResourceUrl(vm.widget.WidgetResource.TargetURL);



					function SetIFrameHeight() {
						var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						$("#systemIFrame" + vm.widget.Id).css('height', widgetDimensions.height);

					}





					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetIFrameHeight();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetIFrameHeight();
					
							}, 50, 20);
						}
					});






					//***G

					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});

					
				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/iframeWidget.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('linearMeter',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					//console.log("Linear Meter directive invoked");


					vm.lowPercentageWidth = ((vm.lowRangeEndValue - vm.lowRangeStartValue) / (vm.maxScale - vm.minScale)) * 100;
					vm.highPercentageWidth = ((vm.highRangeEndValue - vm.highRangeStartValue) / (vm.maxScale - vm.minScale)) * 100;
					vm.midPercentageWidth = 100 - vm.lowPercentageWidth - vm.highPercentageWidth;

					vm.lowRangeTitle = 'Low Range: ' + vm.lowRangeStartValue + ' to ' + vm.lowRangeEndValue;
					vm.normalRangeTitle = 'Normal Range: ' + vm.lowRangeEndValue + ' to ' + vm.highRangeStartValue;
					vm.highRangeTitle = 'High Range: ' + vm.highRangeStartValue + ' to ' + vm.highRangeEndValue;

					SetCurrentValueLabel();
					SetValuePercentagePosition();
					SetRangeFlags();

					//Start watch for value changes	
					$scope.$watch("vm.currentValue",
					function (newValue, oldValue) {
						SetValuePercentagePosition();
						SetCurrentValueLabel();
						SetRangeFlags();
					});


					function SetCurrentValueLabel() {
						var label = toFixed(vm.currentValue, 1).toString();
						if (label.indexOf('.') < 0) {
							label += '.0';
						}

						vm.currentValueLabel = label;
					}


					function SetRangeFlags() {
						if (vm.currentValue < vm.lowRangeEndValue) {
							vm.lowRangeActive = true;
							vm.normalRangeActive = false;
							vm.highRangeActive = false;
						}

						if (vm.currentValue >= vm.lowRangeEndValue && vm.currentValue < vm.highRangeStartValue) {
							vm.lowRangeActive = false;
							vm.normalRangeActive = true;
							vm.highRangeActive = false;
						}

						if (vm.currentValue >= vm.highRangeStartValue) {
							vm.lowRangeActive = false;
							vm.normalRangeActive = false;
							vm.highRangeActive = true;
						}


					}



					function SetValuePercentagePosition() {
						vm.valuePercentagePosition = ((vm.currentValue - vm.lowRangeStartValue - 20) / (vm.highRangeEndValue - vm.lowRangeStartValue)) * 100;
						if (vm.valuePercentagePosition > 95) {
							vm.valuePercentagePosition = 95;
						}

						if (vm.valuePercentagePosition < -5) {
							vm.valuePercentagePosition = -5;
						}
						vm.valuePercentagePosition += 3;
						//console.log("percentage position = " + vm.valuePercentagePosition);
					}

					function toFixed(number, fractionSize) {
						return +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
					}


				}; //++End of controller function


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/linearMeter.html?" + Date.now(),

					scope: {
						lowRangeStartValue: "=",
						lowRangeEndValue: "=",
						highRangeStartValue: "=",
						highRangeEndValue: "=",
						minScale: "=",
						maxScale: "=",
						lowRangeActiveColor: "@",
						highRangeActiveColor: "@",
						normalRangeActiveColor: "@",
						id: "@",
						label: "@",
						units: "@",
						currentValue: "="
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('pbbSummary',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;

					function GetHeadingExtraTitle() {
						if (vm.Asset && vm.Asset.Site && vm.Asset.ParentSystem && vm.Asset.ParentSystem.Name) {
							return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
						}
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-PLCLocalDate',
						alarmDataSortField: '-PLCLocalDate',
						warningsDataSortField: '-PLCLocalDate',
						headingExtraTitle: '',
						obscureGraphics: true,
						headingSearchField: true

					}

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							//console.log("Saving widget resource........");
							//console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							//console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

					vm.SetDefaultNavPillAlarms = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Alarms';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillWarnings = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Warnings';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillData = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Data';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}

					vm.alarmFilterFunction = function (element) {
						return element.ValueWhenActive == element.Value;
					};



				
					vm.tagFilterFunction = function (element) {
						if ((vm.widget.searchText || '') != '' && element.JBTStandardObservation && element.JBTStandardObservation.Name) {

							return element.JBTStandardObservation.Name.toLowerCase().indexOf((vm.widget.searchText || '').toLowerCase()) > -1;
						} else {
							if (element.JBTStandardObservation) {
								return true;
							} else {
								return false;
							}
						}
					};




					vm.tagsToGraph = [];

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("Initial vm.widget = %O", vm.widget);


					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}

					vm.SetAlarmSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.alarmDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.alarmDataSortField == fieldName) {
							if (vm.widget.displaySettings.alarmDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.alarmDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.alarmDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.alarmDataSortField = fieldName;
						}
					}

					vm.SetWarningSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.warningDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.warningDataSortField == fieldName) {
							if (vm.widget.displaySettings.warningDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.warningDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.warningDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.warningDataSortField = fieldName;
						}
					}


					vm.scrolledToEnd = function () {
						console.log("pbb Data Scrolled to end");
					}


					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						//console.log("Opening settings vm.Asset = %O", vm.Asset);
						if (!vm.pbb) {
							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}




					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						console.log("vm in vm.ProcessTagsToGraph = %O", vm);

						vm.dashboard.tagsToGraph = vm.tagsToGraphObjects.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
						if (vm.dashboard.tagsToGraph.length > 0) {
							$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
						} else {
							$rootScope.$broadcast("Dashboard.TagsToGraph", null);
						}

						return;

					}






					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						vm.pbb = vm.Asset;
						//console.log("pbbSummary Asset = %O", vm.Asset);
						GetPBBAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.pbb = null;

								SaveWidgetResourceObjectIfChanged();

								dataService.GetEntityById("SystemGroups", newValue).then(function (gateSystem) {
									vm.GateSystem = gateSystem;
								});
								GetPBBAssetForGate();

							}
						}
					});



					//***G
					//++Get the Data
					//---G
					function GetPBBAssetForGate() {

						dataService.GetJBTData().then(function (jbtData) {
							vm.JBTData = jbtData;




							vm.pbb = vm.JBTData
								.Assets
								.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PBB' });


							vm.Asset = vm.pbb;

							if (vm.widget.WidgetResource.GateSystemId) {

								vm.GateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == vm.widget.WidgetResource.GateSystemId });

							}

							//console.log("vm.pbb = %O", vm.pbb);


							vm.widget.WidgetResource.AssetId = vm.pbb.Id;
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							SaveWidgetResourceObjectIfChanged();
							dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pbb.Id).then(function () {

								vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.pbb.Id });

								vm.AssetGraphics.forEach(function (ag) {
									ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
									ag.showImage = false;
								});
								$timeout(function () {
									SetupSplitter();
									SetTabBodyHeight(5);
								}, 100);





								//console.log("Asset Graphics = %O", vm.AssetGraphics);
								vm.pbb.Tags.forEach(function (tag) {
									UpdateGraphicsVisibilityForSingleTag(tag);
								});

								vm.pbb.Tags = vm.pbb.Tags.distinct(function(a, b) { return a.TagId == b.TagId });

								vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
								vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

								if (!vm.alarms) {
									vm.alarms = [];
								}
								if (!vm.warnings) {
									vm.warnings = [];
								}

								vm.pbb.Tags = dataService.cache.tags.where(function (t) { return t.AssetId == vm.pbb.Id });
								var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

								vm.alarms = vm.pbb.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsAlarm && !commLossStandardObservationIds.any(function (a) { return a == dsTag.JBTStandardObservationId }) });
								vm.warnings = vm.pbb.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsWarning });
								vm.commLossTag = vm.pbb.Tags.first(function (t) { return commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });



								vm.widget.displaySettings.commLossTag = vm.commLossTag;
								console.log("PBB vm.alarms = %O", vm.alarms);
								//console.log("PBB vm.warnings = %O", vm.warnings);
								//console.log("PBB vm.pbb.Tags = %O", vm.pbb.Tags);
								//console.log("PBB CommLossTag = %O", vm.commLossTag);

								vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
								
								SetHeadingBackground();

								$timeout(function() {
									vm.showWidget = true;
								}, 100);

							});
						});
					}
					//***G


					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								if (vm.widget.WidgetResource.IsModalPopUp) {
									heightToSet = widgetDimensions.height - tabDimensions.height - 20;
								} else {
									heightToSet = widgetDimensions.height - tabDimensions.height - 3;
								}

								//console.log("Height to set = " + heightToSet);
								$("#tab-content" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-alarms" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-warnings" + vm.widget.Id).css('height', heightToSet);
								vm.showTags = true;
							}

						}, 50, repeatCount);
					}




					function SetHeadingBackground() {

						if (vm.alarms && vm.alarms.length > 0 && vm.alarms.any(function (a) { return a.ValueWhenActive == a.Value })) {

							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFDDDD)';


							return;
						}


						//+Commented out the yellow header on warnings present - Can put back in if needed.
						//if(vm.warnings && vm.warnings.length > 0) {

						//	vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FFFF00, #FFFFee)';

						//	return;
						//}


						if (AtLeastOneGraphicIsVisible() && (!vm.commLossTag || vm.commLossTag.Value != "1")) {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';
						} else {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';
						}


						

					}

					function AtLeastOneGraphicIsVisible() {
						if (vm.AssetGraphics) {
							return vm.AssetGraphics.any(function (ag) { return ag.showImage });
						}
						return false;
					}


					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {

							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									try {
										vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerGraphics' + vm.widget.Id],
											{
												elementStyle: function (dimension, size, gutterSize) {
													return {
														'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
													}
												},
												gutterStyle: function (dimension, gutterSize) {
													return {
														'flex-basis': gutterSize + 'px',
														'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
														'background-repeat': 'no-repeat',
														'background-position': '50%',
														'background-color': 'transparent',
														'cursor': 'col-resize'
													}
												},
												sizes: [vm.widget.WidgetResource.SplitLeftPercentage, vm.widget.WidgetResource.SplitRightPercentage],
												minSize: 0,
												onDragEnd: function () {

													var sizes = vm.splitter.getSizes();
													vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
													vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

													SaveWidgetResourceObjectIfChanged();
													//$interval(function() {

													//	SetTemperatureChartsToContainerSize();
													//	SetPressureChartsToContainerSize();
													//},25, 20);
												},
												onDrag: function () {
													//$timeout(function() {

													//	SetTemperatureChartsToContainerSize();
													//	SetPressureChartsToContainerSize();
													//});
												}

											});

									} catch (e) {

									}

								});

								vm.splitterIsSetup = true;
							});
						}


					}


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
							//SetTemperatureChartsToContainerSize();
							//SetPressureChartsToContainerSize();
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);
								//SetTemperatureChartsToContainerSize();
								//SetPressureChartsToContainerSize();

							}, 200);
						}
					});



					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {


						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						//console.log("Widget.AddTagsToGraph event at PCA Summary");

						//Clear the add tag checkbox buttons
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph = [];
					});




					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						SetHeadingBackground();
						return;

						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsAlarm || updatedTag.IsCritical) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Alarm Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.alarms) {
									vm.alarms.push(updatedTag);
								} else {
									vm.alarms = [];
									vm.alarms.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.alarms) {
									vm.alarms = vm.alarms.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}

						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsWarning) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							console.log("Warning Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.warnings) {
									vm.warnings.push(updatedTag);
								} else {
									vm.warnings = [];
									vm.warnings.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.warnings) {
									vm.warnings = vm.warnings.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}


					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.pbb) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.pbb.Id) {
								//console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								if (vm.AssetGraphics) {


									vm.AssetGraphics.forEach(function (ag) {

										//Set the "showImage" flag on each appropriately.
										ag.AssetGraphicVisibleValues.forEach(function (vv) {
											if (+vv.JBTStandardObservationId == +updatedTag.JBTStandardObservationId) {
												vv.showImage = (+updatedTag.Value == +vv.ValueWhenVisible || updatedTag.Value == vv.ValueWhenVisible);
											}
										});


										//Set the upper AssetGraphic flag if ALL of the lower flags are set.
										ag.showImage = ag.AssetGraphicVisibleValues.length > 0 && ag.AssetGraphicVisibleValues.all(function (av) {
											return av.showImage;
										});



									});



								}
							}

						}
						//console.log("vm.widget = %O", vm.widget);

						vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
						SetHeadingBackground();


					}


					//***G

					vm.tagOrderByLastChange = true;

					vm.SetTagOrderByLastChange = function () {
						vm.tagOrderByLastChange = true;
						vm.tagOrderByCustom = false;

					}

					vm.SetTagOrderByCustom = function () {
						vm.tagOrderByLastChange = false;
						vm.tagOrderByCustom = true;

					}





					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("pcaSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						}
					});

					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/pbbSummary.html",

					scope: {

						dashboard: "=",
						widget: "=",
						addTagsToGraphFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	"use strict";


	function PBBSummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("PBBSummaryModalCtrl invoked");


		var vm = this;

		vm.state = $state;


		vm.widget = $stateParams.widget;
		vm.assetId = $stateParams.assetId;
		vm.dashboard = $stateParams.dashboard;



		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function (data) {
			vm.JBTData = data;
			vm.gpu = data.Assets.first(function (a) { return a.Id == vm.assetId });
			vm.panelTitle = vm.widget.Name;
			vm.panelSubtitle = 'esc to close';
			vm.showScreen = true;


		});

		vm.AddToDashboard = function () {

			dataService.GetEntityById("WidgetTypes", vm.widget.WidgetResource.WidgetTypeId).then(function (wt) {


				return dataService.AddEntity("Widgets",
					{
						Name: 'PBB Summary',
						WidgetTypeId: vm.widget.WidgetResource.WidgetTypeId,
						ParentDashboardId: vm.dashboard.Id,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 100,
						Col: 0,
						AssetId: vm.widget.WidgetResource.AssetId,
						DefaultNavPill: "Press",
						GateSystemId: vm.widget.WidgetResource.GateSystemId,
						SiteId: vm.widget.WidgetResource.SiteId,
						SplitLeftPercentage: 50,
						SplitRightPercentage: 50,
						SystemId: vm.widget.WidgetResource.SystemId,
						TerminalSystemId: vm.widget.WidgetResource.TerminalSystemId,
						ZoneSystemId: vm.widget.WidgetResource.ZoneSystemId
					}).then(function (widget) {
						signalR.SignalAllClients("WidgetAdded", widget);
					});


			});

		}




		hotkeys.bindTo($scope)
		.add({
			combo: 'esc',
			description: 'Cancel and close any input form',
			allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
			callback: function () {
				$state.go("^");
			}
		});


	}

	angular
			.module("app")
			.controller("PBBSummaryModalCtrl", [
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
				PBBSummaryModalCtrl
			]);



})();
(function () {

    var app = angular.module('app');

    app.directive('pcaDischargePerformance',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;

			        

			        console.log("pcaDischargePerformance controller invoked. vm = %O", vm);
			        function GetHeadingExtraTitle() {
			            vm.widgetSite = vm.userSites.first(function (s) {
			                return s.Id == vm.widget.WidgetResource.SiteId

			            });

			            if (vm.widgetSite) {
			                return ' - ' + vm.widgetSite.Name;
			            }
			        }
			       
			        vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


			        vm.widget.displaySettings = {
			            headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
			            headingExtraTitle: '',
			            obscureGraphics: true
			        }
			        
			        $scope.$on("WidgetResize", function (event, resizedWidgetId) {

			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
			            }
			        });


			        $scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
			            if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
			                $interval(function () {
			                    displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

			                }, 50, 20);
			            }
			        });


			        $scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
			            console.log("pcaDischargePerformance Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
			            if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
			                vm.dashboard = modifiedExpandedDashboard;
			                GetChartData(false); //
			            }
			        });

			        vm.state = $state;

			        Highcharts.setOptions({
			            global: {
			                useUTC: false
			            }
			        });



			        //Get the site entities for which the user has access.
			        dataService.GetJBTData().then(function (JBTData) {
			            vm.JBTData = JBTData;
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

			            })
							.select(function (s) { return s.split('.')[1] });

			            console.log("user site codes = %O", userSiteCodes);

			            vm.userSites = vm.JBTData.Sites.where(function (site) {
			                return userSiteCodes.any(function (sc) { return sc == site.Name })
			            });

			            console.log("vm.userSites = %O", vm.userSites);

			            if (vm.userSites.length == 1) {
			                console.log("User only has a single Site");
			                vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
			                vm.widgetSite = vm.userSites[0];
			                GetChartData();
			            } else {

			                if (vm.widget.WidgetResource.SiteId) {
			                    GetChartData();
			                }
			            }
			            vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
			        });


			        //Start watching for site id changes	
			        $scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
					    if (vm.widget.WidgetResource.SiteId && vm.userSites) {

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
					        console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
					        if (oldValue != newValue) {
					            vm.widget.WidgetResource.$save();
					            vm.Heat = ""; vm.HeatTime = ""; vm.Cool = ""; vm.CoolTime = "";
					            changeSetPointValue = false;
					            GetChartData();
					        }
					    }
					});


			        function GetChartData(updateOnly) {
			            dataService.GetIOPSResource("Tags")
                                                     .orderBy("GateName", "asc")
                                                     .filter("SiteId", vm.widget.WidgetResource.SiteId)
                                                     .filter($odata.Predicate.or([new $odata.Predicate("JBTStandardObservationId", 2736), new $odata.Predicate("JBTStandardObservationId", 12374)]))
                                                     .filter("AssetName", "PCA")
			                                         .filter("LastReportedDate", ">=", vm.dashboard.webApiParameterStartDate)
                              
                            .query().$promise.then(function (data) {
                                console.log("PCA dataaa = %O",data);
                                vm.chartData = data;
							    if (updateOnly) {
							        //console.log("vm.chart = %O",vm.chart);
							        data.forEach(function (d) {
							            //Find the data point that matches the area and gs name and update THAT ONE to the right data value
							            vm.chart.series[0].data.first(function (dataPoint) {

							                return dataPoint.category == d.GateName
							            })
							        });
							        vm.chart.redraw();

							    } else {

							        $(function () {
							            displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							            //Render the chart
							            $timeout(function () {
							                CreateChart(data);
							                displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							            }, 100);
							        });
							    }
							    vm.data = data;
							    vm.showWidget = true;
							    vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

			        }



			        //Refresh data 
			        vm.updateInterval = $interval(function () {
			            GetChartData();
			        }, 120000);

			        $scope.$on("$destroy", function () {
			            $interval.cancel(vm.updateInterval);

			        });
			        var changeSetPointValue = false;
			        var setColor = '#ff0000';
			        function GetPCAStatus() {
			           
			            var a = new Array(); var b = new Array(); var c = new Array(); var d = new Array();

			            a = vm.chartData.where(function (t2) { return t2.JBTStandardObservationId == 12374 }).select(function (item) { return parseFloat(item.LastObservationTextValue) });
			            c = vm.chartData.where(function (t2) { return t2.JBTStandardObservationId == 12374 }).select(function (item) { return item.GateName });
			            d = vm.chartData.where(function (t2) { return t2.JBTStandardObservationId == 2736 }).select(function (item) { return item.GateName });
			            e = vm.chartData.where(function (t2) { return t2.JBTStandardObservationId == 2736 }).select(function (item) { return parseFloat(item.LastObservationTextValue) });
			           
			            console.log("changeSetPointValue", changeSetPointValue);
			            if (changeSetPointValue == false) {
			                for (i = 0; i < d.length + 1 ; i++) {
			                    indexVal = c.indexOf(d[i]);
			                    if (indexVal != null && a[indexVal] == 1) b[i] = '#00ff00';
			                    else b[i] = '#dedede';
			                }
			            }
			            else {
			                var setPointtemp = 0;
			                if (vm.Heat != "" && vm.HeatTime != "") {
			                    setPointtemp = parseFloat(vm.Heat);
			                    for (i = 0; i < d.length ; i++) {
			                        indexVal = c.indexOf(d[i]);
			                        if (indexVal != null && a[indexVal] == 1 && e[i] <= setPointtemp) b[i] = '#ff0000';
			                        else if (indexVal != null && a[indexVal] == 1 && e[i] > setPointtemp) b[i] = '#00ff00';
			                        else b[i] = '#dedede';
			                    }
			                }
			                else if (vm.Cool != "" && vm.CoolTime != "") {
			                    setPointtemp = parseFloat(vm.Cool);
			                    for (i = 0; i < d.length ; i++) {
			                        indexVal = c.indexOf(d[i]);
			                        if (indexVal != null && a[indexVal] == 1 && e[i] > setPointtemp) b[i] = 'lightblue';
			                        else if (indexVal != null && a[indexVal] == 1 && e[i] <= setPointtemp) b[i] = '#00ff00';
			                        else b[i] = '#dedede';
			                    }
			                }
			            
			            }
			            return b
			        }
			        
			        //function GetColor() {
			        //    $interval(function () { setColorVal(); }, 1000);
			        //    return setColor;
			        //}
			        //function setColorVal(){
			        //    if (color == '#ff0000') ? '#000000' : '#ff0000'
			        //}

			        function GetPCAStatusSetPoint() {
			            if ((vm.Heat != "" && vm.Cool != "") || ((vm.HeatTime != "" && vm.CoolTime != "")))
			                toastr.info("Please enter appropriate fields");
			            else if ((vm.Heat != "" && vm.HeatTime != "") || (vm.Cool != "" && vm.CoolTime != "")) {
			                changeSetPointValue = true;
			                GetChartData();
			            }
                        else
			                toastr.info("Please enter appropriate fields");
			            
			        }

			        vm.Heat = ""; vm.HeatTime = ""; vm.Cool = ""; vm.CoolTime = "";

			        vm.AddDischargeSetpoint = function () {
			            changeSetPointValue = false;
			            GetChartData();
			            var timeOutMilliSecs = 0;
			            if (vm.HeatTime != "" && vm.Heat != "" && vm.CoolTime == "" && vm.Cool == "")
			                timeOutMilliSecs = parseFloat(vm.HeatTime) * 60000;
			            else if (vm.CoolTime != "" && vm.Cool != "" && vm.HeatTime == "" && vm.Heat == "")
			                timeOutMilliSecs = parseFloat(vm.CoolTime) * 60000;
			            $timeout(function () { GetPCAStatusSetPoint();}, timeOutMilliSecs);
			           
			            return true
			        }
			        function GetTempValue() {
			            if (vm.HeatTime != "" && vm.Heat != "" && vm.CoolTime == "" && vm.Cool == "")
			                return parseFloat(vm.Heat);
			            else if (vm.CoolTime != "" && vm.Cool != "" && vm.HeatTime == "" && vm.Heat == "")
			                return parseFloat(vm.Cool);
			        }
			        function GetTempColor() {
			            if (vm.HeatTime != "" && vm.Heat != "" && vm.CoolTime == "" && vm.Cool == "")
			                return 'red';
			            else if (vm.CoolTime != "" && vm.Cool != "" && vm.HeatTime == "" && vm.Heat == "")
			                return 'lightblue';
			        }
			        function CreateChart(data) {


			            var chartOptions = {
			                chart: {
			                    type: 'column',
			                    marginRight: 130,
			                    marginBottom: 25,
			                    renderTo: "pcaDischargePerformance" + vm.widget.Id
			                },
			                animation: false,
			                credits: { enabled: false },
			                title: {
			                    text: '' 
			                },
			                xAxis: {
			                    type: 'category',
			                    categories: data.where(function (t2) { return t2.JBTStandardObservationId == 2736 }).select(function (item) { return item.GateName }),
			                    labels: {
			                        autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
			                        style: {
			                            fontSize: '10px',
			                            wordWrap: 'break word',
			                            fontFamily: 'Verdana, sans-serif'
			                        }
			                    }
			                },
			                yAxis: {
			                    plotLines: [{
			                        value: GetTempValue(),
			                        color: GetTempColor(),
			                        dashStyle: 'solid',
			                        width: 3
			                    }],
			                    min: 0,
			                    title: {
			                        text: '',
			                        style: {
			                            fontSize: '10px'
			                        }
			                    },
			                    stackLabels: {
			                        enabled: true,
			                        style: {
			                            fontWeight: 'bold'
			                        }
			                    }, 
			                },
			                legend: {
			                    enabled: false
			                },
			                tooltip: {
			                    headerFormat: '<b>{point.x}</b><br/>'
			                    
			                },
			                colors: GetPCAStatus(),
			                plotOptions: {
			                    column: {
                                    colorByPoint: true, 
			                        dataLabels: {
			                            enabled: true,
			                            formatter: function () {
			                                return Highcharts.numberFormat(this.y, 1);
			                            }
			                        }
			                    }
			                 },

			                series: [{ name: 'Disch Temp', data: data.where(function (t2) { return t2.JBTStandardObservationId == 2736 }).select(function (item) { return parseFloat(item.LastObservationTextValue) }) }]  
			            };
			            console.log("chartOptions = %O", chartOptions);
			         
			            vm.chart = Highcharts.chart('pcaDischargePerformance' + vm.widget.Id, chartOptions);
			            
			        }
			    };

			    controller.$inject = ["$scope"];

			    return {
			        restrict: 'E', //Default for 1.3+
			        templateUrl: "app/widgetDirectives/pcaDischargePerformance.html?" + Date.now(),

			        scope: {

			            dashboard: "=",
			            widget: "=",
			            signalUpdateFunction: "&",
			            setPanelHeadingColorFunction: "&",
			            mode: "@"
			        },

			        controllerAs: 'vm',
			        controller: controller,
			        bindToController: true //required in 1.3+ with controllerAs
			    };
			}
		]);

}());

(function () {

	var app = angular.module('app');

	app.directive('pcaSummary',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location) {

				var controller = function ($scope) {
					var vm = this;
					//console.log("PCA Summary Controller invoked");

					function GetHeadingExtraTitle() {
						//console.log("Getting site heading");
						if (vm.Asset && vm.Asset.Site && vm.Asset.ParentSystem) {						
							return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
						}
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: '-PLCLocalDate',
						alarmDataSortField: '-PLCLocalDate',
						warningsDataSortField: '-PLCLocalDate',
						headingExtraTitle: '',
						obscureGraphics: true,
						commLossTag: vm.commLossTag,
						headingSearchField: true

					}
					vm.scrolledToEnd = function () {
						//console.log("pca Data Scrolled to end");
					}


					vm.tagFilterFunction = function (element) {
						if ((vm.widget.searchText || '') != '') {
							return element.JBTStandardObservation.Name.toLowerCase().indexOf((vm.widget.searchText || '').toLowerCase()) > -1;
						} else {
							return true;
						}
					};

					vm.alarmFilterFunction = function (element) {
						return element.ValueWhenActive == element.Value;
					};



					vm.tagClicked = function(tag) {
						console.log("tag clicked = %O", tag);
					}


					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});


					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							//console.log("Saving widget resource........");
							//console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							//console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.tagsToGraph = [];

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("Initial vm.widget = %O", vm.widget);


					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}


					vm.SetAlarmSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.alarmDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.alarmDataSortField == fieldName) {
							if (vm.widget.displaySettings.alarmDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.alarmDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.alarmDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.alarmDataSortField = fieldName;
						}
					}

					vm.SetWarningSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.warningDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.warningDataSortField == fieldName) {
							if (vm.widget.displaySettings.warningDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.warningDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.warningDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.warningDataSortField = fieldName;
						}
					}



					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						console.log("Opening settings vm.Asset = %O", vm.Asset);

						if (!vm.pca) {

							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}


					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						console.log("vm in vm.ProcessTagsToGraph = %O", vm);

						vm.dashboard.tagsToGraph = vm.tagsToGraphObjects.concat(vm.dashboard.tagsToGraph).distinct(function (a, b) { return a.TagId == b.TagId }).where(function (t) { return t.Enabled });
						console.log("Dashboard vm.dashboard.tagsToGraph = %O", vm.dashboard.tagsToGraph);
						if (vm.dashboard.tagsToGraph.length > 0) {
							$rootScope.$broadcast("Dashboard.TagsToGraph", vm.dashboard.tagsToGraph);
						} else {
							$rootScope.$broadcast("Dashboard.TagsToGraph", null);
						}

						return;

					}


					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						vm.pca = vm.Asset;
						//console.log("pcaSumary Asset = %O", vm.Asset);
						GetPCAAssetForGate();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});


					//Start watching for gate id changes	
					$scope.$watch("vm.widget.WidgetResource.GateSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.GateSystemId) {

							//console.log("vm.widget.WidgetResource.GateSystemId changed. Now = %O", vm.widget);

							if (newValue != oldValue) {
								vm.pca = null;
								SaveWidgetResourceObjectIfChanged();
								GetPCAAssetForGate();
							}
						}
					});

					vm.GenerateTemperatureCharts = function () {
						//console.log("Generating...");
						GenerateAmbientTemperatureChart();
						GenerateDischargeTemperatureChart();
						GenerateCabinTemperatureChart();
						SetTabBodyHeight();
					}

					vm.GeneratePressureCharts = function () {
						//console.log("Generating...");
						GeneratePrimary1CompressorPressureChart();
						GeneratePrimary1CompressorSuctionChart();
						GeneratePrimary2CompressorPressureChart();
						GeneratePrimary2CompressorSuctionChart();
						GenerateSecondary1CompressorPressureChart();
						GenerateSecondary1CompressorSuctionChart();
						GenerateSecondary2CompressorPressureChart();
						GenerateSecondary2CompressorSuctionChart();
						SetTabBodyHeight();
					}


					vm.SetDefaultNavPillTemp = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Temp';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillPress = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Press';
							SaveWidgetResourceObjectIfChanged();
						}, 100);

					}
					vm.SetDefaultNavPillData = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Data';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}
					vm.SetDefaultNavPillAlarms = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Alarms';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}
					vm.SetDefaultNavPillWarnings = function () {
						$timeout(function () {
							vm.widget.WidgetResource.DefaultNavPill = 'Warnings';
							SaveWidgetResourceObjectIfChanged();
						}, 100);


					}

					//***G
					//++Get the Data
					//---G
					function GetPCAAssetForGate() {

						//console.log("Entry into GetPCAAssetForGate()");
						vm.pca = vm.JBTData
							.Assets
							.first(function (a) { return a.ParentSystemId == vm.widget.WidgetResource.GateSystemId && a.Name == 'PCA' });

						vm.Asset = vm.pca;
						//console.log("vm.pca = %O", vm.pca);


						vm.widget.WidgetResource.AssetId = vm.pca.Id;

						SaveWidgetResourceObjectIfChanged();
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

						//console.log("Getting tags into inventory");
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.pca.Id).then(function () {

							//console.log("tags into inventory done");
							vm.AssetGraphics = dataService.cache.assetGraphics.where(function (ag) { return ag.AssetId == vm.pca.Id });


							vm.AssetGraphics.forEach(function (ag) {
								ag.AssetGraphicVisibleValues = dataService.cache.assetGraphicVisibleValues.where(function (vv) { return vv.AssetGraphicId == ag.Id && vv.JBTStandardObservationId });
								ag.showImage = false;
							});
							$timeout(function () {
								SetupSplitter();
								SetTabBodyHeight(5);
							}, 50);

							//console.log("Asset Graphics = %O", vm.AssetGraphics);
							vm.pca.Tags.forEach(function (tag) {
								UpdateGraphicsVisibilityForSingleTag(tag);
							});

							vm.atLeastOneGraphicIsVisible = AtLeastOneGraphicIsVisible();
							vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();
							
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
							vm.GenerateTemperatureCharts();
							vm.GeneratePressureCharts();

							if (!vm.alarms) {
								vm.alarms = [];
							}
							if (!vm.warnings) {
								vm.warnings = [];
							}
							vm.pca.Tags = dataService.cache.tags.where(function (t) { return t.AssetId == vm.pca.Id });

							var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

							vm.alarms = vm.pca.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsAlarm && !commLossStandardObservationIds.any(function(a){ return a == dsTag.JBTStandardObservationId }) });
							vm.warnings = vm.pca.Tags.where(function (dsTag) { return dsTag.AssetId == vm.widget.WidgetResource.AssetId && dsTag.IsWarning });
							vm.commLossTag = vm.pca.Tags.first(function(t){return commLossStandardObservationIds.any(function(clso){ return clso == t.JBTStandardObservationId})});

							//console.log("PCA vm.alarms = %O", vm.alarms);
							//console.log("PCA vm.warnings = %O", vm.warnings);
							//console.log("PCA Tags for Asset = %O", vm.pca.Tags);
							//console.log("PCA Comm Loss Tag for Asset = %O", vm.commLossTag);

							vm.widget.displaySettings.commLossTag = vm.commLossTag;

							//console.log("PCA Tag Alarms = %O", vm.pca.Tags.select(function(t) {
							//	return {
							//		SName: t.JBTStandardObservation.Name,
							//		IsAlarm: t.IsAlarm
							//	}
							//}));

							SetHeadingBackground();

							$timeout(function () {
								vm.showWidget = true;
							}, 100);

							vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';

							$timeout(function() {
								$(function () {
									$('[data-toggle="tooltip"]').tooltip({html: true});
								})
							},50);

						});
					}
					//***G


					vm.alarmFilterFunction = function(element) {
						return element.ValueWhenActive == element.Value;
					};

					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var tabDimensions = displaySetupService.GetDivDimensionsById("nav-pills" + vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								if (vm.widget.WidgetResource.IsModalPopUp) {
									heightToSet = widgetDimensions.height - tabDimensions.height - 20;
								} else {
									heightToSet = widgetDimensions.height - tabDimensions.height - 3;
								}

								//console.log("Height to set = " + heightToSet);
								$("#tab-content" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-alarms" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-warnings" + vm.widget.Id).css('height', heightToSet);
								vm.showTags = true;
							}

						}, 50, repeatCount || 1);
					}





					function SetHeadingBackground() {

						if (vm.alarms && vm.alarms.length > 0 && vm.alarms.any(function (a) { return a.ValueWhenActive == a.Value })) {

							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFDDDD)';
							//vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FF0000, #FFFF00)';


							return;
						}
						//+Commented out the yellow header on warnings present - Can put back in if needed.
						//if(vm.warnings && vm.warnings.length > 0) {

						//	vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#FFFF00, #FFFFee)';


						//	return;
						//}


						if (AtLeastOneGraphicIsVisible() && (!vm.commLossTag || vm.commLossTag.Value != "1")) {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#3eff3e, #eefeee)';
						} else {
							vm.widget.displaySettings.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';
						}
					}

					function AtLeastOneGraphicIsVisible() {
						if (vm.AssetGraphics) {
							return vm.AssetGraphics.any(function (ag) { return ag.showImage });
						}
						return false;
					}

					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerGraphics' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage, vm.widget.WidgetResource.SplitRightPercentage],
											minSize: 0,
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

												SaveWidgetResourceObjectIfChanged();
											},

										});
									vm.splitterIsSetup = true;
								});


							});

						}


					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});

					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {

						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						console.log("Widget.AddTagsToGraph event at PCA Summary");

						//Clear the add tag checkbox buttons
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph = [];
					});




					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						UpdateAmbientChart(updatedTag);
						UpdateDischargeChart(updatedTag);
						UpdateCabinChart(updatedTag);
						UpdatePrimary1CompressorChart(updatedTag);
						UpdatePrimary1CompressorSuctionChart(updatedTag);
						UpdatePrimary2CompressorChart(updatedTag);
						UpdatePrimary2CompressorSuctionChart(updatedTag);
						UpdateSecondary1CompressorChart(updatedTag);
						UpdateSecondary1CompressorSuctionChart(updatedTag);
						UpdateSecondary2CompressorChart(updatedTag);
						UpdateSecondary2CompressorSuctionChart(updatedTag);
						SetHeadingBackground();
						return;


						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsAlarm || updatedTag.IsCritical) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Alarm Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.alarms) {
									vm.alarms.push(updatedTag);
								} else {
									vm.alarms = [];
									vm.alarms.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.alarms) {
									vm.alarms = vm.alarms.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}

						if (updatedTag.AssetId == vm.widget.WidgetResource.AssetId &&
							(updatedTag.IsWarning) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Warning Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.warnings) {
									vm.warnings.push(updatedTag);
								} else {
									vm.warnings = [];
									vm.warnings.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.warnings) {
									vm.warnings = vm.warnings.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}
							SetHeadingBackground();

						}
						



					});



					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.pca) {
							//See if this is the asset to which the tag belongs

							if (updatedTag.AssetId == vm.pca.Id) {
								//console.log("Updated Tag For widget - %O", updatedTag);

								//Update all of the graphics flags for the matching JBTStandardObservationId that was in the updatedTag
								if (vm.AssetGraphics) {


									vm.AssetGraphics.forEach(function (ag) {

										//Set the "showImage" flag on each appropriately.
										ag.AssetGraphicVisibleValues.forEach(function (vv) {
											if (vv.JBTStandardObservationId == updatedTag.JBTStandardObservationId) {

												vv.showImage = +updatedTag.Value == +vv.ValueWhenVisible || updatedTag.Value == vv.ValueWhenVisible;
											}
										});


										//Set the upper AssetGraphic flag if ALL of the lower flags are set.
										ag.showImage = ag.AssetGraphicVisibleValues.length > 0 && ag.AssetGraphicVisibleValues.all(function (av) {
											return av.showImage;
										});



									});



								}
							}

						}
						//console.log("vm.widget = %O", vm.widget);

						vm.widget.displaySettings.obscureGraphics = !AtLeastOneGraphicIsVisible();


					}

					function UpdateAmbientChart(updatedTag) {

						//If we have not yet built the ambient chart the ignore it
						if (vm.ambientDataTag && updatedTag.TagId == vm.ambientDataTag.TagId) {
							//console.log("Updating ambient value - ambient data tag = %O", vm.ambientDataTag);
							//console.log("Updating ambient value - updated tag = %O", updatedTag);
							if (+vm.ambientDataTag.Value > 250) {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value / 10;
							} else {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value;

							}
						}
					}

					function UpdateDischargeChart(updatedTag) {
						if (vm.dischargeDataTag && updatedTag.TagId == vm.dischargeDataTag.TagId) {
							//console.log("Updating discharge value");
							if (+vm.dischargeDataTag.Value > 250) {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value / 10;
							} else {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value;
							}
						}
					}

					function UpdateCabinChart(updatedTag) {
						//If we have not yet built the cabin chart the ignore it
						if (vm.cabinDataTag && updatedTag.TagId == vm.cabinDataTag.TagId) {
							//console.log("Updating cabin value");
							if (+vm.cabinDataTag.Value > 250) {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value / 10;
							} else {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value;
							}
						}
					}

					function UpdatePrimary1CompressorChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary1CompressorDataTag && updatedTag.TagId == vm.primary1CompressorDataTag.TagId) {
							//console.log("Updating pri comp 1 value");
							vm.primary1CompressorPressure = +vm.primary1CompressorDataTag.Value;
						}
					}

					function UpdatePrimary1CompressorSuctionChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary1CompressorSuctionDataTag && updatedTag.TagId == vm.primary1CompressorSuctionDataTag.TagId) {
							//console.log("Updating pri comp 1 Suction value");
							vm.primary1CompressorSuction = +vm.primary1CompressorSuctionDataTag.Value;
						}
					}

					function UpdatePrimary2CompressorChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary2CompressorDataTag && updatedTag.TagId == vm.primary2CompressorDataTag.TagId) {
							//console.log("Updating pri comp 2 value");
							vm.primary2CompressorPressure = +vm.primary2CompressorDataTag.Value;
						}
					}

					function UpdatePrimary2CompressorSuctionChart(updatedTag) {
						//If we have not yet built the chart the ignore it
						if (vm.primary2CompressorSuctionDataTag && updatedTag.TagId == vm.primary2CompressorSuctionDataTag.TagId) {
							//console.log("Updating pri comp 1 Suction value");
							vm.primary2CompressorSuction = +vm.primary2CompressorSuctionDataTag.Value;
						}
					}

					function UpdateSecondary1CompressorChart(updatedTag) {
						if (vm.secondary1CompressorDataTag && updatedTag.TagId == vm.secondary1CompressorDataTag.TagId) {
							vm.secondary1CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}
					}

					function UpdateSecondary1CompressorSuctionChart(updatedTag) {
						if (vm.secondary1CompressorSuctionDataTag && updatedTag.TagId == vm.secondary1CompressorSuctionDataTag.TagId) {
							vm.secondary1CompressorSuction = +vm.secondary1CompressorSuctionDataTag.Value;
						}
					}

					function UpdateSecondary2CompressorChart(updatedTag) {
						if (vm.secondary2CompressorDataTag && updatedTag.TagId == vm.secondary2CompressorDataTag.TagId) {
							//console.log("Updating sec comp 2 value");
							vm.secondary2CompressorPressure = +vm.secondary2CompressorDataTag.Value;
						}
					}

					function UpdateSecondary2CompressorSuctionChart(updatedTag) {
						if (vm.secondary2CompressorSuctionDataTag && updatedTag.TagId == vm.secondary2CompressorSuctionDataTag.TagId) {
							vm.secondary2CompressorSuction = +vm.secondary2CompressorSuctionDataTag.Value;
						}
					}

					//***G

					vm.tagOrderByLastChange = true;

					vm.SetTagOrderByLastChange = function () {
						vm.tagOrderByLastChange = true;
						vm.tagOrderByCustom = false;

					}

					vm.SetTagOrderByCustom = function () {
						vm.tagOrderByLastChange = false;
						vm.tagOrderByCustom = true;

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("pcaSummary Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
						}
					});

					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


					//+Generate the Ambient Temperature chart
					function GenerateAmbientTemperatureChart() {



						vm.ambientDataTag = vm.pca.Tags.where(function (tag) {
							return [4084].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.ambientDataTag) {
							if (+vm.ambientDataTag.Value > 250) {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value / 10;
							} else {
								vm.ambientAirTemperature = +vm.ambientDataTag.Value;

							}
						}


					}

					//+Generate the Discharge Temperature chart
					function GenerateDischargeTemperatureChart() {


						vm.dischargeDataTag = vm.pca.Tags.where(function (tag) {
							return [2736].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
						.orderByDescending(function (t) { return t.PLCLocalDate })
						.first();

						if (vm.dischargeDataTag) {
							if (+vm.dischargeDataTag.Value > 250) {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value / 10;
							} else {
								vm.dischargeAirTemperature = +vm.dischargeDataTag.Value;
							}
						}

					}

					//+Generate the Cabin Temperature chart
					function GenerateCabinTemperatureChart() {


						vm.cabinDataTag = vm.pca.Tags.where(function (tag) {
							return [4063, 3920, 4342].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.where(function (t) { return +t.Value > 2 })
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.cabinDataTag) {
							if (+vm.cabinDataTag.Value > 250) {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value / 10;
							} else {
								vm.cabinAirTemperature = +vm.cabinDataTag.Value;
							}
						}

					}

					//+Generate the Primary 1 Compressor Pressure chart
					function GeneratePrimary1CompressorPressureChart() {


						vm.primary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4076, 3908, 4053, 3848].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary1CompressorDataTag) {
							vm.primary1CompressorPressure = +vm.primary1CompressorDataTag.Value;
						}
					}

					//+Generate the Primary 1 Compressor Suction chart
					function GeneratePrimary1CompressorSuctionChart() {


						vm.primary1CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3912, 3987, 4019, 4057, 4080, 12306, 12310, 2863, 3731, 4695, 3797].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary1CompressorSuctionDataTag) {
							vm.primary1CompressorSuction = +vm.primary1CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Primary 2 Compressor Pressure chart
					function GeneratePrimary2CompressorPressureChart() {


						vm.primary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4077, 3909, 4079, 4054].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary2CompressorDataTag) {
							vm.primary2CompressorPressure = +vm.primary2CompressorDataTag.Value;
						}

					}


					//+Generate the Primary 2 Compressor Suction chart
					function GeneratePrimary2CompressorSuctionChart() {


						vm.primary2CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3913, 4020, 2253, 4081, 12297, 12299].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.primary2CompressorSuctionDataTag) {
							vm.primary2CompressorSuction = +vm.primary2CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Secondary 1 Compressor Pressure chart
					function GenerateSecondary1CompressorPressureChart() {


						vm.secondary1CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [4078, 3910, 4664].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();
						if (vm.secondary1CompressorDataTag) {
							vm.secondary1CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}
					}

					//+Generate the Secondary 1 Compressor Suction chart
					function GenerateSecondary1CompressorSuctionChart() {


						vm.secondary1CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [3914, 4666, 3849, 12304, 12308, 4082].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary1CompressorSuctionDataTag) {
							vm.secondary1CompressorSuction = +vm.secondary1CompressorSuctionDataTag.Value;
						}
					}

					//+Generate the Secondary 2 Compressor Pressure chart
					function GenerateSecondary2CompressorPressureChart() {


						vm.secondary2CompressorDataTag = vm.pca.Tags.where(function (tag) {
							return [3911].any(function (soId) { return soId == tag.JBTStandardObservationId });
						})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary2CompressorDataTag) {
							vm.secondary2CompressorPressure = +vm.secondary1CompressorDataTag.Value;
						}

					}

					//+Generate the Secondary 2 Compressor Suction chart
					function GenerateSecondary2CompressorSuctionChart() {


						vm.secondary2CompressorSuctionDataTag = vm.pca.Tags.where(function (tag) {
							return [12298, 1874, 4083, 3915].any(function (soId) { return soId == tag.JBTStandardObservationId });

						})
							//.where(function(t){return +t.Value > 2})
							.orderByDescending(function (t) { return t.PLCLocalDate })
							.first();

						if (vm.secondary2CompressorSuctionDataTag) {
							vm.secondary2CompressorSuction = +vm.secondary2CompressorSuctionDataTag.Value;
						}
					}


				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/pcaSummary.html",

					scope: {

						dashboard: "=",
						widget: "=",
						addTagsToGraphFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {
	"use strict";


	function PCASummaryModalCtrl($q, $state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR) {


		console.log("PCASummaryModalCtrl invoked");


		var vm = this;

		vm.state = $state;


		vm.widget = $stateParams.widget;
		vm.assetId = $stateParams.assetId;
		vm.dashboard = $stateParams.dashboard;

		console.log("PCASummaryModalCtrl widget = %O", vm.widget);

		//Do not show a screen until it is all ready.
		vm.showScreen = false;

		//Makes the uib buttons a nice shade of blue.
		uibButtonConfig.activeClass = 'radio-active';


		dataService.GetJBTData().then(function(data) {
			vm.JBTData = data;
			vm.pca = data.Assets.first(function (a) { return a.Id == vm.assetId });
			vm.panelTitle = vm.widget.Name;
			vm.panelSubtitle = 'esc to close';

			vm.showScreen = true;


		});


		vm.AddToDashboard = function() {

			dataService.GetEntityById("WidgetTypes", vm.widget.WidgetResource.WidgetTypeId).then(function(wt) {


				return dataService.AddEntity("Widgets",
					{
						Name: 'PCA Summary',
						WidgetTypeId: vm.widget.WidgetResource.WidgetTypeId,
						ParentDashboardId: vm.dashboard.Id,
						Width: wt.InitialWidth,
						Height: wt.InitialHeight,
						Row: 100,
						Col: 0,
						AssetId: vm.widget.WidgetResource.AssetId,
						DefaultNavPill: "Press",
						GateSystemId: vm.widget.WidgetResource.GateSystemId,
						SiteId: vm.widget.WidgetResource.SiteId,
						SplitLeftPercentage: 50,
						SplitRightPercentage: 50,
						SystemId: vm.widget.WidgetResource.SystemId,
						TerminalSystemId: vm.widget.WidgetResource.TerminalSystemId,
						ZoneSystemId: vm.widget.WidgetResource.ZoneSystemId
					}).then(function(widget) {
						signalR.SignalAllClients("WidgetAdded", widget);
				});


			});

		}


		hotkeys.bindTo($scope)
		.add({
			combo: 'esc',
			description: 'Cancel and close any input form',
			allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
			callback: function () {
				$state.go("^");
			}
		});


	}

	angular
			.module("app")
			.controller("PCASummaryModalCtrl", [
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
				PCASummaryModalCtrl
			]);



})();
(function () {

	var app = angular.module('app');

	app.directive('rawTagDataForAsset',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.alarms = [];

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					vm.columnHideWidth1 = 980;
					vm.columnHideWidth2 = 600;




					$scope.$$postDigest(function () {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});

					function GetHeadingExtraTitle() {
						//console.log("Getting the title");
						//console.log("vm = %O", vm);
						if (vm.Asset) {
							return ' - ' + vm.Asset.Site.Name + ' Gate ' + vm.Asset.ParentSystem.Name + ' - ' + vm.Asset.Name + (vm.Asset.ModelGenericName ? ' - ' + vm.Asset.ModelGenericName : '');
						}
					}


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						tagDataSortField: 'TagName',
						headingExtraTitle: GetHeadingExtraTitle(),
						obscureGraphics: true
					}

					vm.tagsToGraph = [];

					uibButtonConfig.activeClass = 'radio-active';

					vm.headingUpdateInterval = $interval(function () {
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					}, 500);


					$scope.$on("$destroy", function () {
						$interval.cancel(vm.headingUpdateInterval);

					});
					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}



					vm.ProcessTagsToGraph = function (tag) {

						//$timeout(function() {
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph.forEach(function (enabled, tagId) {
							vm.tagsToGraphObjects.push({ TagId: tagId, Enabled: enabled });
						});

						//console.log("vm.tagsToGraphObjects = %O", vm.tagsToGraphObjects);



						//Call the function that the dashboard provided with the collection of tags to add to the possible new widget
						vm.addTagsToGraphFunction()(vm.tagsToGraphObjects);




						return;
					}


					//Id the dashboard parameteres change, then reload the data based upon the date range.
					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboard.Id) {
							vm.dashboard = dashboard;

						}

					});


					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;

						vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == vm.widget.WidgetResource.AssetId });
						console.log("rawTagData Asset = %O", vm.Asset);
						GetTagsForAsset();

						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});





					//Start watching for asset id changes	
					$scope.$watch("vm.widget.WidgetResource.AssetId",
					function (newValue, oldValue) {

						console.log("AssetId changed - was " + oldValue + " now " + newValue);

						if (newValue != oldValue && newValue > 0) {
							console.log("Asset Id was different");
							vm.widget.WidgetResource.AssetId = +newValue;
							vm.widget.WidgetResource.$save();
							vm.Asset = vm.JBTData.Assets.first(function (a) { return a.Id == +newValue });
							GetTagsForAsset();
							vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
						}
					});



					function GetTagsForAsset() {
						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventory(vm.widget.WidgetResource.AssetId).then(function () {

							$timeout(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							}, 50);

							console.log("Monitoring asset = %O", vm.Asset);

						});
					}




					vm.OpenSettingsIfNoAssetAndCloseIfAssetIsPresent = function () {

						console.log("Opening settings vm.Asset = %O", vm.Asset);


						if (!vm.Asset) {
							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}

					vm.leastId = 0;

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});

					$scope.$on("GraphWidgetAdded", function (event, graphWidget) {


						if (vm.dashboard.Id == graphWidget.ParentDashboardId) {

							//Clear the add tag checkbox buttons
							vm.tagsToGraphObjects = [];
							vm.tagsToGraph = [];
						}
					});

					$scope.$on("Widget.AddTagsToGraph", function (event, graphWidget) {

						console.log("Widget.AddTagsToGraph event at PCA Summary");

						//Clear the add tag checkbox buttons
						vm.tagsToGraphObjects = [];
						vm.tagsToGraph = [];
					});



					vm.scrolledToEnd = function () {
						console.log("Scrolled to end fired");
						//var leastId = vm.alarms.min(function (d) { return d.Id });
						//GetData(leastId);

					}




				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/rawTagDataForAsset.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
						addTagsToGraphFunction: "&",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('reports',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;
					vm.state = $state;
					//Get the alarms data

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					function GetHeadingExtraTitle() {
						if (vm.widgetSite) {							
							return ' - ' + vm.widgetSite.Name;
						}
					}

					

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}


					vm.columnwidths = {
						Name: 30,
						Category: 30,
						Description: 10,
						LastRunDate: 10,
						Run: 12
					}

					vm.RunReport = function (report) {



						var timeZoneOffsetHoursFromUTC = -((new Date().getTimezoneOffset()) / 60);

						window.open(report.RSURL + '&accessToken=' + encodeURIComponent(Global.User.ODataAccessToken) + '&offset=' + timeZoneOffsetHoursFromUTC + '&siteId=' + vm.widget.WidgetResource.SiteId);
						window.open(report.RSURL);


						if (report.ReportRuns.length == 0) {
							//Record the fact the the report has been run.
							dataService.AddEntity("ReportRuns",
								{
									Date: utilityService.GetOdataUpdateableCurrentDateTime(),
									UserId: Global.User.Id,
									ReportId: report.Id
								}).then(function(newReportRun) {

									report.ReportRuns.push(newReportRun);
									SetLastRunDatePropertyForCollection(vm.reports);

							});
						} else {

							//Get the report run from the database to update it
							dataService.GetEntityById("ReportRuns", report.GSReportRuns[0].Id).then(function(dbReportRun) {
								dbReportRun.Date = utilityService.GetOdataUpdateableCurrentDateTime();
								dbReportRun.$save();
								report.GSReportRuns[0] = dbReportRun;
								SetLastRunDatePropertyForCollection(vm.reports);

							});

						}

					}


					$scope.$on("Reports", function (event, r) {
						r = dataService.GetJsonFromSignalR(r);
						console.log("Reports event. Report = %O", r);
						GetData();

					});


					vm.sortField = 'Name';

					vm.SetSortField = function (fieldName) {

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}


					function GetData() {

						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

						dataService.GetIOPSResource("Reports")
							.expandPredicate("ReportRuns")
								.filter("UserId", Global.User.Id)
							.finish()
							.query()
							.$promise
							.then(function(data) {

								SetLastRunDatePropertyForCollection(data);
								SetCategoryDescriptionsForCollection(data);

								


								//Correlate the reports collection with the sites to which the user has access.
								//The sites marked "HasGates" will be for the GS type reports. The sites marked "HasBaggageHandling" will be for the BHS reports. 


								vm.reports = data.where(function(r) {
									return (r.Type == 'GS' && vm.widgetSite.HasGates) || (r.Type == 'BHS' && vm.widgetSite.HasBaggageHandling);
								});

								//console.log("Report Data = %O", data);

								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

								$scope.$$postDigest(function() {
									$timeout(function() {
											displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
										},
										1);

								});

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();


							});


					}



					function SetCategoryDescriptionsForCollection(data) {
						data.forEach(function(r) {
							switch(r.Type) {
								case 'GS':
									r.Category = 'Gate Systems';
									break;

								case 'BHS':
									r.Category = 'Baggage Handling';
									break;

								default:
									r.Category = '';

							}
						});
					}

					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = Global.User.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

						//console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function (site) {
							return userSiteCodes.any(function(sc) { return sc == site.Name });
						});

						//console.log("vm.userSites = %O", vm.userSites);

						if (vm.userSites.length == 1) {
							console.log("User only has a single Site");
							vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
							vm.widgetSite = vm.userSites[0];
							GetData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								GetData();
							}
						}
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});


					//Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.SiteId && vm.userSites) {

							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
							//console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							if (oldValue != newValue) {
								vm.widget.WidgetResource.$save();
								GetData();
							}
						}
					});

					function SetLastRunDatePropertyForCollection(collection) {
						collection.forEach(function(r) {
							r.LastRunDate = r.ReportRuns.length > 0 ? r.ReportRuns[0].Date : null;
						});
						
					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});



					
				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/reports.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('siteActiveAlarms',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata) {

				var controller = function ($scope) {
					var vm = this;


					console.log("siteActiveAlarms directive controller invoked. vm = %O", vm);


					function GetHeadingExtraTitle() {
						vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });

						if (vm.widgetSite) {
							return ' - ' + vm.widgetSite.Name;
						}
					}

					vm.widget.headingBackground = 'linear-gradient(to bottom,#dedede, #fefefe)';


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}


					vm.user = Global.User;

					vm.canCloseAlarm = Global.User.AuthorizedActivities.any(function (aa) { return aa == "AuthorizedActivity.AdministerSystem" });


					vm.closeAlarm = function (alarm) {
						//Go and get a "pure" copy of the observation before closing
						alertify.set({
							labels: {
								ok: "Yes, Close this Alarm",
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to close this alarm?';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"

								return dataService.AddEntity("ChronologicalRawTagValueLogKepwareReceivers",
								{
									ObservationDateTime: utilityService.GetOdataUpdateableCurrentDateTime(),
									Value: "0",
									TagName: alarm.TagName

								});



							} else {
								// user clicked "no"
								toastr.info(location.Name, "Alarm was NOT closed!");
							}
						});


					}


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;


					vm.OpenSettingsIfNoTerminalAndCloseIfTerminalIsPresent = function () {

						console.log("Opening settings vm.terminalSystem = %O", vm.terminalSystem);


						if (!vm.terminalSystem) {
							$state.go(".widgetSettings", { widget: vm.widget });
						}
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
							vm.widgetSite = vm.userSites[0];
							GetAlarmTagsForSite();
							GetChartData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetAlarmTagsForSite();
								GetChartData();
							}
						}
						console.log("vm.widgetSite = %O", vm.widgetSite);
					});




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
								vm.activeAlarms = [];
								GetAlarmTagsForSite();
								GetChartData();
							}
						}
					});


					var fontFactor = .01;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {
						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {
							
							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("siteActiveAlarms Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});


					vm.chartDataInterval = $interval(function () {
						GetChartData();
					}, 300000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.chartDataInterval);
					});

					vm.tableDataInterval = $interval(function () {
						GetAlarmTagsForSite();
					}, 30000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.tableDataInterval);
					});


					//console.log("vm.diffDays = " + vm.diffDays);
					dataService.GetIOPSCollection("GSJBTStandardObservationIdExclusionListFromCurrentAlarms").then(function(data) {
						vm.exclusionList = data;
						console.log("vm.exclusionList = %O",vm.exclusionList);
					});

					function GetAlarmTagsForSite() {

						dataService.GetIOPSResource("Tags")
							.filter("SiteId", vm.widget.WidgetResource.SiteId)
							.filter($odata.Predicate.or([new $odata.Predicate("IsAlarm", true), new $odata.Predicate("IsCritical", true)]))
							.filter("LastObservationTextValue", "1")
							.expandPredicate("JBTStandardObservation")
								.expand("GSJBTStandardObservationIdExclusionListFromCurrentAlarms")
							.finish()
							.filter(new $odata.Func('indexof', 'Name', '|'), '>', 1)
							.query()
							.$promise
							.then(function (data) {

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								data = data.where(function (d) { return !d.JBTStandardObservation.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.length > 0 });


								//console.log("Raw Alarm Data = %O", data);

								dataService.PlaceTagsIntoInventory(data);
								if (!vm.activeAlarms) {
									vm.activeAlarms = [];
								}
								vm.activeAlarms = dataService.cache.tags.where(function (dsTag) { return data.any(function (dataItem) { return dataItem.Id == dsTag.TagId }) });
								console.log("Alarm tags = %O", vm.activeAlarms);

								$interval(function () {
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									SetChartSizeLine(vm.widget.Id, vm.chart);
									SetLargeFontSize();
								}, 25, 20);

								//$scope.$$postDigest(function () {
								//	$timeout(function() {

								//		var $table = $('#table' + vm.widget.Id);
								//		console.log("Identified table = %O", $table);
								//		$table.floatThead();
								//		//$table.floatThead({
								//		//	scrollContainer: function () {
								//		//		return $('#table-wrapper' + vm.widget.Id);
								//		//	}
								//		//});
								//	},250);
								//});



							});

					}

					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						if (updatedTag.SiteId == vm.widget.WidgetResource.SiteId &&
							(updatedTag.IsAlarm || updatedTag.IsCritical) &&
							updatedTag.TagName.indexOf('|') >= 3 && 
							!vm.exclusionList.any(function(ex){ return updatedTag.JBTStandardObservationId == ex.jbtStandardObservationId})
						) {
							//console.log("Alarm Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							if (+updatedTag.Value == 1) {
								if (vm.activeAlarms) {
									vm.activeAlarms.push(updatedTag);
								} else {
									vm.activeAlarms = [];
									vm.activeAlarms.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.activeAlarms) {
									vm.activeAlarms = vm.activeAlarms.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}

						}

					});

					
					function GetChartData(refresh) {


						console.log("Getting chart data");

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "gSAlertCountByDay" : "gSAlertCountByHour")
							.query({
								siteId: vm.widget.WidgetResource.SiteId,
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate
							}, function (data) {
								console.log("gSAlertCountByxxxx initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.TimeStamp)).getTime(), item.AlarmCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							});
					}



					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (widgetBodyDimensions) {
							if (chart) {
								chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
							}
							
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						vm.chart = Highcharts.chart('containerSiteActiveAlarms' + vm.widget.Id, {
							chart: {
								type: 'spline',
								animation: false,
								marginRight: 10,
								events: {
									load: function () {

										// set up the updating of the chart each second
										vm.chartSeries = this.series[0];
									}
								}
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: (vm.diffDays > 5) ? 'Alarms Per Day' : 'Alarms Per Hour',
								style: {
									fontSize: '.8em'
								}
							},
							xAxis: {
								type: 'datetime',
								dateTimeLabelFormats: {
									day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
									month: '%b \'%y'
								},
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								title: {
									text: ''
								},
								plotLines: [{
									value: 0,
									width: 1,
									color: '#808080'
								}]
							},
							tooltip: {
								formatter: function () {

									//console.log("Current this = %O", this);
									return '<b>' + this.series.name + '</b><br/>' +
										Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
										+ '<br/>' +
										Highcharts.numberFormat(this.y, 0) + ' Alarms';
								}
							},
							legend: {
								enabled: false
							},
							exporting: {
								enabled: true
							},
							series: [{
								name: 'Alarms',
								data: vm.chartData
							}]
						});

					}


					//console.log("siteCurrentAlarmsTable widget = %O", vm.widget);
					//console.log("siteCurrentAlarmsTable dashboard = %O", vm.dashboard);
					//console.log("siteActiveAlarms widgetId = %O", vm.widget.Id);





					vm.sortField = '-PLCLocalDate';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}

					function calculateAlarmDuration(a) {

						if (!a.ReturnToNormalTime || a.ReturnToNormalTime.getTime() < 1000) {
							a.ReturnToNormalTime = null;
							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, new Date());
						} else {

							a.Duration = utilityService.GetElapsedTimeAsDisplayString(a.ActiveDateTime, a.ReturnToNormalTime);
						}



					}

					function formatAlarm(a) {
						a.ActiveDateTime = utilityService.GetLocalDateFromUTCDateString(a.ActiveDateTime);
						a.AcknowledgeTime = utilityService.GetLocalDateFromUTCDateString(a.AcknowledgeTime);

						if (a.ReturnToNormalTime) {
							a.ReturnToNormalTime = utilityService.GetLocalDateFromUTCDateString(a.ReturnToNormalTime);

						}
						a.TransactionType = a.TransactionType.replace("Alarm ", "");

					}




					//vm.chartUpdateInterval = $interval(function () {
					//	GetChartData();
					//}, 5000);

					//$scope.$on("$destroy", function () {
					//	$interval.cancel(vm.chartUpdateInterval);

					//});







				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteActiveAlarms.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('siteActiveWarnings',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata) {

				var controller = function ($scope) {
					var vm = this;


					console.log("siteActiveWarnings directive controller invoked. vm = %O", vm);


					function GetHeadingExtraTitle() {
						vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });

						if (vm.widgetSite) {
							return ' - ' + vm.widgetSite.Name;
						}
					}

					vm.searchText = '';



					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}



					

					vm.filter = function (tag) {
						var upperSearchText = vm.searchText.toUpperCase();
						return tag.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) > -1
								|| 
								tag.Asset.Name.toUpperCase().indexOf(upperSearchText) > -1 
								|| 
								tag.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) > -1 ;
					};


					vm.user = Global.User;

					vm.canCloseWarning = Global.User.AuthorizedActivities.any(function (aa) { return aa == "AuthorizedActivity.AdministerSystem" });


					vm.closeWarning = function (warning) {
						//Go and get a "pure" copy of the observation before closing
						alertify.set({
							labels: {
								ok: "Yes, Close this Warning",
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to close this warning?';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"

								return dataService.AddEntity("ChronologicalRawTagValueLogKepwareReceivers",
								{
									ObservationDateTime: utilityService.GetOdataUpdateableCurrentDateTime(),
									Value: "0",
									TagName: warning.TagName

								});



							} else {
								// user clicked "no"
								toastr.info(location.Name, "Warning was NOT closed!");
							}
						});


					}


					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
					vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;


					vm.OpenSettingsIfNoTerminalAndCloseIfTerminalIsPresent = function () {

						console.log("Opening settings vm.terminalSystem = %O", vm.terminalSystem);


						if (!vm.terminalSystem) {

							$state.go(".widgetSettings", { widget: vm.widget });
						}
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
							vm.widgetSite = vm.userSites[0];
							GetWarningTagsForSite();
							GetChartData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetWarningTagsForSite();
								GetChartData();
							}
						}
						console.log("vm.widgetSite = %O", vm.widgetSite);
					});




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
								vm.activeAlarms = [];
								GetWarningTagsForSite();
								GetChartData();
							}
						}
					});


					var fontFactor = .0065;
					var fontMax = 20;

					//console.log("vm.dashboard = %O", vm.dashboard);


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetChartSizeLine(vm.widget.Id, vm.chart);
							SetLargeFontSize();
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							}, 50, 20);

						}
					});


					function SetLargeFontSize() {

						vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
						if (vm.widgetDimensions) {
							var hFontSize = vm.widgetDimensions.width * fontFactor;
							var vFontSize = vm.widgetDimensions.height * fontFactor * 1.5;

							var textSize = hFontSize > vFontSize ? vFontSize : hFontSize;
							vm.largeTextSize = textSize;
							if (vm.largeTextSize > fontMax) {
								vm.largeTextSize = fontMax;
							}
							
						}

					}

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("siteActiveWarnings Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
							vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));
							GetChartData(true); //true = refresh the data without drawing the chart again
						}
					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});



					//console.log("vm.diffDays = " + vm.diffDays);


					function GetWarningTagsForSite() {

						dataService.GetIOPSResource("Tags")
							.filter("SiteId", vm.widget.WidgetResource.SiteId)
							.filter($odata.Predicate.or([new $odata.Predicate("IsWarning", true)]))
							.filter("LastObservationTextValue", "1")
							.expandPredicate("JBTStandardObservation")
								.expand("GSJBTStandardObservationIdExclusionListFromCurrentAlarms")
							.finish()
							.filter(new $odata.Func('indexof', 'Name', '|'), '>', 1)
							.query()
							.$promise
							.then(function (data) {

								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
								data = data.where(function (d) { return !d.JBTStandardObservation.GSJBTStandardObservationIdExclusionListFromCurrentAlarms.length > 0 });


								//console.log("Raw Warning Data = %O", data);

								dataService.PlaceTagsIntoInventory(data);
								if (!vm.activeWarnings) {
									vm.activeWarnings = [];
								}
								vm.activeWarnings = dataService.cache.tags.where(function (dsTag) { return data.any(function (dataItem) { return dataItem.Id == dsTag.TagId }) });
								//console.log("Warning tags = %O", vm.activeWarnings);

								$interval(function () {
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									SetChartSizeLine(vm.widget.Id, vm.chart);
									SetLargeFontSize();
								}, 25, 20);


							});

					}





					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						if (updatedTag.SiteId == vm.widget.WidgetResource.SiteId &&
							(updatedTag.IsWarning) &&
							updatedTag.TagName.indexOf('|') >= 3
						) {
							//console.log("Warning Tag Update = " + updatedTag.TagName + "  " + updatedTag.Value);
							//GetWarningTagsForSite();
							if (+updatedTag.Value == 1) {
								if (vm.activeWarnings) {
									vm.activeWarnings.push(updatedTag);
								} else {
									vm.activeWarnings = [];
									vm.activeWarnings.push(updatedTag);
								}
							}

							if (+updatedTag.Value == 0) {
								if (vm.activeWarnings) {
									vm.activeWarnings = vm.activeWarnings.where(function (a) { return a.TagId != updatedTag.TagId });
								}
							}

						}

					});



					vm.chartDataInterval = $interval(function () {
						GetChartData();
					}, 300000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.chartDataInterval);
					});

					vm.tableDataInterval = $interval(function () {
						GetWarningTagsForSite();
					}, 30000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.tableDataInterval);
					});

					//GetChartData();

					function GetChartData(refresh) {


						//console.log("Getting chart data");

						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "gSAlertCountByDay" : "gSAlertCountByHour")
							.query({
								siteId: vm.widget.WidgetResource.SiteId,
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate
							}, function (data) {
								//console.log("gsWarningCountByxxxx initial data = %O", data);
								vm.chartData = data.select(function (item) {

									return [utilityService.GetLocalDateFromUTCDate(new Date(item.TimeStamp)).getTime(), item.WarningCount];
								});

								if (refresh) {
									vm.chart.series[0].setData(vm.chartData);
									vm.chart.setTitle({ text: (vm.diffDays > 5) ? 'Warnings Per Day' : 'Warnings Per Hour' });
								} else {
									RenderChartLine();

								}
								SetChartSizeLine(vm.widget.Id, vm.chart);
								SetLargeFontSize();

							});
					}



					function SetChartSizeLine(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						if (chart) {
							chart.setSize((widgetBodyDimensions.width * .80), (widgetBodyDimensions.height * .40) - 10, false);
						}
					}

					function RenderChartLine() {


						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								CreateChart();
								SetChartSizeLine(vm.widget.Id, vm.chart);
							}, 100);
						});




					}

					function CreateChart() {
						vm.chart = Highcharts.chart('containerSiteActiveWarnings' + vm.widget.Id, {
							chart: {
								type: 'spline',
								animation: false,
								marginRight: 10,
								events: {
									load: function () {

										// set up the updating of the chart each second
										vm.chartSeries = this.series[0];
									}
								}
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: (vm.diffDays > 5) ? 'Warnings Per Day' : 'Warnings Per Hour',
								style: {
									fontSize: '.8em'
								}
							},
							xAxis: {
								type: 'datetime',
								dateTimeLabelFormats: {
									day: (vm.diffDays > 5) ? '%m/%d' : '%m/%d %H:00',
									month: '%b \'%y'
								},
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								title: {
									text: ''
								},
								plotLines: [{
									value: 0,
									width: 1,
									color: '#808080'
								}]
							},
							tooltip: {
								formatter: function () {

									//console.log("Current this = %O", this);
									return '<b>' + this.series.name + '</b><br/>' +
										Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.x)
										+ '<br/>' +
										Highcharts.numberFormat(this.y, 0) + ' Warnings';
								}
							},
							legend: {
								enabled: false
							},
							exporting: {
								enabled: true
							},
							series: [{
								name: 'Warnings',
								data: vm.chartData
							}]
						});

					}


					//console.log("siteCurrentWarningsTable widget = %O", vm.widget);
					//console.log("siteCurrentWarningsTable dashboard = %O", vm.dashboard);
					//console.log("siteActiveWarnings widgetId = %O", vm.widget.Id);





					vm.sortField = '-PLCLocalDate';

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.sortField.substr(1, 50) == fieldName || vm.sortField == fieldName) {
							if (vm.sortField.substr(0, 1) == "-") {
								vm.sortField = fieldName;



							} else {
								vm.sortField = "-" + fieldName;

							}
						} else {
							vm.sortField = fieldName;

						}
					}





					




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteActiveWarnings.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('siteDataStream',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
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

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);


					vm.dataService = dataService;

					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = Global.User.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

						console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function (site) {
							return userSiteCodes.any(function (sc) { return sc == site.Name })
						});

						console.log("vm.userSites = %O", vm.userSites);
						LoadData();

					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});


					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {

							$interval(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});



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
								.where(function(t){return vm.userSites.any(function(s){ return t.SiteId == s.Id})})
								.where(function (t) {
									if (vm.searchText == '' || !vm.searchText) {
										return true;
									}


									return t.TagName.toUpperCase().indexOf(upperSearchText) >= 0 || t.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) >= 0 || t.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) >= 0;
								})
								.orderByDescending(function (t) { return t.PLCUTCDateMS })
								.take(100);

							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);


							//console.log("vm.tags = %O", vm.tags);


						});
					}

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteDataStream.html?" + Date.now(),

					scope: {
						dashboard: "=",
						widget: "=",
						widgetId: "@",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('siteGateSummary',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata) {

				var controller = function ($scope) {
					var vm = this;

					//console.log("Site Gate Summary directive invoked");

					function GetHeadingExtraTitle() {
						if (vm.widgetSite) {
							return ' - ' + vm.widgetSite.Name;
						}
					}



					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}

					vm.utilityService = utilityService;
					vm.showSettings = false;


					$timeout(function () {
						//vm.showSettings = true;
					}, 2000);

					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					//++A double click on the asset indicator will add a summary widget to the dashboard
					vm.AddToDashboard = function (asset, $event) {

						var widgetTypeId = asset.Name == 'PCA' ? 42 : asset.Name == 'PBB' ? 49 : asset.Name == 'GPU' ? 50 : 0;


						return dataService.GetEntityById("WidgetTypes", widgetTypeId).then(function (wt) {


							var gateSystem = vm.JBTData.Systems.first(function (s) { return s.Id == asset.ParentSystemId });
							var zoneSystem = vm.JBTData.Systems.first(function (s) { return s.Id == gateSystem.ParentSystemId });
							var terminalSystem = vm.JBTData.Systems.first(function (s) { return s.Id == zoneSystem.ParentSystemId });
							var newPosition = GetNextWidgetRowColumn();
							console.log("New Position calculation = %O", newPosition);

							return dataService.AddEntity("Widgets",
								{
									Name: wt.Name,
									WidgetTypeId: widgetTypeId,
									ParentDashboardId: vm.dashboard.Id,
									Width: wt.InitialWidth,
									Height: wt.InitialHeight,
									Row: newPosition.row - wt.InitialHeight+10,
									Col: newPosition.col,
									AssetId: asset.Id,
									DefaultNavPill: asset.Name == 'PCA' ? "Press" : asset.Name == 'GPU' ? "Amps" : "Data",
									SiteId: asset.SiteId,
									SplitLeftPercentage: 50,
									SplitRightPercentage: 50,
									SystemId: asset.ParentSystemId,
									GateSystemId: asset.ParentSystemId,
									ZoneSystemId: zoneSystem.Id,
									TerminalSystemId: terminalSystem.Id
								}).then(function (widget) {
									signalR.SignalAllClients("WidgetAdded", widget);
									return true;
								});
						});

					}

					//***G
					//++Adding a widget group
					//***G
					vm.AddWidgetGroupToDashboard = function (group) {
						console.log("Summary Group to add = %O", group);

						//Collect the asset ids in a list and pre-load the tags into the cache first.
						var assetIdList = group.PBBAsset ? group.PBBAsset.Id.toString() + ',' : "";

						if (group.PCAAsset) {
							assetIdList += group.PCAAsset ? group.PCAAsset.Id.toString() + ',' : "";
						}
						if (group.GPUAsset) {
							assetIdList += group.GPUAsset ? group.GPUAsset.Id.toString() + ',' : "";
						}

						console.log("AssetIdList = " + assetIdList);

						dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(assetIdList, false).then(
							function() {
								vm.AddToDashboard(group.PBBAsset).then(function () {
									vm.AddToDashboard(group.PCAAsset).then(function () {
										vm.AddToDashboard(group.GPUAsset);
									});
								});
							});

					}


					function GetNextWidgetRowColumn() {


						var nonPopUpWidgets = vm.dashboard.widgets.where(function (w) { return !w.IsModalPopUp });
						console.log("nonPopUpWidgets = %O", vm.dashboard.widgets);

						var lowestPoint = nonPopUpWidgets.max(function (w) { return w.row + w.sizeY });
						console.log("Lowest point = %O", lowestPoint);

						var lowestPointWidgets = nonPopUpWidgets.where(function (w) { return (w.row + w.sizeY) == lowestPoint });
						console.log("lowestPointWidgets = %O", lowestPointWidgets);

						var furthestRightPoint = lowestPointWidgets.max(function (w) { return (w.col + w.sizeX) });
						console.log("furthestRightPoint = %O", furthestRightPoint);



						var col = +furthestRightPoint;



						if (col >= 30) {
							col = 0;
						}

						return {
							row: lowestPoint,
							col: col
						}

					}

					//***G
					//++Opening a summary widget popup.
					//---G
					vm.OpenSummaryWidget = function (asset, $event) {
						console.log("Opening summary widget for asset  %O", asset);

						console.log("subWidgets = %O", vm.subWidgets);
						//+Add the child widget if not already in the database.
						var subWidget = vm.subWidgets.first(function (sw) { return sw.AssetId == asset.Id });
						if (subWidget) {

							console.log("Subwidget in cache = %O", subWidget);

							CreateChildWidgetFromDataAndOpenPopup(subWidget, asset);

							return;
						}






						console.log("sub widget was not in cache - getting from oData");
						dataService.GetIOPSResource("Widgets")
							.filter("ParentWidgetId", vm.widget.Id)
							.filter("AssetId", asset.Id)
							.query()
							.$promise
							.then(function (data) {
								if (data.length == 1) {

									console.log("Existing child widget = %O", data);

									var w = data[0];

									CreateChildWidgetFromDataAndOpenPopup(w, asset);

								} else {
									//The child widget does not yet exist. Create one and add it to the database,
									dataService.GetIOPSResource("SystemGroups")
										.filter("Id", asset.ParentSystemId)
										.expandPredicate("Parent")
										.expand("Parent")
										.finish()
										.query()
										.$promise
										.then(function(systemChainData) {

											var gateSystem = systemChainData[0];
											console.log("Gate System Chain = %O", gateSystem);

											var newChildWidget = {
												Name: asset.ParentSystem.Name + ' - ' + asset.Name + ' Summary',
												WidgetTypeId: asset.Name == 'PCA' ? 42 : asset.Name == 'GPU' ? 50 : asset.Name == 'PBB' ? 49 : 0,
												ParentDashboardId: vm.dashboard.Id,
												AssetId: asset.Id,
												SystemId: asset.ParentSystemId,
												SiteId: asset.SiteId,
												Width: 0,
												Height: 0,
												Row: 0,
												Col: 0,
												TerminalSystemId: gateSystem.Parent.Parent.Id,
												ZoneSystemId: gateSystem.Parent.Id,
												GateSystemId: gateSystem.Id,
												SplitLeftPercentage: 50,
												SplitRightPercentage: 50,
												ParentWidgetId: vm.widget.Id,
												IsModalPopUp: true
											}


											dataService.AddEntity("Widgets", newChildWidget).then(function(w) {

												CreateChildWidgetFromDataAndOpenPopup(w, asset);

											});


										});


								}



							});


					};


					function CreateChildWidgetFromDataAndOpenPopup(w, asset) {
						vm.childWidget = {
							sizeX: w.Width,
							sizeY: w.Height,
							row: w.Row,
							col: w.Col,
							prevRow: w.Row,
							prevCol: w.Col,
							Id: w.Id,
							Name: w.Name,
							WidgetResource: w,
							HasChanged: false
						}


						console.log("State transition commanded");
						switch (asset.Name) {
							case "PCA":
								$state.go(".pcaSummaryModal", { widget: vm.childWidget, assetId: asset.Id, dashboard: vm.dashboard });
								break;

							case "GPU":
								$state.go(".gpuSummaryModal", { widget: vm.childWidget, assetId: asset.Id, dashboard: vm.dashboard });
								break;

							case "PBB":
								$state.go(".pbbSummaryModal", { widget: vm.childWidget, assetId: asset.Id, dashboard: vm.dashboard });
								break;

							default:

						}
					}


					//---G


					vm.OpenSettingsIfNoSiteAndCloseIfSiteIsPresent = function () {

						//console.log("Opening settings vm.widgetSite = %O",vm.widgetSite);


						if (!vm.widgetSite) {


							$state.go(".widgetSettings", { widget: vm.widget });
						}
					}




					//---G
					//Get the site entities for which the user has access.
					dataService.GetJBTData().then(function (JBTData) {
						vm.JBTData = JBTData;
						var userSiteCodes = vm.user.ReaderOf.where(function (s) { return s.split('.')[0] == 'Site' })
							.select(function (s) { return s.split('.')[1] });

						//console.log("user site codes = %O", userSiteCodes);

						vm.userSites = vm.JBTData.Sites.where(function (site) {
							return userSiteCodes.any(function (sc) { return sc == site.Name })
						});

						//console.log("vm.userSites = %O", vm.userSites);

						if (vm.userSites.length == 1) {
							//console.log("User only has a single Site");
							vm.widget.WidgetResource.SiteId = vm.userSites[0].Id;
							vm.widgetSite = vm.userSites[0];
							GetData();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								vm.widgetSite = vm.JBTData.Sites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
								GetData();
							}
						}
						vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();
					});

					//***G
					//++Data Loading.....
					//---G
					function GetData() {
						vm.showWidget = true;

						var standardIdsToLoad = [12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255];




						dataService.GetIOPSResource("Tags")
							.filter("SiteId", vm.widget.WidgetResource.SiteId) //that belong to the widget site
							.filter($odata.Predicate.or(standardIdsToLoad.select(function (sid) { return new $odata.Predicate("JBTStandardObservationId", sid) })))
							.select(["SiteId", "Id", "LastObservationDate", "AssetId", "LastObservationId", "JBTStandardObservationId", "Name", "LastObservationTextValue", "IsCritical", "IsWarning", "IsAlarm", "ValueWhenActive", "AssetName", "GateName"])
							.orderBy("Name")
							.query()
							.$promise
							.then(function (data) {


								dataService.PlaceTagsIntoInventory(data);


								console.log("siteGateTags for [12374, 2736, 1942, 12484, 4331, 4445, 4765, 12255] std ids data = %O", data.orderBy(function (t) { return t.GateName }));


								vm.assetIds = data.select(function (d) {
									return d.AssetId.toString();
								}).distinct()
								.join(',');

								//+Get all Alarm Tags into the dataservice inventory. The last true parameter will cause the dataService method to only look for alarm tags.
								dataService.GetAllSignalRObservationFormattedTagsForAssetIdIntoInventoryByListOfAssetIds(vm.assetIds, true).then(function () {
									//console.log("Alarm Tags loaded into inventory");

									//console.log("assetIds = %O", assetIds);
									vm.widget.assetIds = vm.assetIds;
									var dataGroupedByGate = data.groupBy(function (t) { return t.GateName });
									//console.log("Grouped by Gate = %O", dataGroupedByGate);

									vm.gateTagGroups = dataGroupedByGate
										.select(function (g) {

											var pcaAsset = vm.JBTData.Assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'PCA' }) ? g.first(function (t2) { return t2.AssetName == 'PCA' }).AssetId : 0) });
											var pbbAsset = vm.JBTData.Assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'PBB' }) ? g.first(function (t2) { return t2.AssetName == 'PBB' }).AssetId : 0) });
											var gpuAsset = vm.JBTData.Assets.first(function (a) { return a.Id == (g.first(function (t2) { return t2.AssetName == 'GPU' }) ? g.first(function (t2) { return t2.AssetName == 'GPU' }).AssetId : 0) });


											var outputObject = {
												PCAAsset: pcaAsset,
												PBBAsset: pbbAsset,
												GPUAsset: gpuAsset,
												GateName: g.key,
												SortField: (!isFinite(g.key.substring(0, 1)) && isFinite(g.key.substring(1, 50))) ? g.key.substring(0, 1) + g.key.substring(1, 50).padStart(4, '0') : g.key,
												GateSystem: vm.JBTData.Systems.first(function (s) { return s.SiteId == vm.widget.WidgetResource.SiteId && s.TypeId == 3 && s.Name == g.key }),
												PCAUnitOnTag: pcaAsset ? pcaAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
												GPUUnitOnTag: gpuAsset ? gpuAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
												PBBUnitOnTag: pbbAsset ? pbbAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 12374 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
												DischargeTemperatureTag: pcaAsset ? pcaAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 2736 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null,
												AverageAmpsOutTag: gpuAsset ? gpuAsset.Tags.where(function (t) { return t.JBTStandardObservationId == 1942 }).orderByDescending(function (t2) { return t2.ObservationUTCDateMS }).first() : null
											}

											FormatZeroBlankDisplayValueForTag(outputObject.DischargeTemperatureTag);
											FormatZeroBlankDisplayValueForTag(outputObject.AverageAmpsOutTag);

											//	FormatDurationValue(outputObject.HookupDurationSecondsTag);


											return outputObject;
										})
										.orderBy(function (group) { return group.SortField });

									//+Attach the alarms and comm loss tags to the assets on the gate.
									//Once this is done, then the controller for this directive will no longer have to track them. The data service will be maintaining them.
									var commLossStandardObservationIds = [4331, 4445, 4765, 12255];

									//Need to get the alarms tags into the dataService tags cache for every asset.

									vm.gateTagGroups.forEach(function (gtg) {

										if (gtg.PBBAsset) {
											gtg.PBBAsset.AlarmTags = gtg.PBBAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
											SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.PBBAsset);
											gtg.PBBAsset.AlarmActiveTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.PBBAsset.Id && t.JBTStandardObservationId == 12323 });
											if (gtg.PBBAsset.AlarmActiveTag) {
												gtg.PBBAsset.AlarmActiveTag.ValueWhenActive = (gtg.PBBAsset.AlarmActiveTag.ValueWhenActive || "1");
											} else {
												//console.log("asset %O, has no alarm active tag", gtg.PBBAsset);
											}
											gtg.PBBAsset.CommLossTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.PBBAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
										}
										if (gtg.PCAAsset) {
											gtg.PCAAsset.AlarmTags = gtg.PCAAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
											SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.PCAAsset);
											gtg.PCAAsset.AlarmActiveTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.PCAAsset.Id && t.JBTStandardObservationId == 12324 });
											if (gtg.PCAAsset.AlarmActiveTag) {
												gtg.PCAAsset.AlarmActiveTag.ValueWhenActive = (gtg.PCAAsset.AlarmActiveTag.ValueWhenActive || "1");
											} else {
												//console.log("asset %O, has no alarm active tag", gtg.PCAAsset);
											}
											gtg.PCAAsset.CommLossTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.PCAAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
										}
										if (gtg.GPUAsset) {
											gtg.GPUAsset.AlarmTags = gtg.GPUAsset.Tags.where(function (dsTag) { return dsTag.IsAlarm });
											SetAlarmActiveForAssetBasedUponAlarmTagConditions(gtg.GPUAsset);
											gtg.GPUAsset.AlarmActiveTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.GPUAsset.Id && t.JBTStandardObservationId == 12325 });
											if (gtg.GPUAsset && gtg.GPUAsset.AlarmActiveTag) {
												gtg.GPUAsset.AlarmActiveTag.ValueWhenActive = (gtg.GPUAsset.AlarmActiveTag.ValueWhenActive || "1");
											} else {
												//console.log("asset %O, has no alarm active tag", gtg.GPUAsset);
											}
											gtg.GPUAsset.CommLossTag = dataService.cache.tags.first(function (t) { return +t.AssetId == +gtg.GPUAsset.Id && commLossStandardObservationIds.any(function (clso) { return clso == t.JBTStandardObservationId }) });
										}
									});

									console.log("vm.gateTagGroups = %O", vm.gateTagGroups);
									displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
									vm.showWidget = true;
								});



								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();

							});

						GetSubWidgets();

					}
					//***G

					function GetSubWidgets() {

						dataService.GetIOPSResource("Widgets")
							.filter("ParentWidgetId", vm.widget.WidgetResource.Id)
							.filter("SiteId", vm.widget.WidgetResource.SiteId)
							.query()
							.$promise.then(function (data) {
								vm.subWidgets = data;
								console.log("vm.subWidgets = %O", vm.subWidgets);
							});





					}



					//---B

					function FormatDurationValue(tag) {
						if (tag) {
							tag.DisplayValue = utilityService.SecondsToString(+tag.LastObservationTextValue);
							//if (+tag.LastObservationTextValue > 0) {
							//	tag.DisplayValue = utilityService.ToFixed(+tag.LastObservationTextValue, 1);
							//} else {
							//	tag.DisplayValue = '';
							//}
						}

					}

					//---B
					function FormatZeroBlankDisplayValueForTag(tag) {
						if (tag) {
							if (+tag.Value > 0) {
								tag.DisplayValue = utilityService.ToFixed(+tag.Value, 1);
							} else {
								tag.DisplayValue = '0.0';
							}
						}

					}



					//---B

					//Start watching for site id changes	
					$scope.$watch("vm.widget.WidgetResource.SiteId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.SiteId && vm.userSites) {

							vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
							//console.log("vm.widget.WidgetResource.SiteId changed. Now = %O", vm.widget);
							if (oldValue != newValue) {
								vm.widget.WidgetResource.$save();
								GetData();
							}
						}
					});


					//---B
					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

					//---B
					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});


					//***G
					//++Data Service Tag Updates
					//---G
					//+The data service is tracking all signalR pushed tag value updates in real-time.
					//+The data service will keep an inventory of all such updates as they happen.
					//+When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//+We will watch for it here and set the appropriate graphics flag.
					//---G

					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						UpdateGraphicsVisibilityForSingleTag(updatedTag);
						if (vm.gateTagGroups) {

							//Set the alarmIsActive attribute to the assets so that the display can place the correct red box around it's indicator.
							if (updatedTag.IsAlarm) {
								vm.gateTagGroups.forEach(function (tg) {

								
									//console.log("Alarm tag update. updatedTag = %O", updatedTag);
									if (tg.PBBAsset && tg.PBBAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.PBBAsset);
									}

									if (tg.PCAAsset && tg.PCAAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.PCAAsset);
									}

									if (tg.GPUAsset && tg.GPUAsset.Id == updatedTag.AssetId) {
										SetAlarmActiveForAssetBasedUponAlarmTagConditions(tg.GPUAsset);
									}


								});
							}
						}


					});

					//set the alarmActive for the asset if any of the alarm tag ValueWhenActive=Value
					function SetAlarmActiveForAssetBasedUponAlarmTagConditions(asset) {
						asset.alarmActive = false;
						asset.alarmActive = asset.AlarmTags.any(function (aTag) { return (aTag.ValueWhenActive + "") == (aTag.Value + "") });
					}


					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.gateTagGroups) {
							//console.log("Updated Tag For widget - %O", updatedTag);



							if (updatedTag.SiteId == 81473 && updatedTag.TagName.indexOf("Counter") == -1) {

								console.log("Test Tag " + updatedTag.Asset.Name + " - " + updatedTag.JBTStandardObservation.Name + " - " + updatedTag.Value + " = %O", updatedTag);
							}

							vm.gateTagGroups.forEach(function (tg) {

								var tgUpdateTag = tg.PCAUnitOnTag && tg.PCAUnitOnTag.TagId == updatedTag.TagId ? tg.PCAUnitOnTag :
													tg.GPUUnitOnTag && tg.GPUUnitOnTag.TagId == updatedTag.TagId ? tg.GPUUnitOnTag :
													tg.PBBUnitOnTag && tg.PBBUnitOnTag.TagId == updatedTag.TagId ? tg.PBBUnitOnTag :
													tg.DischargeTemperatureTag && tg.DischargeTemperatureTag.TagId == updatedTag.TagId ? tg.DischargeTemperatureTag :
													tg.AverageAmpsOutTag && tg.AverageAmpsOutTag.TagId == updatedTag.TagId ? tg.AverageAmpsOutTag :
													tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.TagId == updatedTag.TagId ? tg.HookupDurationSecondsTag : null;

								if (tgUpdateTag) {

									




									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									FormatZeroBlankDisplayValueForTag(tgUpdateTag);
									//if (tg.HookupDurationSecondsTag && tg.HookupDurationSecondsTag.TagId == updatedTag.TagId) {
									//	FormatDurationValue(tg.HookupDurationSecondsTag);
									//}

								}
							});
						}
					}

					//***G
					vm.state = $state;





					//+Update the duration counters each second until the next hard update from signalR
					vm.durationInterval = $interval(function () {
						if (vm.gateTagGroups) {

							vm.gateTagGroups.forEach(function (tg) {

								if (tg.HookupDurationSecondsTag && +tg.HookupDurationSecondsTag.LastObservationTextValue > 0) {
									tg.HookupDurationSecondsTag.LastObservationTextValue = +tg.HookupDurationSecondsTag.LastObservationTextValue;
									tg.HookupDurationSecondsTag.LastObservationTextValue += 1;
									FormatDurationValue(tg.HookupDurationSecondsTag);


								}
							});
						}

					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.durationInterval);

					});





					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


					function UpdateSelectedGateTagFromSignalR(gateTag, updatedTag) {
						//console.log("===========================================================");
						//console.log("Tag Update from SignalR = ", updatedTag.TagName + " StdObsId = " + updatedTag.JBTStandardObservationId + " Val=" + updatedTag.Value);
						//console.log("TG Item identified = %O", gateTag);

						gateTag.LastObservationTextValue = updatedTag.Value;
						gateTag.LastObservationId = updatedTag.LastObservationId;
						gateTag.LastObservationDate = updatedTag.LastObservationDate;

						//console.log("===========================================================");

					}

				};




				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/siteGateSummary.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('tagGraph',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$q", "$rootScope",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $q, $rootScope) {

				var controller = function ($scope) {
					var vm = this;


					console.log("tagGraph controller invoked");


					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}


					//***G
					//++Resizing
					//The graph of a lot of tags can result in slow resizes if they are allowed to happen as fast as resize events come it.
					//Create a counter that will show the resize events coming in.
					//If the chart has more than 5000 points, then use the resize interval, not real-time.
					vm.resizeEventCounter = 0;
					vm.pointCount = 0;
					vm.pointCountResizeIntervalLevel = 50000;
					vm.resizeInterval = $interval(function () {
						if (vm.resizeEventCounter > 0) {
							displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
							vm.resizeEventCounter = 0;

						}
					}, 500);

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						//console.log("Widget resize event");
						//Set a counter to increment with each resize event.
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							if (vm.pointCount < vm.pointCountResizeIntervalLevel) {
								displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);
								console.log("set size");
							} else {
								vm.resizeEventCounter++;
							}
							//console.log("vm.pointCount = " + vm.pointCount);
						}
					});



					$scope.$on("$destroy", function () {
						$interval.cancel(vm.resizeInterval);
						$interval.cancel(vm.chartUpdateInterval);
					});
					//***G



					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						console.log("bhsTopFiveJamDevicesWithLongestDuration Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							GetChartData(false); //
						}
					});



					$scope.$on("Dashboard.TagsToGraph", function (event, tagsToGraph) {
						vm.widget.tagsToGraph = tagsToGraph;

					});

					$scope.$on("Widget.AddTagsToGraph", function (event, widget) {
						//See if the widget selected is us
						if (widget.Id == vm.widget.Id) {
							//Add all of the tag ids to the WidgetGraphTag table
							$q.all(vm.widget.tagsToGraph.select(function (t) {
								return dataService.AddEntity("WidgetGraphTags", { WidgetId: vm.widget.Id, TagId: t.TagId });

							})).then(function () {

								//This will cause all graph selecting widgets to clear their local collection of tags to graph, causing all of the buttons depressed to reset.
								$rootScope.$broadcast("GraphWidgetAdded", vm.widget);
								vm.widget.tagsToGraph = null;

								//Clear out the selection of tag to graph
								vm.dashboard.tagsToGraph = [];
								GetChartData();
							});

						}


					});

					vm.state = $state;

					Highcharts.setOptions({
						global: {
							useUTC: false
						}
					});

					vm.AskUserCheckForDeleteSeries = function (series) {
						alertify.set({
							labels: {
								ok: "Just Hide Tag",
								cancel: "Remove Tag From Chart"
							},
							buttonFocus: "ok"
						});

						var message = series.name;

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "hide"

								console.log("hide");




							} else {
								// user clicked "no"
								console.log("remove");
								var tagId = series.options.tagId;
								series.remove();
								dataService.GetIOPSResource("WidgetGraphTags")
									.filter("TagId", tagId)
									.filter("WidgetId", vm.widget.Id)
									.query()
									.$promise
									.then(function (data) {
										data[0].Id = -data[0].Id;
										data[0].$save().then(function () {
											//GetChartData();
										});


									});


							}
						});

					}


					//The function below will determine the data point with the highest density of points.
					function TemporallyNormalize() {


						var time0 = performance.now();
						var obsCount = 0;
						var tagSetWithEarliestValue;


						var earliestDate = new Date('1/1/2500');
						var latestDate = new Date('1/1/1971');

						vm.GraphTagsData.forEach(function (tagSet) {
							console.log("tagSet = %O", tagSet);
							if (tagSet.Observations) {



								tagSet.Observations.forEach(function (obs) {
									obsCount++;
									if (obs.Date < earliestDate) {
										earliestDate = obs.Date;
										tagSetWithEarliestValue = tagSet;
									}
									if (obs.Date > latestDate) {
										latestDate = obs.Date;
									}
								});

							}
						});

						var time1 = performance.now();


						console.log("Date Range = %O", { First: earliestDate, Last: latestDate });
						console.log("tagSetWithEarliestValue = %O", tagSetWithEarliestValue);
						console.log("bsCount = " + (time1 - time0));
						console.log("Time = " + (time1 - time0));


					}

					function toFixed(number, fractionSize) {
						if (number) {
							var returnNumber = +(Math.round(+(number.toString() + 'e' + fractionSize)).toString() + 'e' + -fractionSize);
							return returnNumber || number;
						}
					}





					function DisplayLoadingMessage(message) {
						vm.loadingMessageArray.push(message);
						console.log("ZZZ - " + message.message);
					}


					function GetChartData(updateOnly) {


						var graphTagObservations = [];
						console.log();
						var startDate = (new Date(vm.dashboard.derivedStartDate));
						startDate = utilityService.GetUTCQueryDate(startDate);

						var endDate = (new Date(vm.dashboard.derivedEndDate));
						endDate = utilityService.GetUTCQueryDate(endDate);


						dataService.GetIOPSResource("WidgetGraphTags")
							.filter("WidgetId", vm.widget.Id)
							.expandPredicate("Tag")
								.expandPredicate("Asset")
									.expand("Site")
									.expand("System")
								.finish()
								.select(["Id", "JBTStandardObservationName"])
							.finish()
							.query()
							.$promise
							.then(function (graphTagsData) {



								

								vm.GraphTagsData = graphTagsData;
								vm.loadingMessageArray = [];
								console.log("Raw WidgetGraphTags Data = %O", graphTagsData);

								//The values that have to be pulled from observations start from midnight UTC.
								var endingMarginStartDate = new Date();
								endingMarginStartDate.setHours(0, 0, 0, 0);
								var oDataFilterTodayStartDate = utilityService.GetUTCQueryDate(endingMarginStartDate);

								console.log("dashboard = %O", vm.dashboard);
								var messageNumber = 0;


								$q.all(

									graphTagsData.select(function (gt) {

										DisplayLoadingMessage({ number: messageNumber++, message: "Loading Aggregated and Latest " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName});


										return dataService.GetIOPSResource("Observations")
											.filter("TagId", gt.Tag.Id)
											.filter("Date", ">", oDataFilterTodayStartDate)
											.filter("Date", "<", vm.dashboard.oDataFilterEndDate)
											.select(["Date", "FloatValue"])
											.orderBy("Date")
											.query()
											.$promise
											.then(function (data) {

												
												data.forEach(function (d) {
													d.Date = utilityService.GetLocalDateFromUTCDate(d.Date);
												});

												//Attach the observation data to the graphTagsData
												var graphTag = vm.GraphTagsData.first(function (td) { return td.TagId == gt.TagId });

												//Check the data to see if it is digital and set the property.
												vm.GraphTagsData
													.first(function (td) { return td.TagId == gt.TagId })
													.MarginObservations = data.select(
													function (obs) {
														return [obs.Date.getTime(), toFixed(obs.FloatValue, 1) || 0];

													}).orderBy(function (o) { return o.MillisecondsDate });

												DisplayLoadingMessage({ number: messageNumber++, message: "Latest Loaded " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + '  '  + data.length + ' pts'});

											});
										//Add the data queries for the daily aggregates
									}).concat(

										graphTagsData.select(function(gt) {
											return dataService.GetIOPSResource("ObservationAggregatedHighChartValues")
												.filter("TagId", gt.Tag.Id)
												.filter("Day", ">=", vm.dashboard.oDataFilterStartDate)
												.filter("Day", "<=", vm.dashboard.oDataFilterEndDate)
												.orderBy("Day")
												.query()
												.$promise
												.then(function(aggregateData) {

													DisplayLoadingMessage({ number: messageNumber++, message: "Aggregated Values Loaded " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName});


													var time0 = performance.now();
													var valuePairs = aggregateData
														.selectMany(function(d) {
															return d.TagValues
																.split('|')
																.where(function(v) { return v.length > 5 })
																.select(function(valuePair) {
																	var numericValuePair = valuePair.split(',');
																	return [+numericValuePair[0], +numericValuePair[1] || 0];
																});


														});

													gt.AggregateObservations = valuePairs;
													var time1 = performance.now();
													DisplayLoadingMessage({ number: messageNumber++, message: "Aggregated Value Pair Gen Time for: " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + " " + valuePairs.length + " pts = " + (time1 - time0)});
												});

										})




									)
								).then(function () {



									var digitalStepValue = 0.2;
									var digitalStepIncrement = 1.5;
									//TemporallyNormalize();



									vm.seriesData = vm.GraphTagsData.where(function (gt) { return gt.MarginObservations || gt.AggregateObservations }).select(function (gt) {

										DisplayLoadingMessage({ number: messageNumber++, message: "Generating Complete Series for: " + gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName + " " + (time1 - time0)});
										var time0 = performance.now();

										var dataPairs = gt.AggregateObservations
											.concat(gt.MarginObservations)
											.orderBy(function(vp) { return vp[0] });

										console.log("DataPairs = %O", dataPairs);

										gt.isDigital = IsDataDigital(dataPairs);

										var seriesObject = {
											connectNulls: true,
											tagId: gt.Tag.Id,
											digitalStepValue: digitalStepValue,
											isDigital: gt.isDigital,
											//groupPixelWidth: 5,
											name: gt.Tag.Asset.Site.Name + ' ' + gt.Tag.Asset.System.Name + ' ' + gt.Tag.Asset.Name + ' ' + gt.Tag.JBTStandardObservationName,
											data: gt.AggregateObservations
												.concat(gt.MarginObservations)
												.orderBy(function(vp){return vp[0]})
												.select(function (o) {
												vm.pointCount++;
												return [o[0], gt.isDigital ? (o[1] || 0) + digitalStepValue : toFixed(o[1],1)];
												//return [o[0], gt.isDigital ? (o[1] || 0) + digitalStepValue : o[1]];
											})
										};


										seriesObject.name += ' (' + utilityService.FormatNumberWithCommas(seriesObject.data.length) +  ' points)';
										var time1 = performance.now();
										console.log("Series Object = %O", seriesObject);
										DisplayLoadingMessage({ number: messageNumber++, message: "Complete Series Generation Time for: " + seriesObject.name + " " + seriesObject.data.length + " pts = " + (time1 - time0)});


										if (gt.isDigital) {
											seriesObject.step = 'left';
											digitalStepValue = digitalStepValue += digitalStepIncrement;
										}

										return seriesObject;

									});

									vm.allDataIsDigital = vm.GraphTagsData.all(function (gt) { return gt.isDigital });

									console.log("WidgetGraphTags Data with observations = %O", vm.GraphTagsData);
									console.log("Series Data = %O", vm.seriesData);
									var pointCount = 0;

									vm.seriesData.forEach(function (sd) {
										pointCount += sd.data.length;
									});
									vm.pointCount = pointCount;
									//console.log("Number of points in chart = " + pointCount);
									vm.widget.displaySettings.headingExtraTitle = ' - ' + utilityService.FormatNumberWithCommas(pointCount) + ' Points in Chart';
									DisplayLoadingMessage({ number: messageNumber++, message: "Creating Chart" });

									CreateChart();
									$timeout(function () {
										displaySetupService.SetLoneChartSize(vm.widget.Id, vm.chart);

									}, 10);

									//Now we can start listening for changes to the data points - IF the time period is 7 days or less.
									console.log("vm.dashboard = %O", vm.dashboard);
									if (vm.dashboard.DashboardTimeScope.Days < 8) {
										
										$scope.$on("dataService.TagUpdate", function (event, newTag) {
											if (vm.GraphTagsData && vm.chart) {
												if (vm.GraphTagsData.any(function (t) { return t.TagId == newTag.TagId })) {

													//This is an update to one of our tags.
													//console.log("Tag Update from the Dataservice = %O", newTag);
													var chartSeriesForTag = vm.chart.series.first(function (s) { return s.options.tagId == newTag.TagId });
													//console.log("chartSeriesForTag = %O", chartSeriesForTag);


													//The chart series might have been removed by the user. Check for a non null value before proceding.
													if (chartSeriesForTag) {
														chartSeriesForTag.addPoint([newTag.ObservationLocalDate.getTime(), chartSeriesForTag.options.isDigital ? +newTag.Value + chartSeriesForTag.options.digitalStepValue : +newTag.Value], true, false);
														vm.chart.redraw();
														vm.chartDataUpdatePending = true;
													}
												}

											}
										});
									}
								});


							});




					}


					vm.chartDataUpdatePending = false;
					vm.chartUpdateInterval = $interval(function() {
						if (vm.chartDataUpdatePending) {						
							vm.chart.redraw();
							vm.chartDataUpdatePending = false;
						}

					}, 1000);




					GetChartData();

					function IsDataDigital(observations) {
						//This will do a distinct on the data, and see if it consists entirely of 0 and 1
						var distinctData = observations.take(100).distinct(function (a, b) { return (a[1] || 0) == (b[1] || 0) });
						console.log("distinctData = %O", distinctData);
						return distinctData.length == 2;
					}

					function IsAggregateDataDigital(observations) {
						//This will do a distinct on the data, and see if it consists entirely of 0 and 1
						var distinctData = observations.take(100).distinct(function (a, b) { return a.FloatValue || 0 == b.FloatValue || 0 });
						return distinctData.length <= 2;
					}



					function GetChartYAxisTypeBasedOnValueSpread() {
						var highValue = 0;
						var lowValue = 9999999999999;

						vm.GraphTagsData.where(function (gt) { return gt.Observations }).forEach(function (gt) {
							gt.Observations.forEach(function (o) {

								if (o.FloatValue > highValue) {
									highValue = o.FloatValue;
								}
								if (o.FloatValue < lowValue) {
									lowValue = o.FloatValue;
								}

							});
						});

						if ((highValue - lowValue) > 20) {
							return 'logarithmic';
						} else {
							return 'linear';
						}


					}


					function CreateChart() {
						console.log("CreateChart called");
						var chartOptions = {

							chart: {
								zoomType: 'x'
							},

							rangeSelector: {
								enabled: true,
								allButtonsEnabled: true,
								buttons: [
									//{
									//	type: 'minute',
									//	count: 1,
									//	text: 'Min'
									//},
									//{
									//	type: 'hour',
									//	count: 1,
									//	text: 'Hour'
									//},
									//{
									//	type: 'day',
									//	count: 1,
									//	text: 'Day'
									//},
									//{
									//	type: 'week',
									//	count: 1,
									//	text: 'Week'
									//},
									//{
									//	type: 'month',
									//	count: 1,
									//	text: 'Month'
									//},
									{
										type: 'all',
										text: 'All'
									}
								],
								buttonTheme: {
									width: 60
								},
								selected: 5
							},
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},

							navigator: {
								enabled: false,
								handles: {
									backgroundColor: 'yellow',
									borderColor: 'red'
								},
								adaptToUpdatedData: false
							},

							legend: {
								enabled: true,
								//layout: 'vertical',
								labelFormatter: function () {
									return this.name;
								}

							},
							credits: { enabled: false },
							yAxis: {
								type: GetChartYAxisTypeBasedOnValueSpread(),
								labels: {
									enabled: !vm.allDataIsDigital,
									formatter: function () {
										return this.value;
									}
								},
								plotLines: [{
									value: 0,
									width: 2,
									color: 'silver'
								}]
							},

							xAxis: {
								type: 'datetime',
								visible: !vm.allDataIsDigital
							},

							plotOptions: {
								series: {
									turboThreshold: 1000,
									showInNavigator: true,
									marker: {
										enabled: false
									},
									states: {
										hover: {
											enabled: false
										}
									}

								},
								line: {

									events: {
										legendItemClick: function () {
											console.log('%O', this);
											if (this.visible) {
												vm.AskUserCheckForDeleteSeries(this);
											}

										}
									},
									showInLegend: true,
									lineWidth: 1
								}
							},

							tooltip: {
								//pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
								pointFormatter: function () {
									//console.log("Formatter function this = %O", this);
									return '<span style="color:' + this.color + '">' + this.series.name + '</span>: <b>' +
											(this.series.options.isDigital ? this.y - this.series.options.digitalStepValue : utilityService.ToFixed(this.y, 1)) +
										'</b><br/></span>';

								},
								valueDecimals: 2,
								split: true,
								shared: false
							},

							series: vm.seriesData
						};

						if (vm.allDataIsDigital) {

							chartOptions.yAxis.gridLineWidth = 0;
							chartOptions.yAxis.minorGridLineWidth = 0;

						}

						//console.log("chartOptions = %O", chartOptions);

						vm.chart = Highcharts.stockChart('tagGraph' + vm.widget.Id, chartOptions);
						//console.log("vm.chart = %O", vm.chart);
					}
				};





				controller.$inject = ["$scope"];

				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/tagGraph.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('terminalOverview',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$odata", "$q",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $odata, $q) {

				var controller = function ($scope) {
					var vm = this;

					console.log("Terminal Overview directive invoked");

					function GetHeadingExtraTitle() {
						if (vm.terminalSystem) {
							return ' - ' + vm.terminalSystem.Site.Name + ' Terminal ' + vm.terminalSystem.Name;
						}
					}

					

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						obscureGraphics: true
					}


					




					vm.bootstrapLabelColumns = 2;
					vm.bootstrapInputColumns = 10;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					//console.log("vm.widget = %O", vm.widget);

					//console.log("vm.user = %O", vm.user);
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//Do not display the widget contents until the accordions have been setup.
					vm.showWidget = false;

					vm.OpenSettingsIfNoTerminalAndCloseIfTerminalIsPresent = function () {

						console.log("Opening settings vm.terminalSystem = %O", vm.terminalSystem);
						if (!vm.terminalSystem) {
							$state.go(".widgetSettings", { widget: vm.widget});
						}
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
							vm.widgetSite = vm.userSites[0];
							GetTerminalsForWidgetSite();
						} else {

							if (vm.widget.WidgetResource.SiteId) {
								GetTerminalsForWidgetSite();
							}
						}
					});




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

					function GetTerminalsForWidgetSite() {
						if (vm.widget.WidgetResource.SiteId) {

							console.log("Getting the terminals for the widget site");

							vm.terminals = vm.JBTData
								.Systems
								.where(function (s) { return s.SiteId == vm.widget.WidgetResource.SiteId && s.Type == 'Terminal' });

						}
					}

					//Start watching for terminal id changes	
					$scope.$watch("vm.widget.WidgetResource.TerminalSystemId",
					function (newValue, oldValue) {
						if (vm.widget.WidgetResource.TerminalSystemId) {
							console.log("vm.widget.WidgetResource.TerminalSystemId changed. Old = %O", oldValue);
							console.log("vm.widget.WidgetResource.TerminalSystemId changed. New = %O", newValue);
							if (newValue != oldValue) {
								vm.widget.WidgetResource.$save();
								//GetGraphicActivationTagsForTerminal();
							}

							GetTerminalSystemWithGraphics();


						}
					});




					function GetTerminalSystemWithGraphics() {

						dataService.GetIOPSWebAPIResource("TerminalOverviewGraphicsAndTags")
							.query({
								terminalSystemId: vm.widget.WidgetResource.TerminalSystemId
							}, function (data) {

								var assetIds = data.select(function(d) {
									return d.AssetId.toString();
								}).distinct().join(',');

								//console.log("assetIds = %O", assetIds);
								vm.widget.assetIds = assetIds;


								vm.terminalGraphics = data;
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

								vm.terminalSystem = vm.JBTData.Systems.first(function(s){return s.Id == vm.widget.WidgetResource.TerminalSystemId});
								console.log("vm.terminalSystem = %O", vm.terminalSystem);
								console.log("TerminalOverviewGraphicsAndTags initial data = %O", data.orderBy(function(d){return d.ImageURL}));
								dataService.PlaceTerminalGraphicsTagsIntoInventory(data);
								vm.widget.displaySettings.headingExtraTitle = GetHeadingExtraTitle();


								vm.showWidget = true;
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							});


					}


					//vm.twoSecondInterval = $interval(function () {
					//	//console.log("Pulse");
					//	GetTerminalSystemWithGraphics();
					//},2000);



					//$scope.$on("$destroy", function () {
					//	$interval.cancel(vm.twoSecondInterval);

					//});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$interval(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

							}, 50, 20);
						}
					});


					//***G
					//++Data Service Tag Updates
					//---G
					//The data service is tracking all signalR pushed tag value updates in real-time.
					//The data service will keep an inventory of all such updates as they happen.
					//When the data service is finished updating it's local inventory of tag data, it will retransmit "dataService.TagUpdate" to the rest of the application locally.
					//We will watch for it here and set the appropriate graphics flag.
					$scope.$on("dataService.TagUpdate", function (event, updatedTag) {

						//console.log("tag update updatedTag = %O", updatedTag);
						UpdateGraphicsVisibilityForSingleTag(updatedTag);
					});

					function UpdateGraphicsVisibilityForSingleTag(updatedTag) {

						if (updatedTag && vm.terminalGraphics) {
							//See if this is the asset to which the tag belongs

							//console.log("Updated Tag For widget - %O", updatedTag);



							vm.terminalGraphics.forEach(function (tg) {
								//Set the "showImage" flag on each appropriately.
								if (+tg.JBTStandardObservationId == +updatedTag.JBTStandardObservationId && +updatedTag.TagId == +tg.TagId) {

									//console.log("===========================================================");
									//console.log("Tag Update from SignalR = ", updatedTag.TagName + " StdObsId = " + updatedTag.JBTStandardObservationId + " Val=" + updatedTag.Value);
									//console.log("TG Item identified = %O", tg);

								
									tg.LastObservationTextValue = updatedTag.Value;
									tg.LastObservationId = updatedTag.LastObservationId;
									tg.LastObservationDate = updatedTag.LastObservationDate;

									if (+updatedTag.Value == +(tg.ValueWhenVisible ? tg.ValueWhenVisible : 99999999)) {
										tg.showImage = true;
									} else {
										tg.showImage = false;
									}
								}
							});
						}
					}

					//***G
					vm.state = $state;


					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/terminalOverview.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						addTagsToGraphFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('ticketCounterThroughput',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$q",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $q) {

				var controller = function ($scope) {
					var vm = this;


					//console.log("vm.dashboard = %O", vm.dashboard);

					function SetDiffDays() {
						var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
						vm.diffDays = Math.round(Math.abs((vm.dashboard.derivedStartDate.getTime() - new Date().getTime()) / (oneDay)));

					}

					SetDiffDays();
					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);



					function GetQueryParametersObject() {

						var obj = {
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							siteId: 81463
						};
						//console.log("Query Parameters Object = %O", obj);

						return obj;

					}


					dataService.GetIOPSWebAPIResource("BHSLocationThroughput")
						.query({
							beginDate: vm.dashboard.webApiParameterStartDate,
							endDate: vm.dashboard.webApiParameterEndDate,
							location: "TicketCounter"
						},
							function (data) {
								//console.log("BHSLocationThroughput initial data = %O", data);
								vm.data = data;
								vm.chartData = data.orderBy(function (item) { return item.Section }).select(function (item) {
									return [item.Section, item.BagCount];
								});
								vm.totalBags = vm.data.sum(function (item) { return item.BagCount });
								//console.log("Rendering charts");
								RenderChartPie();
								RenderChartBar();
							});



					dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
						.query(GetQueryParametersObject(),
							function (data) {
								//console.log("BHSTotalSystemThroughputController initial data = %O", data);
								//Compile a list of the distinct sections found and key them by section.

								vm.accurateTicketCounterThroughput = data.where(function (d) { return d.Location == "TicketCounter" }).sum(function (d) { return d.BagCount });
								//console.log("vm.accurateTicketCounterThroughput = " + vm.accurateTicketCounterThroughput);
								if (vm.chartPie) {
									vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });
								} else {
									if (vm.chartPie) {
										
										$interval(function () {
											vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });

										}, 200, 20);
									}
								}

								return data;
							});





					vm.sparklineYAxisMax = 0;



					function GetSparklineChartData() {


						dataService.GetIOPSWebAPIResource(vm.diffDays > 5 ? "BHSLocationThroughputHistoryByDay" : "BHSLocationThroughputHistoryByHour")
							.query({
								beginDate: vm.dashboard.webApiParameterStartDate,
								endDate: vm.dashboard.webApiParameterEndDate,
								location: "TicketCounter"
							},
								function (data) {

									//Compile a list of the distinct sections found and key them by section.
									vm.sectionsGrouped = data
										.groupBy(function (t) { return t.Section })
										.select(function (group) {
											return {
												Name: group.key,
												Data: group.select(function (item) {
													if (item.BagCount > vm.sparklineYAxisMax) {
														vm.sparklineYAxisMax = item.BagCount;
													}
													return {
														Day: utilityService.GetLocalDateFromUTCDate(item.ThroughputDay || item.ThroughputHour),
														BagCount: item.BagCount
													};
												})
											};

										});


									//Create a chart for each section
									$timeout(function () {
										vm.sectionsGrouped.forEach(function (section) {
											try {
												
												section.Chart = new Highcharts.Chart(GetHighChartConfigSparkline(section));
											} catch (e) {
												//console.log("Error");
											}
										});

										//console.log("Sections Grouped = %O", vm.sectionsGrouped);


									},
										10);


								}
							);



					}

					GetSparklineChartData();

					$scope.$on("Dashboard", function (event, modifiedExpandedDashboard) {
						//console.log("ticketCounterThroughput Dashboard event. Modified Dashboard = %O", modifiedExpandedDashboard);
						if (modifiedExpandedDashboard.Id == vm.dashboard.Id) {
							vm.dashboard = modifiedExpandedDashboard;
							SetDiffDays();
							RefreshData();
							vm.sparklineYAxisMax = 0;
							GetSparklineChartData();
						}
					});




					var dimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);

					//console.log("Panel Dimensions = %O", dimensions);

					function GetHighChartConfigSparkline(section) {
						return {
							chart: {
								renderTo: "sparkLineContainer" + vm.widget.Id + section.Name,
								backgroundColor: null,
								borderWidth: 0,
								type: 'area',
								margin: 0,
								marginRight: 0,
								marginBottom: -5,
								style: {
									overflow: 'visible'
								},

								// small optimalization, saves 1-2 ms each sparkline
								skipClone: true
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},

							xAxis: {
								type: 'datetime',
								labels: {
									enabled: false
								},
								lineWidth: 0,
								gridLineWidth: 0,
								minorGridLineWidth: 0,
								lineColor: 'transparent',
								title: {
									text: null
								},
								startOnTick: false,
								endOnTick: false,
								tickPositions: []
							},
							yAxis: {
								max: vm.sparklineYAxisMax,
								gridLineWidth: 0,
								minorGridLineWidth: 0,
								lineColor: 'transparent',
								endOnTick: false,
								startOnTick: false,
								labels: {
									enabled: false
								},
								title: {
									text: null
								},
								tickPositions: [0]
							},
							legend: {
								enabled: false
							},
							tooltip: {

								formatter: function () {
									//console.log("Current this = %O", this);
									return Highcharts.dateFormat(vm.diffDays > 5 ? '%m/%d/%Y' : '%m/%d/%Y %H:00', this.point.x)
										+ '<br/>' +
										Highcharts.numberFormat(this.y, 0, '.', ',') + ' Bags';
								},
								hideDelay: 0

							},
							plotOptions: {
								series: {
									animation: false,
									lineWidth: 1,
									shadow: false,
									states: {
										hover: {
											lineWidth: 1
										}
									},
									marker: {
										radius: 1,
										states: {
											hover: {
												radius: 2
											}
										}
									},
									fillOpacity: 0.25
								},
								column: {
									negativeColor: '#910000',
									borderColor: 'silver'
								}
							},
							exporting: {
								enabled: false
							},
							series: [
							{
								name: 'Throughput',
								animation: false,



								data: section.Data.select(function (point) {
									return [new Date(point.Day).getTime(), point.BagCount];
								}),
								pointStart: 1,
								dataLabels: {
									enabled: false

								}
							}]





						}
					}

					function GetHighChartConfigBar() {
						return {
							chart: {
								type: 'column',
								renderTo: "containerTicketCounterThroughputBar" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: '',
								style: {
									fontSize: '.8em'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: ''
								}
							},
							legend: {
								enabled: false
							},
							tooltip: {
								pointFormat: 'Throughput: <b>{point.y:.0f} bags</b>'
							},
							series: GetCounts()
						}
					}

					function GetHighChartConfigPie() {
						return {
							chart: {
								type: 'pie',
								renderTo: "containerTicketCounterThroughputPie" + vm.widget.Id
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: vm.accurateTicketCounterThroughput || '... ' + ' Bags',
								style: {
									fontSize: '1.75em',
									fontWeight: 'bold'
								}
							},
							//subtitle: {
							//	text: ''
							//},
							xAxis: {
								type: 'category',
								labels: {
									autoRotation: [-10, -20, -30, -40, -50, -60, -70, -80, -90],
									style: {
										fontSize: '10px',
										fontFamily: 'Verdana, sans-serif'
									}
								}
							},
							yAxis: {
								min: 0,
								title: {
									text: 'Throuput (bags)'
								}
							},
							legend: {
								enabled: true
							},
							tooltip: {
								pointFormat: 'Throughput: <b>{point.y:.0f} bags</b>'
							},
							exporting: {
								enabled: false
							},
							series: GetCounts()
						}
					}

					function GetCounts() {
						return [
						{
							name: 'Throughput',
							animation: false,



							data: vm.chartData,
							dataLabels: {
								enabled: false,
								rotation: 0,
								color: '#FFFFFF',
								align: 'right',
								fontSize: '.7em',
								format: '{point.y:.0f}', // one decimal
								y: 10, // 10 pixels down from the top
								style: {
									fontSize: '13px',
									fontFamily: 'Verdana, sans-serif'
								}
							}
						}
						];
					}

					function SetChartSizeBar(widgetId, chart) {
						//Set the bar chart to be 40% high, 60% wide
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						chart.setSize((widgetBodyDimensions.width * .75) - 45, (widgetBodyDimensions.height * .25) - 10, false);
					}

					function SetChartSizePie(widgetId, chart) {
						//Set the pie chart to be 40% high, 30% wide
						//console.log("widgetId = " + widgetId);
						var widgetBodyDimensions = displaySetupService.GetWidgetPanelBodyDimensions(widgetId);
						chart.setSize((widgetBodyDimensions.width * .25) + 40, (widgetBodyDimensions.height * .25), false);
					}

					function RenderChartPie() {
						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								vm.chartPie = new Highcharts.Chart(GetHighChartConfigPie());

								SetChartSizePie(vm.widget.Id, vm.chartPie);
							},
								100);
						});
					}

					function RenderChartBar() {
						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								vm.chartBar = new Highcharts.Chart(GetHighChartConfigBar());
								SetChartSizeBar(vm.widget.Id, vm.chartBar);
							});
						});
					}


					//Refresh data on the 15 second system clock tick
					$scope.$on("System.ClockTick15", function () {
						RefreshData();
						vm.sparklineYAxisMax = 0;
						GetSparklineChartData();
					});

					function RefreshData() {

						//console.log("Refreshing Data");


						dataService.GetIOPSWebAPIResource("BHSLocationThroughput")
							.query({
									beginDate: vm.dashboard.webApiParameterStartDate,
									endDate: vm.dashboard.webApiParameterEndDate,
									location: "TicketCounter"
								},
								function(data) {
									vm.data = data;

									//Must have separate collections of chart data to update each chart.
									var chartData = vm.data.orderBy(function (item) { return item.Section }).select(function (tc) {
										return [tc.Section, tc.BagCount];
									});
									vm.chartPie.series[0].setData(chartData);

									//Separate one for the bar chart. Using it in the chart above seems to destroy it.
									chartData = vm.data.orderBy(function (item) { return item.Section }).select(function (tc) {
										return [tc.Section, tc.BagCount];
									});
									vm.chartBar.series[0].setData(chartData);
									vm.totalBags = vm.data.sum(function (item) { return item.BagCount });


								});


						dataService.GetIOPSWebAPIResource("BHSTotalSystemThroughput")
							.query(GetQueryParametersObject(),
								function(data) {
									//console.log("BHSTotalSystemThroughputController initial data = %O", data);
									//Compile a list of the distinct sections found and key them by section.

									vm.accurateTicketCounterThroughput = data.where(function(d) { return d.Location == "TicketCounter" }).sum(function(d) { return d.BagCount });
									if (vm.chartPie) {
										vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });
									} else {
										$interval(function () {
											vm.accurateTicketCounterThroughput = vm.data.where(function(d) { return d.Location == "TicketCounter" });
												vm.chartPie.setTitle({ text: utilityService.FormatNumberWithCommas(vm.accurateTicketCounterThroughput) + ' Bags' });

											},200,20);
									}
								});


					}


				

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							SetChartSizePie(vm.widget.Id, vm.chartPie);
							SetChartSizeBar(vm.widget.Id, vm.chartBar);
						}
					});



				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/ticketCounterThroughput.html?" + Date.now(),
					scope: {

						dashboard: "=",
						widget: "=",
						signalUpdateFunction: "&",
						setPanelHeadingColorFunction: "&",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
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

(function () {

	var app = angular.module('app');

	app.directive('companies',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location", "$q",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location, $q) {

				var controller = function ($scope) {
					var vm = this;


					//Entity Specific Code
					console.log("Global object = %O", Global);

					vm.entityName = "Company";
					vm.entityCollectionName = "Companies";
					vm.focusFieldName = 'Name';
					console.log(vm.entityCollectionName + " Controller invoked");


					function getNewEntity() {
						return {
							Name: '',
							Description: ''
						}
					}

					function mapEditModelToEntity() {
						if (vm.editModel.Id > 0) {
							vm.entity.Id = vm.editModel.Id;
						}
						vm.entity.Name = vm.editModel.Name;
						vm.entity.ShortName = vm.editModel.ShortName;
						vm.entity.Description = vm.editModel.Description;
						vm.entity.Address = vm.editModel.Address;
					}

					/////////////////////////////////////////////
					//Generic Code Below
					////////////////////////////////////////////


					console.log(vm.entityCollectionName + " 1");

					hotkeys.bindTo($scope)
						.add({
							combo: 'ctrl+s',
							description: 'Save and Close any form data input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								event.preventDefault();
								vm.saveEntity();
							}
						})
						.add({
							combo: 'esc',
							description: 'Cancel and close any input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								vm.entity = null;
								vm.showEditPane = false;
							}
						});

					function setFocusToTheSpecifiedField() {
						$timeout(function () {
							$("#" + vm.widget.Id + '-' + vm.entityName + '-' + vm.focusFieldName).focus();
						}, 50);
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						headingPlusButton: true,
						headingPlusButtonTitle: 'Add New ' + vm.entityName,
						addEntityFunction: function () {
							vm.add();
						},
						headingSearchField: true
					}


					//$interval(function() {
					//	console.log("search text = %O", vm.widget.searchText);
					//}, 1000);
					dataService.GetJBTData().then(function (data) {
						vm.JBTData = data;
					});


					vm.delete = function (entity) {


						var cacheCompany = vm.JBTData.Companies.first(function (c) { return c.Id == entity.Id });
						console.log("cacheCompany = %O", cacheCompany);

						if (
								vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id }) ||
								vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id }) ||
								cacheCompany.Sites.length > 0

							) {

							var alertifyMessage = "<strong>Company cannot be deleted!</strong><br><br>";

							if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Assets associated with it!<br>";
							}

							if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Systems associated with it!<br>";
							}

							if (cacheCompany.Sites.length > 0) {
								alertifyMessage += "It still has Sites associated with it!";
							}

							alertify.set({
								labels: {
									ok: "Ok",
									cancel: "Cancel, I don't want to do this"
								},
								buttonFocus: "cancel"
							});

							alertify.alert(alertifyMessage, function (e) {
								toastr.success(location.Name, "Company was NOT deleted!");
								return;
							}
							);

							return;

						}

						alertify.set({
							labels: {
								ok: "Yes, Delete the " + vm.entityName,
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to delete this ' + vm.entityName + '? ';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " Delete", entity);
								dataService.DeleteEntity(vm.entityCollectionName, entity);
								toastr.success(location.Name, vm.entityName + " was deleted!");

							} else {
								// user clicked "no"
								toastr.info(location.Name, vm.entityName + " was NOT deleted!");
							}
						});
					}



					vm.add = function () {

						vm.editModel = getNewEntity();
						vm.entity = angular.copy(vm.editModel);
						vm.editPanelTitle = 'New ' + vm.entityName;
						vm.showEditPane = true;
						setFocusToTheSpecifiedField();

					}

					vm.cancelSaveEntity = function () {
						vm.entity = null;
						vm.editModel = null;
						vm.widget.WidgetResource.DefaultIdSelectedForEdit = 0;
						SaveWidgetResourceObjectIfChanged();
						vm.showEditPane = false;
					}

					vm.selectEntity = function (entity) {
						if (entity) {
							if (!vm.editModel || (vm.editModel && vm.editModel.Id != entity.Id)) {

								console.log("Selected entity to edit = %O", entity);
								vm.editModel = angular.copy(entity);

								vm.editModel.associatedSiteIds = [];

								entity.SiteCompanies.forEach(function (sc) {
									vm.editModel.associatedSiteIds[sc.Site.Id] = true;
								});


								console.log("vm.editModel = %O", vm.editModel);

								vm.entity = entity;
								vm.widget.WidgetResource.DefaultIdSelectedForEdit = entity.Id;
								SaveWidgetResourceObjectIfChanged();
								vm.editPanelTitle = 'Editing ' + vm.entityName;
								vm.showEditPane = true;
								setFocusToTheSpecifiedField();
								console.log("vm.entity = %O", vm.entity);
							}
						}

					}

					vm.saveEntity = function () {

						var associatedSiteIdObjects = [];


						vm.editModel.associatedSiteIds.forEach(function (enabled, siteId) {
							associatedSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
						});


						mapEditModelToEntity();


						//If this is an existing entity, go and get a fresh copy without the SiteCompanies attached.
						if (vm.entity.Id) {



						}

						console.log("Company to save = %O", vm.editModel);

						(vm.editModel.Id ? dataService.GetEntityById(vm.entityCollectionName, vm.entity.Id).then(function (existingEntity) {
							existingEntity.Name = vm.editModel.Name;
							existingEntity.ShortName = vm.editModel.ShortName;
							existingEntity.Description = vm.editModel.Description;
							existingEntity.Address = vm.editModel.Address;
							return existingEntity.$save();

						}) : dataService.AddEntity(vm.entityCollectionName, vm.editModel)).then(
							function (entityFromSave) {

								vm.entityFromSave = entityFromSave;
								console.log("entity returned from the save operation = %O", entityFromSave);
								$q.all(
									//All Sites that are present in the company already associated set, that are not present in the enabled sites list in the company, as delete promise set.
										vm.entity
										.SiteCompanies
										.where(function (sc) { return !vm.editModel.associatedSiteIds[sc.SiteId] })
										.select(function (scToRemoveFromCompany) {

											console.log("Site Company to remove from Company entity = %O", scToRemoveFromCompany);
											return dataService.GetIOPSResource("SiteCompanies")
												.filter("CompanyId", vm.entity.Id)
												.filter("SiteId", scToRemoveFromCompany.SiteId)
												.query().$promise.then(function (data) {

													var scToDelete = data.first();
													scToDelete.Id = -scToDelete.Id;

													return scToDelete.$save();
												});


										})
									.concat(
											associatedSiteIdObjects
											.where(function (en) {
												return en.Enabled && !vm.entity.SiteCompanies.any(function (sc) { return sc.SiteId == en.SiteId });
											})
											.select(function (scToInsert) {

												console.log("Site Company to add to Company entity = %O", scToInsert);
												return dataService.AddEntity("SiteCompanies",
													{
														SiteId: scToInsert.SiteId,
														CompanyId: vm.entity.Id
													});
											})
										)
								).then(function () {


									signalR.SignalAllClientsInGroup("Admin", vm.entityName + (vm.editModel.Id ? " Update" : " Add"), entityFromSave);
									vm.showEditPane = false;
									vm.entity = null;
									vm.editModel = null;

								});


							});
					}


					$scope.$on(vm.entityName + " Add", function (event, newEntity) {
						console.log(vm.entityName + ' Add Event. New Entity = %O', newEntity);
						vm.entities.push(newEntity);
						vm.entities = vm.entities.orderBy(function (e) { return e.Name });
					});

					$scope.$on(vm.entityName + " Update", function (event, updatedEntity) {
						console.log(vm.entityName + ' Update Event. Updated Entity = %O', updatedEntity);


						//Get the company with all of the attached SiteCompany entities for another edit.
						dataService.GetIOPSResource(vm.entityCollectionName)
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.filter("Id", updatedEntity.Id)
							.query()
							.$promise
							.then(function (data) {
								var updatedEntityFromDB = data.first();

								console.log("Updated entity retrieved from DB = %O", updatedEntityFromDB);

								vm.entities = [updatedEntityFromDB].concat(vm.entities).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (e) { return e.Name });

								console.log("New entities collection = %O", vm.entities);

								if (updatedEntityFromDB.Id == (vm.editModel ? vm.editModel.Id : 0)) {

									vm.editModel = angular.copy(updatedEntityFromDB);
									vm.editModel.associatedSiteIds = [];

									updatedEntityFromDB.SiteCompanies.forEach(function (sc) {
										vm.editModel.associatedSiteIds[sc.Site.Id] = true;
									});
								}

							});

					});

					$scope.$on(vm.entityName + " Delete", function (event, deletedEntity) {
						console.log(vm.entityName + ' Delete Event. Deleted Entity = %O', deletedEntity);
						console.log("vm.entities = %O", vm.entities);
						vm.entities = vm.entities.where(function (e) { return e.Id != deletedEntity.Id });
					});

					$scope.$watch("vm.editModel",
						function (newValue, oldValue) {
							if ((oldValue || '') != (newValue || '')) {
								console.log("$scope.$watch vm.editModel change triggered");
								console.log("Old Value = %O", oldValue);
								console.log("New Value = %O", oldValue);
								//If any of the entities have an Id attribute, then this is editing an existing value.
								//send the changes to all other browsers as they press the keys.
								if (newValue && newValue.Id) {
									console.log("vm.editModelChanged. newValue = %O", newValue);

									signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", { editModel: vm.editModel, widgetId: vm.widget.Id });
								}
							}
						});

					$scope.$watch("vm.widget.WidgetResource",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

					$scope.$on(vm.entityName + " EditModel Modification", function (event, modifiedEntityObject) {
						if (modifiedEntityObject) {

							console.log(vm.entityName + ' Edit Model Modification. Modified Entity = %O', modifiedEntityObject);

							//Only if it is the same entity that we are editing and it came from another widget somewhere in the system.
							if (modifiedEntityObject.editModel.Id == (vm.editModel ? vm.editModel.Id : 0) && modifiedEntityObject.widgetId != vm.widget.Id) {
								vm.editModel = modifiedEntityObject.editModel;
								console.log("vm.editModel reassigned from event. editModel now = %O", vm.editModel);
							}
						}
					});

					$scope.$on(vm.widget.Id + " SearchText Modification", function (event, newSearchText) {
						vm.widget.searchText = newSearchText;
					});



					vm.showWidget = true;

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							console.log("Saving widget resource........");
							console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
					SaveWidgetResourceObjectIfChanged();

					vm.bootstrapLabelColumns = 3;
					vm.bootstrapInputColumns = 9;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					console.log("Initial vm.widget = %O", vm.widget);


					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}

					//***G
					//++Get the Data
					//---G
					function GetData() {

						console.log("Entry into " + vm.entityCollectionName + " GetData()");


						dataService.GetIOPSResource("Companies")
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.query()
							.$promise
							.then(function (data) {

								console.log("Companies Data = %O", data);


								vm.entities = data.orderBy(function (e) { return e.Name });

								$timeout(function () {
									SetTabBodyHeight(5);
									SetupSplitter();
									vm.showEntities = true;
									vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
									if ((vm.widget.WidgetResource.DefaultIdSelectedForEdit || 0) > 0) {
										vm.selectEntity(vm.entities.first(function (e) {
											return e.Id == vm.widget.WidgetResource.DefaultIdSelectedForEdit;
										}));
									}
								}, 50);


							});


					}
					//***G

					console.log(vm.entityCollectionName + " 3");

					GetData();

					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								heightToSet = widgetDimensions.height - 3;

								//console.log("Height to set = " + heightToSet);
								$("#containerdata" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#container-edit" + vm.widget.Id).css('height', heightToSet - 20);
								$("#widget-edit-pane-panel-body" + vm.widget.Id).css('height', heightToSet - 20);
								$("#edit-pane-backdrop" + vm.widget.Id).css('height', heightToSet - 20);
							}

						}, 50, repeatCount || 1);
					}





					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerEdit' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage || 50, vm.widget.WidgetResource.SplitRightPercentage || 50],
											minSize: 0,
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

												SaveWidgetResourceObjectIfChanged();
											},

										});
									vm.splitterIsSetup = true;
								});


							});

						}


					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});




					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/adminMaintenance/companies.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('modules',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location) {

				var controller = function ($scope) {
					var vm = this;


					//Entity Specific Code

					vm.entityName = "Module";
					vm.entityCollectionName = "Modules";
					vm.focusFieldName = 'Mnemonic';
					console.log(vm.entityCollectionName + " Controller invoked");

					vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
					vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
					vm.columnHideWidth1 = 600;
					vm.columnHideWidth2 = 600;

					/////////////////////////////////////////////
					//Generic Code Below
					////////////////////////////////////////////


					console.log(vm.entityCollectionName + " 1");

					hotkeys.bindTo($scope)
						.add({
							combo: 'ctrl+s',
							description: 'Save and Close any form data input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								event.preventDefault();
								vm.saveEntity();
							}
						})
						.add({
							combo: 'esc',
							description: 'Cancel and close any input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								vm.entity = null;
								vm.showEditPane = false;
							}
						});

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						headingPlusButton: true,
						headingPlusButtonTitle: 'Add New ' + vm.entityName,
						addEntityFunction: function () {
							vm.add();
						},
						headingSearchField: true
					}

					vm.add = function () {

						vm.entity = vm.editModel = getNewEntity();
						vm.editPanelTitle = 'New ' + vm.entityName;
						vm.showEditPane = true;
						setFocusToTheSpecifiedField();

					}

					//$interval(function() {
					//	console.log("search text = %O", vm.widget.searchText);
					//}, 1000);

					//***G
					//++Data Input/Output
					//***G

					//---B
					function GetData() {

						console.log("Entry into " + vm.entityCollectionName + " GetData()");

						dataService.GetIOPSResource(vm.entityCollectionName)
							.expandPredicate("CreatorUser")
								.expand("Person")
							.finish()
							.expandPredicate("LastModifiedUser")
								.expand("Person")
							.finish()
							.orderBy("Name")
							.query()
							.$promise
							.then(function (data) {

								vm.entities = data;
								console.log(data);
								$timeout(function () {
									SetTabBodyHeight(5);
									SetupSplitter();
									vm.showEntities = true;
									vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
									if ((vm.widget.WidgetResource.DefaultIdSelectedForEdit || 0) > 0) {
										vm.selectEntity(vm.entities.first(function (e) {
											return e.Id == vm.widget.WidgetResource.DefaultIdSelectedForEdit;
										}));
									}
								}, 50);
							});
					}

					//---B
					vm.saveEntity = function () {

						console.log("saveEntity() - vm.editModel = %O", vm.editModel);

						mapEditModelToEntity();

						(vm.editModel.Id ? dataService.GetEntityById(vm.entityCollectionName, vm.entity.Id).then(function (existingEntity) {

							existingEntity.Name = vm.editModel.Name;
							existingEntity.Mnemonic = vm.editModel.Mnemonic;
							existingEntity.Description = vm.editModel.Description;
							existingEntity.LastModifiedUserId = Global.User.Id;
							existingEntity.LastModifiedDate = utilityService.GetOdataUpdateableCurrentDateTime();

							return existingEntity.$save();

						}) : dataService.AddEntity(vm.entityCollectionName, vm.editModel))
							.then(
								function (entityFromSave) {

									vm.entity = null;
									signalR.SignalAllClientsInGroup("Admin", vm.entityName + (vm.editModel.Id ? " Update" : " Add"), entityFromSave);
									vm.showEditPane = false;

								});
					}

					//---B
					function getNewEntity() {
						return {
							Name: '',
							Description: '',
							Mnemonic: '',
							CreationDate: utilityService.GetOdataUpdateableCurrentDateTime(),
							CreatorUserId: Global.User.Id
						}
					}

					//---B
					function mapEditModelToEntity() {
						vm.entity.Mnemonic = vm.editModel.Mnemonic;
						vm.entity.Name = vm.editModel.Name;
						vm.entity.Description = vm.editModel.Description;
						if (vm.entity.Id) {
							vm.entity.LastModifiedUserId = Global.User.Id;
							vm.entity.LastModifiedDate = utilityService.GetOdataUpdateableCurrentDateTime();
						} else {
							vm.entity.CreatorUserId = Global.User.Id;
							vm.entity.CreationDate = utilityService.GetOdataUpdateableCurrentDateTime();
							
						}
					}


					//---B
					function getEntityByIdFromDBAndMergeToEntities(id) {
						//Go and get the expanded entity from the database
						dataService.GetIOPSResource(vm.entityCollectionName)
							.filter("Id", id)
							.expandPredicate("CreatorUser")
							.expand("Person")
							.finish()
							.expandPredicate("LastModifiedUser")
							.expand("Person")
							.finish()
							.query()
							.$promise
							.then(function (data) {


								console.log("Data from odata expansion = %O", data);

								var updatedEntityFromDB = data.first();

								console.log("Updated entity from db = %O", updatedEntityFromDB);

								vm.entities = [updatedEntityFromDB].concat(vm.entities).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function(e){ return e.Name});
								if (updatedEntityFromDB.Id == (vm.editModel ? vm.editModel.Id : 0)) {
									vm.editModel = angular.copy(updatedEntityFromDB);
								}

							});
						
					}

					//---B
					vm.delete = function (entity) {



						alertify.set({
							labels: {
								ok: "Yes, Delete the " + vm.entityName,
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});

						var message = 'Are you SURE you want to delete this ' + vm.entityName + '? ';

						alertify.confirm(message, function (e) {
							if (e) {

								//+User clicked "ok"

								//If the entity to be deleted is the same as the one selected for edit, then clear the edit screen.
								if (entity.Id == vm.entity.Id) {
									vm.entity = null;
									vm.editModel = null;
									vm.showEditPane = false;
								}
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " Delete", entity);
								dataService.DeleteEntity(vm.entityCollectionName, entity);
								toastr.success(location.Name, vm.entityName + " was deleted!");

							} else {
								// user clicked "no"
								toastr.info(location.Name, vm.entityName + " was NOT deleted!");
							}
						});
					}




					//***G







					//***G
					//++Events
					//---G


					//---B
					$scope.$on(vm.entityName + " Add", function (event, updatedEntity) {

						console.log(vm.entityName + ' Add Event. New Entity = %O', updatedEntity);
						getEntityByIdFromDBAndMergeToEntities(updatedEntity.Id);

					});

					//---B
					//---B
					$scope.$on(vm.entityName + " Update", function (event, updatedEntity) {

						console.log(vm.entityName + ' Update Event. Updated Entity = %O', updatedEntity);
						getEntityByIdFromDBAndMergeToEntities(updatedEntity.Id);

					});

					//---B
					$scope.$on(vm.entityName + " Delete", function (event, deletedEntity) {
						console.log(vm.entityName + ' Delete Event. Deleted Entity = %O', deletedEntity);
						console.log("vm.entities = %O", vm.entities);
						vm.entities = vm.entities.where(function (e) { return e.Id != deletedEntity.Id });
					});


					//---B
					$scope.$watch("vm.editModel",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					//---B
					$scope.$watch("vm.widget.WidgetResource",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					//---B
					//---B
					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

					//---B
					$scope.$on(vm.entityName + " EditModel Modification", function (event, modifiedEntity) {
						if (modifiedEntity) {

							console.log(vm.entityName + ' Edit Model Modification. Modified Entity = %O', modifiedEntity);
							if (modifiedEntity.Id == (vm.editModel ? vm.editModel.Id : 0)) {
								vm.editModel = modifiedEntity;
							}
						}
					});

					//---B
					$scope.$on(vm.widget.Id + " SearchText Modification", function (event, newSearchText) {
						vm.widget.searchText = newSearchText;
					});

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					//---B
					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
								vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
								console.log("vm.listPaneWidth = " + vm.listPaneWidth);
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					//---B
					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});



					//***G



					vm.cancelSaveEntity = function () {
						vm.entity = null;
						vm.widget.WidgetResource.DefaultIdSelectedForEdit = 0;
						SaveWidgetResourceObjectIfChanged();
						vm.showEditPane = false;
					}

					vm.selectEntity = function (entity) {
						if (entity) {
							vm.editModel = angular.copy(entity);
							vm.entity = entity;
							vm.widget.WidgetResource.DefaultIdSelectedForEdit = entity.Id;
							SaveWidgetResourceObjectIfChanged();
							vm.editPanelTitle = 'Editing ' + vm.entityName;
							vm.showEditPane = true;
							setFocusToTheSpecifiedField();
							console.log("Selected Entity = %O", vm.editModel);
						}

					}

					function setFocusToTheSpecifiedField() {
						$timeout(function () {
							$("#" + vm.widget.Id + '-' + vm.entityName + '-' + vm.focusFieldName).focus();
						}, 50);
					}

					vm.showWidget = true;

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							console.log("Saving widget resource........");
							console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
					SaveWidgetResourceObjectIfChanged();

					vm.bootstrapLabelColumns = 3;
					vm.bootstrapInputColumns = 9;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					console.log("Initial vm.widget = %O", vm.widget);


					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);


					//---B
					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}

					GetData();

					//---B
					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								heightToSet = widgetDimensions.height - 3;

								//console.log("Height to set = " + heightToSet);
								$("#containerdata" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#container-edit" + vm.widget.Id).css('height', heightToSet - 20);
								$("#widget-edit-pane-panel-body" + vm.widget.Id).css('height', heightToSet - 20);
								$("#edit-pane-backdrop" + vm.widget.Id).css('height', heightToSet - 20);
							}

						}, 50, repeatCount || 1);
					}




					//---B
					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerEdit' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage || 50, vm.widget.WidgetResource.SplitRightPercentage || 50],
											minSize: 0,
											onDrag: function() {
												var sizes = vm.splitter.getSizes();
												if (vm.widgetDimensions.width == 0) {
													vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id)
												}
												vm.listPaneWidth = vm.widgetDimensions.width * (sizes[0] / 100);
												//console.log("vm.listPaneWidth = " + vm.listPaneWidth);

											},
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];
												if (vm.widgetDimensions.width == 0) {
													vm.widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id)
												}
												vm.listPaneWidth = vm.widgetDimensions.width * (vm.widget.WidgetResource.SplitLeftPercentage / 100);
												//console.log("vm.listPaneWidth = " + vm.listPaneWidth);

												SaveWidgetResourceObjectIfChanged();
											}
										});
									vm.splitterIsSetup = true;
								});
							});
						}
					}


					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});


				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/adminMaintenance/modules.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
(function () {

	var app = angular.module('app');

	app.directive('people',
		[
			"$rootScope", "dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "uibButtonConfig", "$location", "$q",

			function ($rootScope, dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, uibButtonConfig, $location, $q) {

				var controller = function ($scope) {
					var vm = this;


					//Entity Specific Code

					vm.entityName = "Company";
					vm.entityCollectionName = "Companies";
					vm.focusFieldName = 'Name';
					console.log(vm.entityCollectionName + " Controller invoked");


					function getNewEntity() {
						return {
							Name: '',
							Description: ''
						}
					}

					function mapEditModelToEntity() {
						if (vm.editModel.Id > 0) {
							vm.entity.Id = vm.editModel.Id;
						}
						vm.entity.Name = vm.editModel.Name;
						vm.entity.ShortName = vm.editModel.ShortName;
						vm.entity.Description = vm.editModel.Description;
						vm.entity.Address = vm.editModel.Address;
					}

					/////////////////////////////////////////////
					//Generic Code Below
					////////////////////////////////////////////


					console.log(vm.entityCollectionName + " 1");

					hotkeys.bindTo($scope)
						.add({
							combo: 'ctrl+s',
							description: 'Save and Close any form data input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								event.preventDefault();
								vm.saveEntity();
							}
						})
						.add({
							combo: 'esc',
							description: 'Cancel and close any input form',
							allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
							callback: function () {
								vm.entity = null;
								vm.showEditPane = false;
							}
						});

					function setFocusToTheSpecifiedField() {
						$timeout(function () {
							$("#" + vm.widget.Id + '-' + vm.entityName + '-' + vm.focusFieldName).focus();
						}, 50);
					}

					vm.widget.displaySettings = {
						headingBackground: 'linear-gradient(to bottom,#dedede, #fefefe)',
						headingExtraTitle: '',
						headingPlusButton: true,
						headingPlusButtonTitle: 'Add New ' + vm.entityName,
						addEntityFunction: function () {
							vm.add();
						},
						headingSearchField: true
					}


					//$interval(function() {
					//	console.log("search text = %O", vm.widget.searchText);
					//}, 1000);
					dataService.GetJBTData().then(function (data) {
						vm.JBTData = data;
					});


					vm.delete = function (entity) {


						var cacheCompany = vm.JBTData.Companies.first(function (c) { return c.Id == entity.Id });
						console.log("cacheCompany = %O", cacheCompany);

						if (
								vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id }) ||
								vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id }) ||
								cacheCompany.Sites.length > 0

							) {

							var alertifyMessage = "<strong>Company cannot be deleted!</strong><br><br>";

							if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Assets associated with it!<br>";
							}

							if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == entity.Id })) {
								alertifyMessage += "It still has Systems associated with it!<br>";
							}

							if (cacheCompany.Sites.length > 0) {
								alertifyMessage += "It still has Sites associated with it!";
							}

							alertify.set({
								labels: {
									ok: "Ok",
									cancel: "Cancel, I don't want to do this"
								},
								buttonFocus: "cancel"
							});

							alertify.alert(alertifyMessage, function (e) {
								toastr.success(location.Name, "Company was NOT deleted!");
								return;
							}
							);

							return;

						}

						alertify.set({
							labels: {
								ok: "Yes, Delete the " + vm.entityName,
								cancel: "Cancel, I don't want to do this"
							},
							buttonFocus: "cancel"
						});
						var message = 'Are you SURE you want to delete this ' + vm.entityName + '? ';

						alertify.confirm(message, function (e) {
							if (e) {
								// user clicked "ok"
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " Delete", entity);
								dataService.DeleteEntity(vm.entityCollectionName, entity);
								toastr.success(location.Name, vm.entityName + " was deleted!");

							} else {
								// user clicked "no"
								toastr.info(location.Name, vm.entityName + " was NOT deleted!");
							}
						});
					}



					vm.add = function () {

						vm.editModel = getNewEntity();
						vm.entity = angular.copy(vm.editModel);
						vm.editPanelTitle = 'New ' + vm.entityName;
						vm.showEditPane = true;
						setFocusToTheSpecifiedField();

					}

					vm.cancelSaveEntity = function () {
						vm.entity = null;
						vm.editModel = null;
						vm.widget.WidgetResource.DefaultIdSelectedForEdit = 0;
						SaveWidgetResourceObjectIfChanged();
						vm.showEditPane = false;
					}

					vm.selectEntity = function (entity) {
						if (entity) {
							if (!vm.editModel || (vm.editModel && vm.editModel.Id != entity.Id)) {

								console.log("Selected entity to edit = %O", entity);
								vm.editModel = angular.copy(entity);

								vm.editModel.associatedSiteIds = [];

								entity.SiteCompanies.forEach(function (sc) {
									vm.editModel.associatedSiteIds[sc.Site.Id] = true;
								});


								console.log("vm.editModel = %O", vm.editModel);

								vm.entity = entity;
								vm.widget.WidgetResource.DefaultIdSelectedForEdit = entity.Id;
								SaveWidgetResourceObjectIfChanged();
								vm.editPanelTitle = 'Editing ' + vm.entityName;
								vm.showEditPane = true;
								setFocusToTheSpecifiedField();
								console.log("vm.entity = %O", vm.entity);
							}
						}

					}

					vm.saveEntity = function () {

						var associatedSiteIdObjects = [];


						vm.editModel.associatedSiteIds.forEach(function (enabled, siteId) {
							associatedSiteIdObjects.push({ SiteId: siteId, Enabled: enabled });
						});


						mapEditModelToEntity();


						//If this is an existing entity, go and get a fresh copy without the SiteCompanies attached.
						if (vm.entity.Id) {



						}

						console.log("Company to save = %O", vm.editModel);

						(vm.editModel.Id ? dataService.GetEntityById(vm.entityCollectionName, vm.entity.Id).then(function (existingEntity) {
							existingEntity.Name = vm.editModel.Name;
							existingEntity.ShortName = vm.editModel.ShortName;
							existingEntity.Description = vm.editModel.Description;
							existingEntity.Address = vm.editModel.Address;
							return existingEntity.$save();

						}) : dataService.AddEntity(vm.entityCollectionName, vm.editModel)).then(
							function (entityFromSave) {

								vm.entityFromSave = entityFromSave;
								console.log("entity returned from the save operation = %O", entityFromSave);
								$q.all(
									//All Sites that are present in the company already associated set, that are not present in the enabled sites list in the company, as delete promise set.
										vm.entity
										.SiteCompanies
										.where(function (sc) { return !vm.editModel.associatedSiteIds[sc.SiteId] })
										.select(function (scToRemoveFromCompany) {

											console.log("Site Company to remove from Company entity = %O", scToRemoveFromCompany);
											return dataService.GetIOPSResource("SiteCompanies")
												.filter("CompanyId", vm.entity.Id)
												.filter("SiteId", scToRemoveFromCompany.SiteId)
												.query().$promise.then(function (data) {

													var scToDelete = data.first();
													scToDelete.Id = -scToDelete.Id;

													return scToDelete.$save();
												});


										})
									.concat(
											associatedSiteIdObjects
											.where(function (en) {
												return en.Enabled && !vm.entity.SiteCompanies.any(function (sc) { return sc.SiteId == en.SiteId });
											})
											.select(function (scToInsert) {

												console.log("Site Company to add to Company entity = %O", scToInsert);
												return dataService.AddEntity("SiteCompanies",
													{
														SiteId: scToInsert.SiteId,
														CompanyId: vm.entity.Id
													});
											})
										)
								).then(function () {


									signalR.SignalAllClientsInGroup("Admin", vm.entityName + (vm.editModel.Id ? " Update" : " Add"), entityFromSave);
									vm.showEditPane = false;
									vm.entity = null;
									vm.editModel = null;

								});


							});
					}


					$scope.$on(vm.entityName + " Add", function (event, newEntity) {
						console.log(vm.entityName + ' Add Event. New Entity = %O', newEntity);
						vm.entities.push(newEntity);
						vm.entities = vm.entities.orderBy(function (e) { return e.Name });
					});

					$scope.$on(vm.entityName + " Update", function (event, updatedEntity) {
						console.log(vm.entityName + ' Update Event. Updated Entity = %O', updatedEntity);


						//Get the company with all of the attached SiteCompany entities for another edit.
						dataService.GetIOPSResource(vm.entityCollectionName)
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.filter("Id", updatedEntity.Id)
							.query()
							.$promise
							.then(function (data) {
								var updatedEntityFromDB = data.first();

								console.log("Updated entity retrieved from DB = %O", updatedEntityFromDB);

								vm.entities = [updatedEntityFromDB].concat(vm.entities).distinct(function (a, b) { return a.Id == b.Id }).orderBy(function (e) { return e.Name });

								console.log("New entities collection = %O", vm.entities);

								if (updatedEntityFromDB.Id == (vm.editModel ? vm.editModel.Id : 0)) {

									vm.editModel = angular.copy(updatedEntityFromDB);
									vm.editModel.associatedSiteIds = [];

									updatedEntityFromDB.SiteCompanies.forEach(function (sc) {
										vm.editModel.associatedSiteIds[sc.Site.Id] = true;
									});
								}

							});

					});

					$scope.$on(vm.entityName + " Delete", function (event, deletedEntity) {
						console.log(vm.entityName + ' Delete Event. Deleted Entity = %O', deletedEntity);
						console.log("vm.entities = %O", vm.entities);
						vm.entities = vm.entities.where(function (e) { return e.Id != deletedEntity.Id });
					});

					$scope.$watch("vm.editModel",
						function (newValue, oldValue) {
							if ((oldValue || '') != (newValue || '')) {
								console.log("$scope.$watch vm.editModel change triggered");
								console.log("Old Value = %O", oldValue);
								console.log("New Value = %O", oldValue);
								//If any of the entities have an Id attribute, then this is editing an existing value.
								//send the changes to all other browsers as they press the keys.
								if (newValue && newValue.Id) {
									console.log("vm.editModelChanged. newValue = %O", newValue);

									signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", { editModel: vm.editModel, widgetId: vm.widget.Id });
								}
							}
						});

					$scope.$watch("vm.widget.WidgetResource",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if (newValue && newValue.Id) {
								signalR.SignalAllClientsInGroup("Admin", vm.entityName + " EditModel Modification", vm.editModel);
							}
						});

					$scope.$watch("vm.widget.searchText",
						function (newValue, oldValue) {

							//If any of the entities have an Id attribute, then this is editing an existing value.
							//send the changes to all other browsers as they press the keys.
							if ((oldValue || '') != (newValue || '')) {
								console.log("searchText change = Old = " + oldValue + " New = " + newValue);
								vm.widget.WidgetResource.DefaultSearchText = newValue;
								SaveWidgetResourceObjectIfChanged();
								signalR.SignalAllClientsInGroup("Admin", vm.widget.Id + " SearchText Modification", vm.widget.searchText);
							}
						});

					$scope.$on(vm.entityName + " EditModel Modification", function (event, modifiedEntityObject) {
						if (modifiedEntityObject) {

							console.log(vm.entityName + ' Edit Model Modification. Modified Entity = %O', modifiedEntityObject);

							//Only if it is the same entity that we are editing and it came from another widget somewhere in the system.
							if (modifiedEntityObject.editModel.Id == (vm.editModel ? vm.editModel.Id : 0) && modifiedEntityObject.widgetId != vm.widget.Id) {
								vm.editModel = modifiedEntityObject.editModel;
								console.log("vm.editModel reassigned from event. editModel now = %O", vm.editModel);
							}
						}
					});

					$scope.$on(vm.widget.Id + " SearchText Modification", function (event, newSearchText) {
						vm.widget.searchText = newSearchText;
					});



					vm.showWidget = true;

					vm.originalWidgetResource = angular.copy(vm.widget.WidgetResource);

					function SaveWidgetResourceObjectIfChanged() {
						var possiblyChangedResource = angular.copy(vm.widget.WidgetResource);
						//console.log("Changed Widget Resource = %O", possiblyChangedResource);
						//console.log("Original widget resource = %O", vm.originalWidgetResource);
						if (!angular.equals(vm.originalWidgetResource, possiblyChangedResource)) {

							console.log("Saving widget resource........");
							console.log("Original WidgetResource = %O", vm.originalWidgetResource);
							console.log("Changed WidgetResource = %O", possiblyChangedResource);
							vm.widget.WidgetResource.$save();
							vm.originalWidgetResource = possiblyChangedResource;
						}
					}

					vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
					SaveWidgetResourceObjectIfChanged();

					vm.bootstrapLabelColumns = 3;
					vm.bootstrapInputColumns = 9;
					uibButtonConfig.activeClass = 'radio-active';

					//Get a copy of the user record to determine privs
					vm.user = Global.User;
					console.log("Initial vm.widget = %O", vm.widget);


					displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

					vm.SetSortField = function (fieldName) {
						var t0 = performance.now();

						if (vm.widget.displaySettings.tagDataSortField.substr(1, 50) == fieldName || vm.widget.displaySettings.tagDataSortField == fieldName) {
							if (vm.widget.displaySettings.tagDataSortField.substr(0, 1) == "-") {
								vm.widget.displaySettings.tagDataSortField = fieldName;


							} else {
								vm.widget.displaySettings.tagDataSortField = "-" + fieldName;

							}
						} else {
							vm.widget.displaySettings.tagDataSortField = fieldName;
						}
					}

					//***G
					//++Get the Data
					//---G
					function GetData() {

						console.log("Entry into " + vm.entityCollectionName + " GetData()");


						dataService.GetIOPSResource("Companies")
							.expandPredicate("SiteCompanies")
								.expand("Site")
							.finish()
							.query()
							.$promise
							.then(function (data) {

								console.log("Companies Data = %O", data);


								vm.entities = data.orderBy(function (e) { return e.Name });

								$timeout(function () {
									SetTabBodyHeight(5);
									SetupSplitter();
									vm.showEntities = true;
									vm.widget.searchText = vm.widget.WidgetResource.DefaultSearchText || '';
									if ((vm.widget.WidgetResource.DefaultIdSelectedForEdit || 0) > 0) {
										vm.selectEntity(vm.entities.first(function (e) {
											return e.Id == vm.widget.WidgetResource.DefaultIdSelectedForEdit;
										}));
									}
								}, 50);


							});


					}
					//***G

					console.log(vm.entityCollectionName + " 3");

					GetData();

					function SetTabBodyHeight(repeatCount) {
						$interval(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
							var widgetDimensions = displaySetupService.GetWidgetPanelBodyDimensions(vm.widget.Id);
							var heightToSet = 0;
							if (widgetDimensions) {

								heightToSet = widgetDimensions.height - 3;

								//console.log("Height to set = " + heightToSet);
								$("#containerdata" + vm.widget.Id).css('height', heightToSet);
								$("#repeater-container-data" + vm.widget.Id).css('height', heightToSet);
								$("#container-edit" + vm.widget.Id).css('height', heightToSet - 20);
								$("#widget-edit-pane-panel-body" + vm.widget.Id).css('height', heightToSet - 20);
								$("#edit-pane-backdrop" + vm.widget.Id).css('height', heightToSet - 20);
							}

						}, 50, repeatCount || 1);
					}





					vm.splitterIsSetup = false;
					function SetupSplitter() {
						if (!vm.splitterIsSetup) {
							$scope.$$postDigest(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								$scope.$$postDigest(function () {

									vm.widget.WidgetResource.SplitLeftPercentage = vm.widget.WidgetResource.SplitLeftPercentage || 50;
									vm.widget.WidgetResource.SplitRightPercentage = vm.widget.WidgetResource.SplitRightPercentage || 50;

									vm.splitter = Split(['#containerData' + vm.widget.Id, '#containerEdit' + vm.widget.Id],
										{
											elementStyle: function (dimension, size, gutterSize) {
												return {
													'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
												}
											},
											gutterStyle: function (dimension, gutterSize) {
												return {
													'flex-basis': gutterSize + 'px',
													'background-image': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')",
													'background-repeat': 'no-repeat',
													'background-position': '50%',
													'background-color': 'transparent',
													'cursor': 'col-resize'
												}
											},
											sizes: [vm.widget.WidgetResource.SplitLeftPercentage || 50, vm.widget.WidgetResource.SplitRightPercentage || 50],
											minSize: 0,
											onDragEnd: function () {

												var sizes = vm.splitter.getSizes();
												vm.widget.WidgetResource.SplitLeftPercentage = sizes[0];
												vm.widget.WidgetResource.SplitRightPercentage = sizes[1];

												SaveWidgetResourceObjectIfChanged();
											},

										});
									vm.splitterIsSetup = true;
								});


							});

						}


					}

					$scope.$on("WidgetResize", function (event, resizedWidgetId) {

						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
							SetTabBodyHeight(1);
						}
					});

					$scope.$on("WidgetResize.Stop", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							$timeout(function () {
								displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
								SetTabBodyHeight(1);

							}, 200);
						}
					});

					$scope.$on("ResizeVirtualScrollContainers", function () {
						//console.log("ResizeVirtualScrollContainers received");
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);
						SetTabBodyHeight(1);
					});




					vm.state = $state;

					$scope.$$postDigest(function () {
						displaySetupService.SetPanelBodyWithIdHeight(vm.widget.Id);

					});




				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/adminMaintenance/people.html?" + Date.now(),

					scope: {

						dashboard: "=",
						widget: "=",
						mode: "@"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
		]);

}());
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


		$scope.$on("$destroy",
			function () {
				console.log("Destroyed settings controller");
				$rootScope.$broadcast("ResizeVirtualScrollContainers", null);
			});


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
				console.log("AppCtrl authenticated event received. User = %O", user);
				vm.showMenu = securityService.showMenu;
			});


			vm.state = 'unauthorized';
			vm.signIn = function () {
				vm.state = 'authorized';
			};
		}
	]);

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


		$scope.$on("securityService:accessTokenInvalid", function (event, user) {
			console.log("LoginCtrl accessToken Invalid event received. User = %O", user);
			vm.currentUser = user;
			vm.ShowLoginPanel = true;


		});

		$scope.$on("securityService:authenticated", function (event, user) {
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

		$scope.$on("logout", function (event, user) {
			console.log("LoginCtrl logout event received");
			vm.username = "";
			vm.password = "";
			store.remove('currentUser');
			securityService.currentUser = null;
			top.location.href = "/";
			//$state.go('home');
			vm.isPanelVisible = true;
		});

		$scope.$on("securityService.invalidAccount", function (event, user) {
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


/// <reference path="area.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function AreasCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout) {
        console.log("AreasCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            company: 10,
            building: 10,
            name: 80
        };
        vm.buttonPanelWidth = 70;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();


        if ($stateParams.BuildingId) {

            vm.previousScreenName = "Buildings";
            vm.building = dataService.cache.buildings.first(function (b) { return b.Id == $stateParams.BuildingId });


        }



        //$scope.$on("dataService.cache.ready", function (event, course) {
        //    LoadData();

        //});

        //if (dataService.cache.ready || dataService.cache.areas.length > 1) {
        //    LoadData();
        //}

        function LoadData() {
            dataService.GetAreas().then(function (data) {
                vm.areas = data.where(function (a) {
                    return !$stateParams.BuildingId || a.BuildingId == $stateParams.BuildingId
                });

                $timeout(function () {
                    displaySetupService.SetPanelDimensions();
                });
                displaySetupService.SetPanelDimensions();
                console.log("vm.areas = %O", vm.areas);
            });
        }

        LoadData();

        //if (!vm.areas) {
        //    dataService.GetAreas().then(function (data) {
        //        vm.areas = data;
        //    });
        //}


        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }

    }

    angular
			.module("app")
			.controller("AreasCtrl", [
				"$scope",
				"$state",
                "$stateParams",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				AreasCtrl
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


/// <reference path="building.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function BuildingsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
        console.log("BuildingsCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            site: 25,
            name: 60
        };

        vm.buttonPanelWidth = 20;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();


        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready || dataService.cache.buildings.length > 1) {
            LoadData();
        }

        function LoadData() {
            vm.buildings = dataService.cache.buildings;
        }

        if (!vm.buildings) {
            dataService.GetBuildings().then(function(data) {
                vm.buildings = data;
            });
        }


        vm.delete = function (building) {

            //Go and get a "pure" copy of the building before deleting
            dataService.GetBuilding(building.Id).then(function (building) {
                alertify.set({
                    labels: {
                        ok: "Yes, Delete the Building",
                        cancel: "Cancel, I don't want to do this"
                    },
                    buttonFocus: "cancel"
                });
                var message = 'Are you SURE you want to delete this building? ';

                alertify.confirm(message, function (e) {
                    if (e) {
                        // user clicked "ok"
                        airport.$delete().then(function () {
                            signalR.SignalAllClients("Building Changed", null);

                        });



                        toastr.success(location.Name, "Building was deleted!");

                    } else {
                        // user clicked "no"
                        toastr.info(location.Name, "Building was NOT deleted!");
                    }
                });
            });

        }


        vm.save = function (building) {
            dataService.GetBuilding(building.Id).then(function (odataBuilding) {
                odataBuilding.$update().then(function () {
                    signalR.SignalAllClients("Building Changed", null);
                });

            });
        }

        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }


        //$scope.$on("Olli Location Changed", function (event, course) {
        //	LoadData();

        //});


    }

    angular
			.module("app")
			.controller("BuildingsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				BuildingsCtrl
			]);



})();
/// <reference path="asset.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function ChangingAssetsCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout) {
        console.log("ChangingAssetsCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {

            company: 10,
            gate: 6,
            name: 10,
            dataChange: 70,
            dataChangeCount: 15
        };

        vm.buttonPanelWidth = 20;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();

        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready) {
            LoadData();
        }

        function LoadData() {
            

            vm.assetInventory = dataService.cache.expandedAssets.select(function (d) {
                return {
                    data: d,
                    lastChange: '',
                    changeCounter: 0
                };
            });
            console.log("vm.assetInventory = %O", vm.assetInventory);
            $scope.$$postDigest(function () {
                displaySetupService.SetPanelDimensions();
            });


            $scope.$on("observation", function (event, signalRData) {


                //Split the change data out into the components
                signalRData = signalRData.split(",").last().split("|").select(function (item) {
                    return {
                        name: item.split("^").first(),
                        value: item.split("^").last()
                    };
                });

                //Find the row in the data array.
                //Get the asset id out of the dataItems
                var signalRAssetIdDataItem = signalRData.first(function (dataItem) { return dataItem.name == "AssetId" });
                var signalRAssetId = signalRAssetIdDataItem.value;

                var asset = vm.assetInventory.first(function (vmAsset) { return +vmAsset.data.Id == signalRAssetId });

                var changeDescription =
                    signalRData.first(function (dataItemRow) {
                        return dataItemRow.name == "Date";
                    }).value +
                        "  Tag:" +
                        signalRData.first(function (dataItemRow) {
                            return dataItemRow.name == "TagName";
                        }).value.trim() +
                        "  Value:" +
                        signalRData.first(function (dataItemRow) {
                            return dataItemRow.name == "Value";
                        }).value;



                if (asset) {
                    $scope.$apply(function () {
                        asset.changeCounter++;
                        asset.lastChange = changeDescription;
                        vm.assets = vm.assetInventory.where(function(a) { return a.dataChangeCount > 0 });
                    });
                }


            });




        }

        vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }




    }

    angular
			.module("app")
			.controller("ChangingAssetsCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
                "$timeout",
				ChangingAssetsCtrl
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


/// <reference path="gate.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
    "use strict";


    function GatesCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
        console.log("GatesCtrl conroller invoked.");
        var vm = this;


        vm.columnWidths = {
            name: 50,
            address: 50
        };

        vm.buttonPanelWidth = 70;

        vm.state = $state;
        displaySetupService.SetPanelDimensions();
        
        $scope.$on("dataService.cache.ready", function (event, course) {
            LoadData();

        });

        if (dataService.cache.ready || dataService.cache.gates.length > 1) {
            LoadData();
        }

        function LoadData() {
            vm.gates = dataService.cache.gates;
        }

        if (!vm.gates) {
            dataService.GetGates().then(function(data) {
                vm.gates = data;
            });
        }

       vm.scrolledToEnd = function () {
            console.log("scrolled to end");
        }


        //$scope.$on("Olli Location Changed", function (event, course) {
        //	LoadData();

        //});


    }

    angular
			.module("app")
			.controller("GatesCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				GatesCtrl
			]);



})();
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
												dataService.GetIOPSCollection("People", "Email", vm.user.Person.Email).then(function(odataPeople) {
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
					: dataService.AddEntity("iOPSUsers", { Id: 0, Username: vm.user.Username, PersonId: vm.odataPerson.Id, Active: true })).then(function(user) {
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


//++WidgetTypeEdit Controller
(function () {
	"use strict";


	function WidgetTypeEditCtrl($state, $rootScope, $scope, securityService, dataService, $stateParams, utilityService, $timeout, uibButtonConfig, hotkeys, $interval, displaySetupService, signalR, $q) {
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
			$q.all([
				dataService.GetEntityById("WidgetTypes", $stateParams.WidgetTypeId).then(function (data) { vm.widgetType = data }),
				dataService.GetIOPSCollection("WidgetTypeTabGroups").then(function (data) { vm.widgetTypeTabGroups = data })
			]).then(function () {
				vm.originalWidgetType = angular.copy(vm.widgetType);
				vm.panelTitle = "" + vm.widgetType.CategoryPath + " - " + vm.widgetType.Name;


				vm.isAvailableToAdmin = vm.widgetType.IsAvailableToAdmin ? 1 : 0;
				vm.isAvailableToAll = vm.widgetType.IsAvailableToAll ? 1 : 0;
				vm.hasSettings = vm.widgetType.HasSettings ? 1 : 0;
				vm.showScreen = true;
				console.log("widgetTypeEdit Controller = %O", vm);


				console.log("vm.widgetType = %O", vm.widgetType);

			});

			dataService.GetEntityById("WidgetTypes", $stateParams.WidgetTypeId).then(function (wt) {
				vm.widgetType = wt;
			});

		} else {
			vm.widgetType = {
				Id: 0,
				CategoryPath: vm.Path
			};
			dataService.GetIOPSCollection("WidgetTypeTabGroups").then(function (data) { vm.widgetTypeTabGroups = data })
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
			vm.widgetType.HasSettings = vm.hasSettings == 1 ? true : false;

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
			"$q",
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
			tabGroup: 15,
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
				dataService.GetIOPSResource("WidgetTypes")
					.filter("CategoryPath", $stateParams.Path)
					.expand("WidgetTypeTabGroup")
					.query().$promise
					.then(function (data) {
						vm.widgetTypes = data.orderBy(function (w) { return w.DevelopmentPriority });

						vm.showPanel = true;
					});


			}



		}


		GetData();


		//---G
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
				dataService.GetIOPSResource("WidgetTypes")
					.expand("WidgetTypeTabGroups")
					.then(function (dbWt) {
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
			console.log("Event WidgetType");
			GetData();

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

					for (i = -750; i <= 0; i += 1) {
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
						if (vm.searchText == '' || !vm.searchText) {
							return true;
						}


						return t.TagName.toUpperCase().indexOf(upperSearchText) >= 0 || t.Asset.ParentSystem.Name.toUpperCase().indexOf(upperSearchText) >= 0 || t.JBTStandardObservation.Name.toUpperCase().indexOf(upperSearchText) >= 0;
					})
					.orderByDescending(function (t) { return t.PLCUTCDateMS })
					.take(100);


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