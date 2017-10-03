"use strict";

angular.module('app').directive('dashboard', ['$localStorage',
    function ($localStorage) {
    return {
        scope: {
        },
        template: '<ps-dashboard></ps-dashboard>',
        link: function (scope) {

            scope.title = 'My First Dashboard';

            scope.gridsterOpts = {
                columns: 12,
                margins: [20, 20],
                outerMargin: false,
                pushing: true,
                floating: false,
                swapping: false
            };

            scope.widgetDefinitions = [
                {
                    title: 'Temperature',
                    settings: {
                        sizeX: 3,
                        sizeY: 3,
                        minSizeX: 2,
                        minSizeY: 2,
                        template: '<temperature></temperature>',
                        widgetSettings: {
                            id: 1000,
                            templateUrl: 'app/dialogs/selectLocationTemplate.html',
                            controller: 'selectLocationController'
                        }
                    }
                },
                {
                    title: 'Inventory',
                    settings: {
                        sizeX: 5,
                        sizeY: 3,
                        minSizeX: 2,
                        minSizeY: 2,
                        template: '<inventory></inventory>',
                        widgetSettings: {
                            id: 1002,
                            templateUrl: 'app/dialogs/selectLocationTemplate.html',
                            controller: 'selectLocationController'
                        }
                    }
                },
                {
                    title: 'Employee',
                    settings: {
                        sizeX: 5,
                        sizeY: 3,
                        minSizeX: 2,
                        minSizeY: 2,
                        template: '<employee></employee>',
                        widgetSettings: {
                            id: 5000,
                            templateUrl: 'app/dialogs/selectEmployeeTemplate.html',
                            controller: 'selectEmployeeController'
                        }
                    }
                }
            ];

            scope.widgets = $localStorage.widgets || [
                
            ];

            scope.$watch('widgets', function () {
                $localStorage.widgets = scope.widgets;
            }, true);
        }
    }
}]);