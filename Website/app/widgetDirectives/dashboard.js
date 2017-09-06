(function () {
	;

	var app = angular.module('app');

	app.directive('dashboard',
		[
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
			"utilityService",

			function ($rootScope, $state, displaySetupService, dataService, signalR, $interval, $stateParams, $timeout, $q, uibButtonConfig, utilityService) {

				var controller = function ($scope) {

					var vm = this;

					console.log("Dashboard directive invoked. $scope = %O", $scope);
					console.log("vm = %O", vm);
					console.log("$scope = %O", $scope);

					if (!vm.widget) {
						//console.log("No Widget Present");
						displaySetupService.SetPanelDimensions();
					} else {
						//console.log("Widget Present");
						displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
					}


					vm.openSettingsDash = function ($event, widget) {
						var element = $("#widget-settings-" + widget.Id)[0].parentNode.parentNode.offsetParent;
						var position = $(element).offset();
						position.width = $(element).width();

						$("#widget-settings-" + widget.Id).css({left: position.left + 20, width: 500 });
						$("#widget-settings-" + widget.Id).slideToggle();

					}


					uibButtonConfig.activeClass = 'radio-active';

					//If this is an embedded dashboard, then a lot of things change.
					if (vm.widget) {
						if (vm.widget.WidgetResource.EmbeddedDashboard) {
							vm.dashboardId = vm.widget.WidgetResource.EmbeddedDashboard.Id;
							vm.dashboard = vm.widget.WidgetResource.EmbeddedDashboard;
							GetDashboardData();
							displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
						} else {
							if (vm.widget.WidgetResource.EmbeddedDashboardId) {
								dataService.GetEntityById("Dashboards", vm.widget.WidgetResource.EmbeddedDashboardId).then(function (db) {
									vm.dashboardId = db.Id;
									vm.dashboard = db;
									GetDashboardData();
									displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
								});

							}
						}

						vm.supressWidgetHeaders = true;

					} else {
						if (vm.dashboardId) {
							vm.dashboardId = +vm.dashboardId;

						} else {
							if (vm.dashboard) {
								vm.dashboardId = vm.dashboard.Id;
							}
						}
						vm.supressWidgetHeaders = false;
						GetDashboardData();
					}


					function GetDashboardData() {
						dataService.GetExpandedDashboardById(vm.dashboardId)
						.then(function (data) {
							vm.dashboard = data;
							SetSubTitleBasedOnDashboardTimeScope();
							//console.log("vm.dashboard = %O", vm.dashboard);
						})
						.then(function () {
							dataService.GetIOPSResource("Widgets")
								.filter("ParentDashboardId", vm.dashboardId)
								.expand("WidgetType")
								.expand("EmbeddedDashboard")
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
									if (!vm.widget) {
										console.log("No widget this invokation");
										displaySetupService.SetPanelDimensions();
									} else {
										displaySetupService.SetWidgetPanelBodyDimensions(vm.widget.Id);
									}
									//console.log("Dashboard Widgets = %O", vm.widgets);
								});
						});

					}

					vm.CamelCaseToSnakeCase = function (cc) {

						return cc.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });





					}


					vm.openSettings = function (widget) {
						console.log("Opening Settings. widget = %O", widget);
						return hs.htmlExpand(this, { contentId: 'highslide-html' + widget.Id, headingText: widget.Name + ' Settings' });
					}




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
							}, 25, 10);
						});

					}


					$scope.$on("Dashboard", function (event, dashboard) {
						//console.log("Event Dashboard = %O", dashboard);

						if (dashboard.Id == vm.dashboardId) {
							vm.dashboard = dashboard;
							SetSubTitleBasedOnDashboardTimeScope();
						}

					});

					vm.SetTimeScope = function (days) {
						vm.timeScopeDays = days;
						dataService.GetDashboardTimeScopes().then(function (timeScopes) {
							var timeScope = timeScopes.first(function (ts) { return ts.Days == days });
							if (timeScope) {
								vm.dashboard.DashboardTimeScope = timeScope;
								vm.dashboard.TimescopeId = timeScope.Id;
								vm.dashboard.CustomStartDate = null;
								vm.dashboard.CustomEndDate = null;

								//Get a pure copy of the dashboard, set the TimeScopeId, save it, and signal the change via signalr
								dataService.GetEntityById("Dashboards", vm.dashboard.Id).then(function (db) {
									db.TimeScopeId = timeScope.Id;
									db.CustomStartDate = null;
									db.CustomEndDate = null;
									db.$save().then(function () {
										dataService.SetDashboardDerivedDatesFromDayCount(vm.dashboard);
										signalR.SignalAllClients("Dashboard", vm.dashboard);
									});
								});
							}
						});
					}



					//Set the begin time for the dashboard window forward each second.
					//Dashboard widgets depend on these values to refresh the values within the window.
					vm.timeScopeUpdateInterval = $interval(function () {
						dataService.SetDashboardDerivedDatesFromDayCount(vm.dashboard);
					}, 1000);

					$scope.$on("$destroy", function () {
						$interval.cancel(vm.timeScopeUpdateInterval);

					});

					function SetSubTitleBasedOnDashboardTimeScope() {
						//Figure out the date ranges and list it on the subtitle for the dashboard header.
						if (vm.dashboard.DashboardTimeScope) {
							vm.subTitle = vm.dashboard.DashboardTimeScope.Description;
						} else {
							vm.subTitle = vm.dashboard.CustomStartDate + " to " + vm.dashboard.CustomEndDate;
						}
					}








					$scope.$on("Widget", function (event, widget) {

						if (widget.ParentDashboardId == vm.dashboardId) {
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

						console.log("Deleted widget = %O", deletedWidget);
						console.log("vm.dashboard = %O", vm.dashboard);

						if (deletedWidget.ParentDashboardId == vm.dashboard.Id) {
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

						if (deletedDashboard.Id == vm.dashboardId) {
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


								dataService.GetIOPSResource("Widgets").filter("Id", widget.Id).query().$promise.then(function (widgetToDeleteArray) {
									var widgetToDelete = widgetToDeleteArray[0];
									//console.log("Widget to delete = %O", widgetToDelete);
									widgetToDelete.Id = -widgetToDelete.Id;
									widgetToDelete.$save().then(function () {
										console.log("Widget Deleted");
										widgetToDelete.Id = -widgetToDelete.Id;
										signalR.SignalAllClients("Widget.Deleted", widgetToDelete);
									});
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
						width: 3800, // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
						colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
						rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
						margins: (vm.widget && vm.widget.WidgetResource.EmbeddedDashboard) ? [0, 0] : [5, 5], // the pixel distance between each widget
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
						(widget.WidgetResource.$save && !widget.WidgetResource.EmbeddedDashboard
							? $q.when(widget.WidgetResource)
							: dataService.GetIOPSResource("Widgets").filter("Id", widget.Id).expand("WidgetType").query().$promise.then(function (data) {
								widget.WidgetResource = data[0];
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

				};





				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "app/widgetDirectives/dashboard.html?" + Date.now(),
					replace: true,
					scope: {

						dashboardId: "=",
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