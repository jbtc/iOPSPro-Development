/// <reference path="building.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
/// <reference path="~/Scripts/angular-1.5.7/angular.js" />
(function () {
	"use strict";


	function WidgetTypesCtrl($scope, $state, $stateParams, displaySetupService, dataService, signalR, $interval) {
		console.log("WidgetTypesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {
			id: 5,
			priority: 5,
			name: 15,
			description: 25,
			initialHeight: 8,
			initialWidth: 8,
			creationDate: 25
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
				dataService.GetIOPSCollection("WidgetTypes", "CategoryPath", $stateParams.Path).then(function (data) {
					vm.widgetTypes = data.orderBy(function (w) { return w.Name });

					vm.showPanel = true;
				});


			}



		}


		GetData();

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
			console.log("Event iOPSUser");
			vm.widgetTypes = [wt].concat(vm.widgetTypes).distinct(function (a, b) { return a.Id == b.Id });

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
				WidgetTypesCtrl
			]);



})();