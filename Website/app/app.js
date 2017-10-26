"use strict";


var odataServerUrl = document.URL.indexOf("localhost/iops/") > 0 ? "http://localhost/DataServices/ODataV4" : "https://www.iopspro.com/DataServices/ODataV4";

//var odataServerUrl = "https:/7.207.78.73/DataServices/ODataV4";
//var odataServerUrl = "http://localhost:48773";
var webRoot = document.URL.indexOf("localhost/iops/") > 0 ? "/iops/"
				: document.URL.indexOf("localhost/iOPSPro-Development") > 0 ? "/iOPSPro-Development/Website/" :
				"/";



var signalRServerUrl = "https://www.iopspro.com/DataServices/SignalR/signalr";
var Global = {
	odataServerUrl: "https://test.iopspro.com/DataServices/ODataV4",
	User: {},
	webRoot: "/"
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
						Widget: null //Pass the entire widget resource model as the parameter. The widget itself will invoke this state and pass it. It will ALWAYS be valued.
					},
					views: {
						'contentPane@home': {
							templateUrl: "app/stateContent/dashboards/widgetSettings.html?seq=" + Date.now(),
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
						assetId: null
					},
					views: {
						'contentPane@home.app.dashboard': {
							templateUrl: "app/widgetDirectives/pcaSummaryModal.html?seq=" + Date.now(),
							controller: "PCASummaryModalCtrl as vm"
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

  