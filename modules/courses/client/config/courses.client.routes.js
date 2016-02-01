'use strict';

//Setting up route
angular.module('courses').config(['$stateProvider', '$locationProvider',
	function($stateProvider, $locationProvider) {
		// Courses state routing
		$stateProvider

		.state('courses', {
			abstract: true,
			url: '/courses',
			template: '<ui-view/>'
		}).

		state('courses.list', {
			url: '/',
			templateUrl: 'modules/courses/views/list-courses.client.view.html',
			data: {
				roles: ['admin', 'courseadmin']
			}
		}).
		state('courses.create', {
			url: '/create',
			templateUrl: 'modules/courses/views/edit-course.client.view.html',
			data: {
				roles: ['admin', 'courseadmin']
			}
		}).
		state('courses.view', {
			url: '/:courseId?learn&goal&active&mode&source&segment',
			templateUrl: 'modules/courses/views/view-course.client.view.html',
            reloadOnSearch: false
		}).
		state('courses.edit', {
			url: '/:courseId/edit',
			templateUrl: 'modules/courses/views/edit-course.client.view.html'
		});

        //$locationProvider.html5Mode(true);
	}
]);
