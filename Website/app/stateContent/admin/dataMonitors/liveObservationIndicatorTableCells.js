/// <reference path="tag.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/moment.min.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
/// <reference path="~/Scripts/Highstock-4.2.5/js/highstock-all.js" />
/// <reference path="~/Scripts/smoothie.js" />
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
                });


			vm.chartUpdateInterval = $interval(function () {
				//console.log("Updating Chart......");
				if (vm.chartSeries) {
					var x = (new Date()).getTime(), // current time
						y = dataService.Statistics.SignalR.MessagesPerSecond;
					vm.chartSeries.addPoint([x, y], true, true);
				}

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

			dataService.GetCompanies().then(function (data) {
				data.select(function (c) {
					if (!c.Tags) {
						c.Tags = c.Assets.selectMany(function (a) { return a.Tags });
					}
				});
				vm.companies = data.orderByDescending(function (c) { return c.Tags.length });
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

					for (i = -99; i <= 0; i += 1) {
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