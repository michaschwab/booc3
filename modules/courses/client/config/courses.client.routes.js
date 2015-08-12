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
			templateUrl: 'modules/courses/views/list-courses.client.view.html'
		}).
		state('courses.create', {
			url: '/create',
			templateUrl: 'modules/courses/views/edit-course.client.view.html'
		}).
		state('courses.view', {
			url: '/courses/:courseId',
			templateUrl: 'modules/courses/views/view-course.client.view.html',
            reloadOnSearch: false
		}).
		state('courses.edit', {
			url: '/courses/:courseId/edit',
			templateUrl: 'modules/courses/views/edit-course.client.view.html'
		});

        //$locationProvider.html5Mode(true);
	}
]);
