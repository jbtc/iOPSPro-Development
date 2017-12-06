/// <reference path="company.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
	"use strict";


	function DashboardCtrl($scope, $rootScope, $state, displaySetupService, dataService, signalR, $interval, $stateParams, $timeout, $q, uibButtonConfig) {
		console.log("DashboardCtrl conroller invoked. vm = %O", vm);
		var vm = this;



		uibButtonConfig.activeClass = 'radio-active';




		displaySetupService.SetPanelDimensions();



		vm.fullscreen = false;
		vm.screenSwitchClass = "static-panel";

		vm.ToggleFullScreen = function () {
			vm.fullscreen = !vm.fullscreen;
			if (vm.fullscreen) {
				vm.screenSwitchClass = "fullscreen-panel";

			} else {
				vm.screenSwitchClass = "static-panel";
			}
			$scope.$$postDigest(function () {
				$interval(function () {
					$rootScope.$broadcast("WidgetResize", 0);
					displaySetupService.SetPanelDimensions();
				}, 100, 10);
			});

		}

		$scope.$on("Dashboard", function (event, dashboard) {
			console.log("Event Dashboard = %O", dashboard);

			if (dashboard.Id == +$stateParams.DashboardId) {
				vm.dashboard = dashboard;
			}

		});




		dataService.GetEntityById("Dashboards", +$stateParams.DashboardId)
			.then(function (data) {
				vm.dashboard = data;
				console.log("vm.dashboard = %O", vm.dashboard);
			})
			.then(function () {
				dataService.GetDashboardTimeScopes().then(function (data) {
					vm.timeScopes = data;
					console.log("vm.timeScopes = %O", vm.timeScopes);
					
					//Figure out the date ranges and list it on the subtitle for the dashboard header.
					if (vm.dashboard.TimeScopeId) {
						var timeScope = vm.timeScopes.first(function (ts) { return ts.Id == vm.dashboard.TimeScopeId });
						vm.subTitle = timeScope.Description;
					} else {
						vm.subTitle = vm.dashboard.CustomStartDate + " to " + vm.dashboard.CustomEndDate;
					}
				});
			})
			.then(function () {
				dataService.GetIOPSResource("Widgets")
					.filter("ParentDashboardId", +$stateParams.DashboardId)
					.expand("WidgetType")
					.query()
					.$promise
					.then(function (widgets) {
						vm.widgets = widgets.select(function (w) {
							return {
								sizeX: w.Width,
								sizeY: w.Height,
								row: w.Row,
								col: w.Col,
								prevRow: w.Row,
								prevCol: w.Col,
								Id: w.Id,
								Name: w.Name,
								WidgetResource: w,
								HasChanged: false
							}
						});

						console.log("Widgets = %O", vm.widgets);
					});
			});








		$scope.$on("Widget", function (event, widget) {

			if (widget.ParentDashboardId == +$stateParams.DashboardId) {
				vm.widgets = [widget].select(function (w) {
					return {
						sizeX: w.Width,
						sizeY: w.Height,
						row: w.Row,
						col: w.Col,
						prevRow: w.Row,
						prevCol: w.Col,
						Id: w.Id,
						Name: w.Name,
						WidgetResource: w,
						HasChanged: false

					}

				})
				.concat(vm.widgets)
					.distinct(function (a, b) { return a.Id == b.Id });

			}

		});

		$scope.$on("Widget.Deleted", function (event, deletedWidget) {



			if (deletedWidget.ParentDashboardId == +$stateParams.DashboardId) {
				vm.widgets = vm.widgets.where(function (w) { return w.Id != deletedWidget.Id });

				//Set a timer half a second into the future that will save the possible new positions of all of the widgets left on the screen
				$timeout(function () {
					SaveAllChangedWidgets();
				},
					500);

			}

		});


		//The user might be in a specific dashboard, and then delete it via the menu. If we are in the one that was deleted then go back to home.
		$scope.$on("Dashboard.Deleted", function (event, deletedDashboard) {

			if (deletedDashboard.Id == +$stateParams.DashboardId) {
				//We are in a deleted dashboard! Get out
				$state.go("^");
			}
		});

		vm.deleteWidget = function (widget) {




			alertify.set({
				labels: {
					ok: 'Yes, Delete the "' + widget.Name + '" Widget',
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete the "' + widget.Name + '" widget from this dashboard? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"

					widget.WidgetResource.Id = -widget.WidgetResource.Id;
					widget.WidgetResource.$save().then(function () {
						widget.WidgetResource.Id = -widget.WidgetResource.Id;
						signalR.SignalAllClients("Widget.Deleted", widget.WidgetResource);
					});


				} else {
					// user clicked "no"
					toastr.info(widget.Name, "Widget was NOT deleted!");
				}
			});

		}




		vm.gridsterOpts = {
			columns: 60, // the width of the grid, in columns
			pushing: true, // whether to push other items out of the way on move or resize
			floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
			swapping: true, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
			width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
			colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
			rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
			margins: [10, 10], // the pixel distance between each widget
			outerMargin: true, // whether margins apply to outer edges of the grid
			sparse: true, // "true" can increase performance of dragging and resizing for big grid (e.g. 20x50)
			isMobile: false, // stacks the grid items if true
			mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
			mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
			minColumns: 1, // the minimum columns the grid must have
			minRows: 2, // the minimum height of the grid, in rows
			maxRows: 100,
			defaultSizeX: 2, // the default width of a gridster item, if not specifed
			defaultSizeY: 1, // the default height of a gridster item, if not specified
			minSizeX: 1, // minimum column width of an item
			maxSizeX: null, // maximum column width of an item
			minSizeY: 1, // minumum row height of an item
			maxSizeY: null, // maximum row height of an item
			resizable: {
				enabled: true,
				handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
				start: function (event, $element, widget) { }, // optional callback fired when resize is started,
				resize: function (event, $element, widget) {
					//console.log("resize:  event= %O", event);
					//console.log("resize:  $element= %O", $element);
					widget.HasChanged = true;
					displaySetupService.SetPanelBodyWithIdHeight(widget.Id);
					$rootScope.$broadcast("WidgetResize", widget.Id);


				},
				// optional callback fired when item is finished resizing
				stop: function (event, $element, widget) {
					$rootScope.$broadcast("WidgetResize", widget.Id);
					SaveWidget(widget);
				}
			},
			draggable: {
				enabled: true, // whether dragging items is supported
				handle: '.panel-heading', // optional selector for drag handle
				start: function (event, $element, widget) { }, // optional callback fired when drag is started,
				drag: function (event, $element, widget) { widget.HasChanged = true }, // optional callback fired when item is moved,
				stop: function (event, $element, widget) { SaveWidget(widget) } // optional callback fired when item is finished dragging
			}
		};


		vm.logWidget = function (widget) {
			console.log("Widget Clicked = %O", widget);
		}


		function SaveWidget(widget) {

			//If for some reason the widget resource is not a real one, then go get a real one.
			(widget.WidgetResource.$save
				? $q.when(widget.WidgetResource)
				: dataService.GetIOPSResource("Widgets").filter("Id", widget.Id).expand("WidgetType").query().$promise.then(function (data) {
					widget.WidgetResource = data;
					return widget.WidgetResource;
				})).then(function (data) {
					widget.WidgetResource = data;
					widget.WidgetResource.Row = widget.row;
					widget.WidgetResource.Col = widget.col;
					widget.prevCol = widget.col;
					widget.prevRow = widget.row;
					widget.WidgetResource.Width = widget.sizeX;
					widget.WidgetResource.Height = widget.sizeY;




					widget.WidgetResource.$save().then(function (widget1) {
						signalR.SignalAllClients("Widget", widget1);
					});

					//console.log("Changed Other widgets = %O",vm.widgets.where(function (w) { return (w.col != w.prevCol || w.row != w.prevRow) && w.Id != widget.Id }));


					//Save all the other widgets that have changed positions because of the other one moving. This is not captured by the gridster control
					vm.widgets.where(function (w) { return (w.col != w.prevCol || w.row != w.prevRow) && w.Id != widget.Id }).forEach(function (widget1) {
						widget1.WidgetResource.Row = widget1.row;
						widget1.WidgetResource.Col = widget1.col;
						widget1.prevCol = widget1.col;
						widget1.prevRow = widget1.row;

						widget1.WidgetResource.Width = widget1.sizeX;
						widget1.WidgetResource.Height = widget1.sizeY;

						widget1.WidgetResource.$save().then(function (widget2) {
							signalR.SignalAllClients("Widget", widget2);
						});
					});
				});
		}


		//vm.saveChangeInterval = $interval(function () {
		//	SaveAllChangedWidgets();
		//},
		//	1000);


		//$scope.$on("$destroy", function () {
		//	$interval.cancel(vm.saveChangeInterval);

		//});


		function SaveAllChangedWidgets() {

			vm.widgets.where(function (w) { return w.col != w.prevCol || w.row != w.prevRow }).forEach(function (widget1) {
				widget1.WidgetResource.Row = widget1.row;
				widget1.WidgetResource.Col = widget1.col;
				widget1.prevCol = widget1.col;
				widget1.prevRow = widget1.row;

				widget1.WidgetResource.Width = widget1.sizeX;
				widget1.WidgetResource.Height = widget1.sizeY;

				widget1.WidgetResource.$save().then(function (widget2) {
					signalR.SignalAllClients("Widget", widget2);
				});
			});

		}



	}

	angular
			.module("app")
			.controller("DashboardCtrl", [
				"$scope",
				"$rootScope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				"$stateParams",
				"$timeout",
				"$q",
				"uibButtonConfig",
				DashboardCtrl
			]);



})();