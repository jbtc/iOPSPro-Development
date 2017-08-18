/// <reference path="tag.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/moment.min.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
/// <reference path="~/Scripts/LINQ_JS.min.js" />
(function () {
	"use strict";


	function LiveAssetMonitorCtrl($scope, $state, displaySetupService, dataService, signalR, $interval, $timeout, utilityService, $window, $stateParams) {
		console.log("LiveAssetMonitorCtrl conroller invoked.");
		var vm = this;

		$scope.$on("dataService.ready", function (event, course) {
			Init();

		});

		if (dataService.IsReady()) {
			Init();
		}

		vm.state = $state;
		vm.dataService = dataService;
		displaySetupService.SetPanelDimensions();

		function Init() {
			console.log("Load Data");

			GetData();

			$scope.$$postDigest(function () {
				displaySetupService.SetPanelDimensions();
				$(window).bind('resize', function () {
					$('.grid').masonry({
						// options...
						itemSelector: '.grid-item',
						columnWidth: 615
					});
				});
				$window.dispatchEvent(new Event("resize"));
			});
		}


		vm.searchTerm = "";
		vm.iterationCount = 0;

		function GetData() {
			console.log("GetData() started");
			var time0 = performance.now();
			dataService.GetJBTData().then(function (data) {


				vm.data = data;
				vm.totalChangeCount = 0;

				//Only include tags whewre there is an observation in the last ten days.
				var cutoffDateTime = new Date();
				cutoffDateTime = cutoffDateTime.setDate(cutoffDateTime.getDate() - 10);

				var recentTags = data.Tags.where(function(tag) {
					return tag.LastObservationDate > cutoffDateTime;
				});


				data.Assets.forEach(function(asset) {
					asset.recentTags = recentTags.where(function(tag) { return tag.AssetId == asset.Id });
				});



				//Filter out the terminal systems
				var terminalSystems = data.Systems.where(function (s) { return s.Type == 'Terminal' })
					.select(function (t) {

						//attach gate references to the terminals even if they are buried one zone level down.
						t.gateSystems = t.Systems.where(function (s) { return s.Type == 'Gate' && s.ParentSystemId == t.Id })
							.concat(
								t.Systems.where(function (s2) { return s2.Type == 'Zone' && s2.ParentSystemId == t.Id })
								.selectMany(function (s2) {
									return s2.Systems;
								})
							);

						t.gateSystems.forEach(function(gs) {

							gs.assets = data.Assets.where(function(asset) { return asset.ParentSystemId == gs.Id });
						});

						return t;



					});





				//Knit the data collection together under sites.
				vm.sites = data.Sites
					.where(function (site) { return !$stateParams.SiteId || ($stateParams.SiteId == site.Id) })
					.select(function (site) {

						site.terminalSystems = terminalSystems.where(function (ts) { return ts.SiteId == site.Id });

					return site;
					})
				.where(function (site) { return site.terminalSystems.length > 0 })
				.where(function(site) { return site.Name != "BNA" });




				console.log("Data Formatting time = " + (performance.now() - time0));


			});
		}

	}

	angular
            .module("app")
            .controller("LiveAssetMonitorCtrl", ["$scope", "$state", "displaySetupService", "dataService", "signalR", "$interval", "$timeout", "utilityService", "$window", "$stateParams", LiveAssetMonitorCtrl
            ]);



})();