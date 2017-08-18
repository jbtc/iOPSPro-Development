(function () {

	var app = angular.module('app');

	app.directive('ticketCounterThroughput',
		[
			"dataService", "utilityService", "$state", "hotkeys", "displaySetupService", "$timeout", "$window", "$interval", "signalR",

			function (dataService, utilityService, $state, hotkeys, displaySetupService, $timeout, $window, $interval, signalR) {

				var controller = function ($scope) {
					var vm = this;


					dataService.GetIOPSCollection("ViewBHS24HourTicketCounterThroughput").then(function (data) {
						vm.data = data;
						console.log("Data Load = %O", angular.copy(data));
						console.log("Initial Data = %O", angular.copy(vm.data.select(function (tc) {
							return [tc.TicketCounter, tc.BagCount];
						})));
						RenderChart();

					});




					function GetHighChartConfig() {
						return {
							chart: {
								type: 'column',
								renderTo: "containerTicketCounterThroughput"
							},
							animation: false,
							credits: { enabled: false },
							title: {
								text: 'BNA Ticket Counter Throughput - Last 24 Hours',
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
									text: 'Throuput (bags)'
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

					function GetCounts() {
						return [
						{
							name: 'Throughput',
							animation: false,



							data: vm.data.select(function (tc) {
								return [tc.TicketCounter, tc.BagCount];
							}),
							dataLabels: {
								enabled: true,
								rotation: -90,
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



					function RenderChart() {
						$(function () {

							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);

							//Render the chart
							$timeout(function () {
								vm.chart = new Highcharts.Chart(GetHighChartConfig());

							}, 50).then(function() {
								$interval(function() {
									
									displaySetupService.ResizeChart(vm.widget.Id, vm.chart);
									},
									50,
									10);
							});
						});
					}

					vm.updateInterval = $interval(function () {

						dataService.GetIOPSCollection("ViewBHS24HourTicketCounterThroughput").then(function (data) {
							vm.data = data;

							var chartData = vm.data.select(function (tc) {
								return [tc.TicketCounter, tc.BagCount];
							});
							vm.chart.series[0].setData(chartData);

						});
					}, 5000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.updateInterval);
					});


					$scope.$on("WidgetResize", function (event, resizedWidgetId) {
						if (vm.widget.Id == resizedWidgetId || resizedWidgetId == 0) {
							displaySetupService.ResizeChart(vm.widget.Id, vm.chart);
						}
					});

					//$scope.$on("BHS.DeviceLocationThroughput", function (event, data) {

					//	var jsonData = dataService.GetJsonFromSignalR(data);
					//	console.log("signalR Data = ", jsonData);

					//	//Find the data element in the vm.data array and update the count total.
					//	vm.data.where(function (d) { return d.TicketCounter == jsonData.MemberName }).forEach(function (d) {
					//		d.BagCount += +jsonData.BagThroughput;
					//	});

					//	var chartData = vm.data.select(function (tc) {
					//		return [tc.TicketCounter, tc.BagCount];
					//	});

					//	console.log("Updated data = %O", angular.copy(chartData));

					//	vm.chart.series[0].setData(chartData);

					//});


				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/ticketCounterThroughput.html?" + Date.now(),

					scope: {

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