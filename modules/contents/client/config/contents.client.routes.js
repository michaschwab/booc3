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
                templateUrl: 'modules/contents/views/edit-contents-wrapper.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.create', {
                url: '/contents/add',
                templateUrl: 'modules/contents/views/edit-contents-wrapper.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.createByCourseAndConcept', {
                url: '/courses/:courseId/concepts/:conceptId/contents/add?mode&active&addTo',
                templateUrl: 'modules/courses/views/view-course.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.manage', {
                url: '/contents/manage',
                templateUrl: 'modules/contents/views/manage-contents.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.edit', {
                url: '/contents/:sourceId/edit',
                templateUrl: 'modules/contents/views/edit-contents-wrapper.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.editByCourse', {
                url: '/courses/:courseId/contents/:sourceId/edit',
                templateUrl: 'modules/contents/views/edit-contents-wrapper.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            })
            .state('contents.editByCourseAndConcept', {
                url: '/courses/:courseId/concepts/:conceptId/contents/:sourceId/edit?mode&active&addTo',
                templateUrl: 'modules/courses/views/view-course.client.view.html',
                data: {
                    roles: ['admin', 'courseadmin']
                }
            });
    }
]);
