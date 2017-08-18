"use strict";

angular.module('psMenu').controller('psMenuController',
    ['$scope', '$rootScope', "displaySetupService", "$state", "$window", "$timeout",
        function ($scope, $rootScope, displaySetupService, $state, $window, $timeout) {


            console.log("psMenuController Invoked");

	    var vm = this;


	    vm.displaySetupService = displaySetupService;
	    $scope.displaySetupService = displaySetupService;

		
            displaySetupService.menuParameters.isMenuVisible = true;
            displaySetupService.menuParameters.isMenuButtonVisible = true;
            displaySetupService.menuParameters.isVertical = true;
            displaySetupService.menuParameters.openMenuScope = null;
            displaySetupService.menuParameters.showMenu = true;
            displaySetupService.menuParameters.allowHorizontalToggle = true;

            vm.getActiveElement = function () {
                return $scope.activeElement;
            };

            vm.setActiveElement = function (el) {
                displaySetupService.menuParameters.activeElement = el;
            };

            vm.isVertical = function () {
                return displaySetupService.menuParameters.isVertical;
            }

            $scope.isVertical = function () {
                return displaySetupService.menuParameters.isVertical;
            }

            vm.isMenuVertical = vm.isVertical();

            vm.setRoute = function (state) {
                $rootScope.$broadcast('ps-menu-item-selected-event',
                    { state: state });
            };

            vm.setOpenMenuScope = function (scope) {
                vm.openMenuScope = scope;
            };

            vm.toggleMenuOrientation = function () {

                // close any open menu
                if (vm.openMenuScope)
                    vm.openMenuScope.closeMenu();

                displaySetupService.menuParameters.isVertical = !displaySetupService.menuParameters.isVertical;

                $rootScope.$broadcast('ps-menu-orientation-changed-event',
                    { isMenuVertical: displaySetupService.menuParameters.isVertical });
            };

            angular.element(document).bind('click', function (e) {
                if (vm.openMenuScope && !displaySetupService.menuParameters.isVertical) {
                    if ($(e.target).parent().hasClass('ps-selectable-item'))
                        return;
                    $scope.$apply(function () {
                        vm.openMenuScope.closeMenu();
                    });
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            $scope.$on('ps-menu-show', function(evt, data) {
                displaySetupService.menuParameters.showMenu = data.show;
                displaySetupService.menuParameters.isVertical = data.isVertical;
                vm.allowHorizontalToggle = data.allowHorizontalToggle;
            });





	        //Below is from the framework controller

            function broadcastMenuState() {
                $rootScope.$broadcast('ps-menu-show',
                    {
                        show: displaySetupService.menuParameters.isMenuVisible,
                        isVertical: displaySetupService.menuParameters.isMenuVertical,
                        allowHorizontalToggle: !displaySetupService.menuParameters.isMenuButtonVisible
                    });
            };

            $scope.$on('ps-menu-item-selected-event', function (evt, data) {
                $scope.routeString = data.route;
                $state.go(data.route);
                //$location.path(data.route);
                checkWidth();
                broadcastMenuState();
            });

            $scope.$on('ps-menu-orientation-changed-event', function (evt, data) {
                displaySetupService.menuParameters.isMenuVertical = data.isMenuVertical;
                $timeout(function () {
                    $($window).trigger('resize');
                }, 0);
            });

            $($window).on('resize.psFramework', function () {
                $scope.$apply(function () {
                    checkWidth();
                    broadcastMenuState();
                });
            });
            $scope.$on("$destroy", function () {
                $($window).off("resize.psFramework"); // remove the handler added earlier
            });

            function checkWidth () {
                var width = Math.max($($window).width(), $window.innerWidth);
                displaySetupService.menuParameters.isMenuVisible = (width >= 768);
                displaySetupService.menuParameters.isMenuButtonVisible = !displaySetupService.menuParameters.isMenuVisible;
            };

            $scope.menuButtonClicked = function () {
                displaySetupService.menuParameters.isMenuVisible = !displaySetupService.menuParameters.isMenuVisible;
                broadcastMenuState();
                //$scope.$apply();
            };


            $timeout(function () {
                checkWidth();
            }, 0);

        








            //old

            $scope.isVertical = true;
            $scope.openMenuScope = null;
            $scope.showMenu = true;
            $scope.allowHorizontalToggle = true;

            this.getActiveElement = function () {
                return $scope.activeElement;
            };

            this.setActiveElement = function (el) {
                $scope.activeElement = el;
            };

            this.isVertical = function () {
                return $scope.isVertical;
            }

            this.setRoute = function (route) {
                $rootScope.$broadcast('ps-menu-item-selected-event',
                    { route: route });
            };

            this.setOpenMenuScope = function (scope) {
                $scope.openMenuScope = scope;
            };

            $scope.toggleMenuOrientation = function () {

                // close any open menu
                if ($scope.openMenuScope)
                    $scope.openMenuScope.closeMenu();

                $scope.isVertical = !$scope.isVertical;

                $rootScope.$broadcast('ps-menu-orientation-changed-event',
                    { isMenuVertical: $scope.isVertical });
            };

            angular.element(document).bind('click', function (e) {
                if ($scope.openMenuScope && !$scope.isVertical) {
                    if ($(e.target).parent().hasClass('ps-selectable-item'))
                        return;
                    $scope.$apply(function () {
                        $scope.openMenuScope.closeMenu();
                    });
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            $scope.$on('ps-menu-show', function(evt, data) {
                $scope.showMenu = data.show;
                $scope.isVertical = data.isVertical;
                $scope.allowHorizontalToggle = data.allowHorizontalToggle;
            });
        }
    ]);