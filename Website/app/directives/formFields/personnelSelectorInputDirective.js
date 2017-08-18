(function ()
{

	var app = angular.module('app');

	app.directive('personnelSelectorList',
		[
			"odataService", "personnelService", "utilityService", "$odata", "dataCache", "$state", "hotkeys",

			function (odataService, personnelService, utilityService, $odata, dataCache, $state, hotkeys) {

				var controller = function ($scope)
				{

					var vm = this;
					vm.stateName = $state.current.name;
					vm.personnelService = personnelService;

					console.log("personnelSelectorList directive - vm.people = %O", vm.people);


					function IsInMyPeople(person) {
						if (vm.people) {
							for (var l = 0; l < vm.people.length; l++) {
								if (vm.people[l].MasterId == person.MasterId) {
									return true;
								}
							}
							return false;
						}
						return false;
					};


					vm.SelectContact = function (item, model, label, event) {
						personnelService.GetPersonById(item.MasterId).then(function(data) {
							console.log("Person Model from personnelService = %O", data);
							if (!IsInMyPeople(data)) {
								utilityService.ReplaceItemInArrayById(vm.people, data);
								vm.addPersonFunction()(data);
							}
							vm.Person = null;
						});
					};

					vm.searchPeople = function (searchTerm)
					{
						if (searchTerm.length > 2)
						{
							vm.searchingPeople = true;
							//console.log(searchTerm);
							return personnelService.GenericSearch(searchTerm);

						}
						return null;
					};

					vm.RemovePerson = function(person) {
						utilityService.RemoveItemFromArrayById(vm.people, person);
						vm.removePersonFunction()(person);
					};

					hotkeys.bindTo($scope)
					.add({
						combo: 'esc',
						description: 'Cancel and close any input form',
						allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
						callback: function ()
						{
							$state.go("^");
						}
					});


				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					templateUrl: "angular/common/directives/panels/personnelSelectorListDirectiveTemplate.html?" + Date.now(),

					scope: {
						people: "=",
						listTitle: "@",
						removePersonFunction: "&",
						addPersonFunction: "&"
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());