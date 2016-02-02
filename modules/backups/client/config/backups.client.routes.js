'use strict';

// Setting up route
angular.module('backups').config(['$stateProvider',
    function ($stateProvider) {
        // Articles state routing
        $stateProvider
            .state('backups', {
                abstract: true,
                url: '/backups/',
                template: '<ui-view/>'
            })
            .state('backups.manage', {
                url: '',
                templateUrl: 'modules/backups/views/manage.client.view.html'
            })
            .state('backups.manageByCourse', {
                url: ':courseId',
                templateUrl: 'modules/backups/views/manage.client.view.html'
            });
    }
]);
