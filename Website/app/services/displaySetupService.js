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
