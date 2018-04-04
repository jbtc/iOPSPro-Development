(function () {

    var app = angular.module('app');

    app.directive('weather',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR", "$odata",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR, $odata) {

			    var controller = function ($scope) {
			        var vm = this;


			        console.log("Weather controller invoked. vm = %O", vm);
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
			            var userSiteCodes = Global.User.ReaderOf.where(function (s) {
			                return s.split('.')[0] == 'Site'

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

					        vm.widgetSite = vm.userSites.first(function (s) { return s.Id == vm.widget.WidgetResource.SiteId });
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
			        }, 120000);

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
			                            enabled: true
			                        }

			                    },
			                    

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
			        templateUrl: "app/widgetDirectives/weather.html?" + Date.now(),

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
