'use strict';

//Setting up route
angular.module('courseevents').config(['$stateProvider',
	function($stateProvider)
	{
		// Courseevents state routing
		$stateProvider
			.state('courseevents', {
				abstract: true,
				url: '',
				template: '<ui-view/>',
				data: {
					roles: ['admin', 'courseadmin']
				}
			})
			.state('courseevents.manage',
			{
				url: '/courseevents/manage',
				templateUrl: 'modules/courseevents/views/manage.client.view.html'
			}).state('courseevents.manageByCourse',
			{
				url: '/courses/:courseId/courseevents/manage',
				templateUrl: 'modules/courseevents/views/manage.client.view.html'
			}).state('courseevents.create',
			{
				url: '/courseevents/create',
				templateUrl: 'modules/courseevents/views/edit.client.view.html'
			}).state('courseevents.createByCourse',
			{
				url: '/courses/:courseId/courseevents/create',
				templateUrl: 'modules/courseevents/views/edit.client.view.html'
			}).state('courseevents.edit',
			{
				url: '/courseevents/:courseeventId/edit',
				templateUrl: 'modules/courseevents/views/edit.client.view.html'
			});
	}
]);
