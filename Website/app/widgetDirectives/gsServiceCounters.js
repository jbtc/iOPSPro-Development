(function () {

    var app = angular.module('app');

    app.directive('gsServiceCounters',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata","$q",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata,$q) {

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
			         
			            var stdObsIds = [3782, 13740, 4504, 3819, 12455, 12452, 12374, 3879, 3795, 3808, 4001, 4745, 4002, 4003, 12578, 4074, 4075, 3844, 3789, 3837, 3843, 3770,  3820, 14241,  14388];
			            var dataCollector = [];
			            dataService.GetIOPSResource("Tags")
                                                   .select(["Id", "JBTStandardObservationId", "JBTStandardObservationName"])
                                                   .filter("SiteId", vm.widget.WidgetResource.SiteId)
                                                   .filter("GateName", vm.GateSystem.Name)
			                                       .filter($odata.Predicate.or(stdObsIds.select(function (id)
			                                       { return new $odata.Predicate("JBTStandardObservationId", id) })))
                            .query().$promise.then(function(tags){
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
