/// <reference path="company.js" />
/// <reference path="~/Scripts/alertify.js-0.3.11/src/alertify.js" />
/// <reference path="~/Scripts/toastr-master/toastr.js" />
(function () {
	"use strict";


	function CompaniesCtrl($scope, $state, displaySetupService, dataService, signalR, $interval) {
		console.log("CompaniesCtrl conroller invoked.");
		var vm = this;


		vm.columnWidths = {

			name: 10,
			shortName: 10,
			description: 30,
			sitesList: 25,
			address: 25
		};

		vm.buttonPanelWidth = 170;

		vm.state = $state;
		displaySetupService.SetPanelDimensions();

		function AttachSiteListsToData(data) {
			data.forEach(function (c) {
				c.sitesList = c.SiteCompanies.select(function (sc) {
					return sc.Site.Name;
				}).join(", ");
			});
		}


		function GetData() {
			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.query()
				.$promise
				.then(function (data) {
					AttachSiteListsToData(data);
					console.log("Companies = %O", data);
					vm.companies = data;

					dataService.GetJBTData().then(function(JBTData) {

						//Some of the sites are test ones. This will filter those out.
						vm.sites = JBTData.Sites.where(function(site) { return site.Name.length < 10 }).orderBy(function(s){return s.Name});
						vm.JBTData = JBTData;
					});

				});

		}

		GetData();






		vm.delete = function (company) {


			console.log("Company to Delete = %O", company);


			if (
				vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id }) ||
				vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id }) ||
				company.SiteCompanies.length > 0) {

				var alertifyMessage = "Company cannot be deleted! ";

				if (vm.JBTData.Assets.any(function (a) { return a.CompanyId == company.Id })) {
					alertifyMessage += "It still has Assets associated with it!";
				}

				if (vm.JBTData.Systems.any(function (s) { return s.CompanyId == company.Id })) {
					alertifyMessage += "It still has Systems associated with it!";
				}

				if (company.SiteCompanies.length > 0) {
					alertifyMessage += "It still has Companies associated with it!";
				}

				alertify.alert(alertifyMessage, function (e) {
					toastr.success(location.Name, "Company was NOT deleted!");
					return;
				}
				);

				return;

			}

			alertify.set({
				labels: {
					ok: "Yes, Delete the Company",
					cancel: "Cancel, I don't want to do this"
				},
				buttonFocus: "cancel"
			});

			var message = 'Are you SURE you want to delete this company? ';

			alertify.confirm(message, function (e) {
				if (e) {
					// user clicked "ok"
					company.Id = -company.Id;
					company.$save().then(function () {
						company.Id = -company.Id;
						signalR.SignalAllClients("Company.Deleted", company);
					});
					toastr.success(location.Name, "Company was deleted!");

				} else {
					// user clicked "no"
					toastr.info(location.Name, "Company was NOT deleted!");
				}
			});

		}

		$scope.$on("Company", function (event, company) {
			console.log("Event Company");

			dataService.GetIOPSResource("Companies")
				.expandPredicate("SiteCompanies")
					.expand("Site")
				.finish()
				.get(company.Id)
				.$promise
				.then(function (data) {

					data.sitesList = data.SiteCompanies.select(function (sc) {
						return sc.Site.Name;
					}).join(", ");


					vm.companies = [data].concat(vm.companies).distinct(function(a, b) { return a.Id == b.Id });

				});

		});


		vm.scrolledToEnd = function () {
			console.log("scrolled to end");
		}



	}

	angular
			.module("app")
			.controller("CompaniesCtrl", [
				"$scope",
				"$state",
				"displaySetupService",
				"dataService",
				"signalR",
                "$interval",
				CompaniesCtrl
			]);



})();