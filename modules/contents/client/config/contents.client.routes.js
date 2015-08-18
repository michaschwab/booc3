'use strict';

// Setting up route
angular.module('contents').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider

            .state('contents', {
                abstract: true,
                url: '',
                template: '<ui-view/>'
            })

            .state('lectures.list', {
                url: '/courses/:courseId/lectures',
                templateUrl: 'modules/contents/views/list-lectures.client.view.html'
            })
            .state('contents.createByCourse', {
                url: '/courses/:courseId/contents/add',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('contents.create', {
                url: '/contents/add',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('contents.createByCourseAndConcept', {
                url: '/courses/:courseId/concepts/:conceptId/contents/add',
                templateUrl: 'modules/courses/views/view-course.client.view.html'
            })
            .state('contents.list', {
                url: '/contents/list',
                templateUrl: 'modules/contents/views/list-contents.client.view.html'
            })
            .state('contents.editByCourse', {
                url: '/courses/:courseId/contents/:sourceId/edit',
                templateUrl: 'modules/contents/views/edit-contents.client.view.html'
            })
            .state('contents.editByCourseAndConcept', {
                url: '/courses/:courseId/concepts/:conceptId/contents/:sourceId/edit',
                templateUrl: 'modules/courses/views/view-course.client.view.html'
            });
    }
]);
