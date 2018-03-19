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
