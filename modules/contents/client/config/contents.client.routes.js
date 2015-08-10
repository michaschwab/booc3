'use strict';

// Setting up route
angular.module('contents').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
            state('listLectures', {
                url: '/courses/:courseId/lectures',
                templateUrl: 'modules/contents/views/list-lectures.client.view.html'
            })
            .state('createContents', {
                url: '/courses/:courseId/contents/add',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('createContents2', {
                url: '/contents/add',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('createContents3', {
                url: '/courses/:courseId/concepts/:conceptId/contents/add',
                templateUrl: 'modules/courses/views/view-course.client.view.html'
            })
            .state('listContents', {
                url: '/contents/list',
                templateUrl: 'modules/contents/views/list-contents.client.view.html'
            })
            .state('editContents', {
                url: '/courses/:courseId/contents/:sourceId/edit',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('editContents2', {
                url: '/courses/:courseId/concepts/:conceptId/contents/:sourceId/edit',
                templateUrl: 'modules/courses/views/view-course.client.view.html'
            });
    }
]);
