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
			            
			          
			            dataService.GetIOPSWebAPIResource("GSEquipmentUsage_TVF_QueryRevised")
                               .query({
                                   beginDate: startDate,
                                   endDate: endDate,
                                   siteId: siteId,
                                   gate:'All'

                               }, function (data) {
                                   console.log("GSEquipmentUsage_TVF_QueryRevised initial data = %O", data);

                                   vm.totalPBBHours = data.sum(function (item) { return item.PBB_Total_Hours }).toFixed(2);
                                   vm.totalPCAHours = data.sum(function (item) { return item.PCA_Total_Hours }).toFixed(2);
                                   vm.totalGPUHours = data.sum(function (item) { return item.GPU_Total_Hours }).toFixed(2);
                                   vm.usagePBB = data.sum(function (item) { return item.PBB_Percent_Used }).toFixed(2);
                                   vm.usagePCA = data.sum(function (item) { return item.PCA_Percent_Used }).toFixed(2);
                                   vm.usageGPU = data.sum(function (item) { return item.GPU_Percent_Used }).toFixed(2);
                                   vm.PBBGatesPresent = data.sum(function (item) { return item.PBB_Asset_Present });
                                   vm.PCAGatesPresent = data.sum(function (item) { return item.PCA_Asset_Present });
                                   vm.GPUGatesPresent = data.sum(function (item) { return item.GPU_Asset_Present });
                                   vm.PBBGatesUsed = data.sum(function (item) { return item.PBB_Asset_In_Use });
                                   vm.PCAGatesUsed = data.sum(function (item) { return item.PCA_Asset_In_Use });
                                   vm.GPUGatesUsed = data.sum(function (item) { return item.GPU_Asset_In_Use });
                                 
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
			                chart.setSize((widgetBodyDimensions.width * .99), (widgetBodyDimensions.height * .60) - 10, false);
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
			                        y: parseFloat(vm.usagePBB)
			                    }]
			                   }, {
			                    name: 'GPU',
			                    data: [{
			                        color: Highcharts.getOptions().colors[7],
			                        radius: '87%',
			                        innerRadius: '63%',
			                        y: parseFloat(vm.usageGPU)
			                     }]
			                    }, {
			                    name: 'PCA',
			                    data: [{
			                        color: Highcharts.getOptions().colors[8],
			                        radius: '62%',
			                        innerRadius: '38%',
			                        y: parseFloat(vm.usagePCA)
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
