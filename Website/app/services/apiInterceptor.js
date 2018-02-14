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
