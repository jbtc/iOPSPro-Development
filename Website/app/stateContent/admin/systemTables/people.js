/// <reference path="company.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
	"use strict";


	function PeopleCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("PeopleCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 10,
			email: 10,
			phone: 30,
			title: 25,
			company: 25,
			associatedSites: 20
		};

		vm.buttonPanelWidth = 170;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		//function AttachSiteListsToData(data) {
		//	data.forEach(function (c) {
		//		c.siteList = c..select(function (sc) {
		//			return sc.Site.Name;
		//		}).join(", ");
		//	});
		//}


		function GetData() {
			dataService.GetIOPSResource("People")
				.expandPredicate("iOPSUsers")
					.expandPredicate("SiteDataReaders")
						.expand("Site")
					.finish()
				.finish()
				.orderBy("FamilyName")
				.query()
				.$promise
				.then(function (data) {
					console.log("People = %O", data);
					vm.people = data;


				});

		}

		GetData();






		vm.delete = function (person) {


			console.log("Person to Delete = %O", person);



			alertify.set({
				labels: {
					ok: "Yes, Delete the Person",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this person? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					person.Id = -person.Id;
					person.$save().then(function () {
						person.Id = -person.Id;
						signalR.SignalAllClients("Person.Deleted", person);
					});
					toastr.success(location.Name, "Person was deleted!");

				} else {
					// user clicked "no"
					toastr.info(location.Name, "Person was NOT deleted!");
				}
			});

		}

		$scope.$on("Person", function (event, person) {
			console.log("Event Person");

			dataService.GetIOPSResource("People")
				.expandPredicate("iOPSUsers")
					.expandPredicate("SiteDataReaders")
						.expand("Site")
					.finish()
				.finish()
				.get(person.Id)
				.$promise
				.then(function (data) {

					vm.people = [data].concat(vm.people).distinct(function(a, b) { return a.Id == b.Id });

				});

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("PeopleCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				PeopleCtrl
			]);



})();