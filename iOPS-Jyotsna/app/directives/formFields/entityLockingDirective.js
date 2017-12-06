(function ()
{

	var app = angular.module('app');

	app.directive('entityLocking',
		[
			"$state", "signalR",

			function ($state, signalR) {

				var controller = function ($scope)
				{

					var vm = this;
					vm.stateName = $state.current.name;

					//console.log("entityLocking directive controller invoked. vm.odataSource = " + vm.odataSource + "   vm.collection = " + vm.collection + "   vm.entityId = " + vm.entityId);
					

					var globalLockedEntities = signalR.OdataLockedEntities;

					vm.EntityIsLocked = false;
					vm.lockedNameDisplay = "";
					vm.showLockBackdrop = false;

					function CheckForLocked() {

						if (vm.entityId) {
							vm.LockingUser = signalR.GetLockingUserForEntity(vm.odataSource, vm.collection, vm.entityId);
							if (!vm.LockingUser) {
								//Entity is not locked by someone else, lock it for us!
								if (!vm.EntityIsLocked) {

									console.log("Entity was not locked by someone else, locking entity for us.");
									signalR.LockEntity(vm.odataSource, vm.collection, vm.entityId);
									vm.showLockBackdrop = false;

								}

							} else {
								console.log("signalR returned a locking user = %O", vm.LockingUser);
								vm.EntityIsLocked = true;
								vm.showLockBackdrop = true;
								vm.lockedNameDisplay = vm.LockingUser.GivenName + " " + vm.LockingUser.FamilyName;

							}

						}
					}

					CheckForLocked();

					$scope.$on(
						"$destroy",
						function handleDestroyEvent()
						{
							//$scope.$on("System.EntityUnlocked", function () { });
							signalR.UnlockEntity(vm.odataSource, vm.collection, vm.entityId);

						}
					);

					$scope.$on("System.EntityUnlocked", function (event, lockingData)
					{
						if (lockingData.odataSource == vm.odataSource && lockingData.collection == vm.collection && lockingData.Id == vm.entityId && signalR.Me.ClientId == lockingData.lockingClientId)
						{
							//This was us unlocking our own entity.
							return;
						}
						vm.LockingUser = null;
						vm.EntityIsLocked = false;
						vm.showLockBackdrop = false;
						vm.lockedNameDisplay = "";
						console.log("entityLocking directive - checking for locks");
						CheckForLocked();
					});

				};


				controller.$inject = ["$scope"];



				return {
					restrict: 'E', //Default for 1.3+
					replace: true,
					templateUrl: "angular/common/directives/formFields/entityLockingTemplate.html?" + Date.now(),

					scope: {
						odataSource: "@",
						collection: "@",
						entityId: "="
					},

					controllerAs: 'vm',
					controller: controller,
					bindToController: true //required in 1.3+ with controllerAs
				};
			}
	]);

}());