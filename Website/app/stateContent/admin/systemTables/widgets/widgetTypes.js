//++WidgetTypes Controller
(function () {
	"use strict";


	function WidgetTypesCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval, $timeout) {
		console.log("WidgetTypesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 15,
			tabGroup: 15,
			description: 25,
			initialHeight: 8,
			initialWidth: 8,
			creationDate: 25,
			angularDirectiveName: 20,
			adminStatus: 10,
			allStatus: 10,
			hiddenStatus: 10
		};

		vm.buttonPanelWidth = 20;
		vm.panelTitle = "iOPS System Widget Type Registration";
		if ($stateParams.Path) {
			vm.Path = $stateParams.Path;
			vm.panelSubtitle = "For widgets that are related to " + $stateParams.Path.split(".").join(" --> ") + "s";
		}

		console.log("Path Parameter = " + $stateParams.Path);


		vm.state = $state;
		displaySetupService.SetPanelDimensions();
		vm.showPanel = false;

		function GetData() {

			if ($stateParams.Path) {
				dataService.GetIOPSResource("WidgetTypes")
					.filter("CategoryPath", $stateParams.Path)
					.expand("WidgetTypeTabGroup")
					.query().$promise
					.then(function (data) {
						vm.widgetTypes = data.orderBy(function (w) { return w.DevelopmentPriority });

						vm.showPanel = true;
					});


			}



		}


		GetData();


		//---G
		//Section that provides for development priority reordering
		//////////////////////////////////////////////////
		var fixHelperModified = function (e, tr) {
				var $originals = tr.children();
				var $helper = tr.clone();
				$helper.children().each(function (index) {
					$(this).width($originals.eq(index).width());
				});
				return $helper;
			},
			updateIndex = function (e, ui) {

				//console.log("---------------------------");
				dataService.GetIOPSResource("WidgetTypes")
					.expand("WidgetTypeTabGroups")
					.then(function (dbWt) {
						vm.dbWt = dbWt;
						var currentReorderNumber = 0;
						$('#widgetTypesTable tbody tr').each(function () {
							var currentItemId = $(this).attr("itemid");
							currentReorderNumber++;

							if (vm.dbWt) {
								vm.dbWt.forEach(function (db) {
									if (db.Id == currentItemId && db.Ordinal != currentReorderNumber) {
										db.DevelopmentPriority = currentReorderNumber;
										db.$save();
										vm.widgetTypes.forEach(function (item) {
											if (item.Id == currentItemId) {
												item.DevelopmentPriority = currentReorderNumber;
											}
										});
									}

								});

							}

						});

					});


			};


		$timeout(function () {
			$("#widgetTypesTable tbody").sortable({
				helper: fixHelperModified,
				stop: updateIndex
			}).disableSelection();
		}, 150);


		//////////////////////////////////////////////////



		//vm.delete = function (widgetType) {

		//    //Go and get a "pure" copy of the user before deleting
		//    dataService.GetWidgetType(widgetType.Id).then(function (widgetTypeFromDatabase) {
		//        alertify.set({
		//            labels: {
		//                ok: "Yes, Delete the Widget Type",
		//                cancel: "Cancel, I don't want to do this"
		//            },
		//            buttonFocus: "cancel"
		//        });
		//        var message = 'Are you SURE you want to delete this Widget Type?';

		//        alertify.confirm(message, function (e) {
		//            if (e) {
		//                // user clicked "ok"
		//                widgetTypeFromDatabase.$delete().then(function () {
		//                    toastr.success(location.Name, "Widget Type was deleted!");
		//                });




		//            } else {
		//                // user clicked "no"
		//                toastr.info(location.Name, "Widget Type was NOT deleted!");
		//            }
		//        });
		//    });

		//}


		$scope.$on("WidgetType", function (event, wt) {
			console.log("Event WidgetType");
			GetData();

		});

		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}


	}

	angular
		.module("app")
		.controller("WidgetTypesCtrl", [
			"$scope",
			"$state",
			"$stateParams",
			"displaySetupService",
			"dataService",
			"signalR",
			"$interval",
			"$timeout",
			WidgetTypesCtrl
		]);



})();

