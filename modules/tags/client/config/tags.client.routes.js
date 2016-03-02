'use strict';

//Setting up route
angular.module('tags').config(['$stateProvider', '$locationProvider',
    function($stateProvider, $locationProvider) {
        // Courses state routing
        $stateProvider

            .state('tags', {
                abstract: true,
                url: '/tags',
                template: '<ui-view/>'
            }).

        state('tags.list', {
            url: '/',
            templateUrl: 'modules/tags/views/list.client.view.html',
            data: {
                roles: ['admin', 'courseadmin']
            }
        }).
        state('tags.create', {
            url: '/create',
            templateUrl: 'modules/tags/views/edit.client.view.html',
            data: {
                roles: ['admin', 'teacher']
            }
        }).
        state('tags.view', {
            url: '/:tagId',
            templateUrl: 'modules/tags/views/view-tag.client.view.html',
            reloadOnSearch: false
        }).
        state('tags.edit', {
            url: '/:tagId/edit',
            templateUrl: 'modules/tags/views/edit-tag.client.view.html'
        });

        //$locationProvider.html5Mode(true);
    }
]);
