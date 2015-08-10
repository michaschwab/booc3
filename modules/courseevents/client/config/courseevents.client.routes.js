'use strict';

//Setting up route
angular.module('courseevents').config(['$stateProvider',
	function($stateProvider)
	{
		// Courseevents state routing
		$stateProvider.state('courseevents',
		{
			url: '/courseevents',
			templateUrl: 'modules/courseevents/views/list.client.view.html'
		}).state('courseevents2',
		{
			url: '/courses/:courseId/courseevents',
			templateUrl: 'modules/courseevents/views/list.client.view.html'
		}).state('courseevents-create',
		{
			url: '/courseevents/create',
			templateUrl: 'modules/courseevents/views/edit.client.view.html'
		}).state('courseevents-create2',
		{
			url: '/courses/:courseId/courseevents/create',
			templateUrl: 'modules/courseevents/views/edit.client.view.html'
		}).state('courseevents-edit',
		{
			url: '/courseevents/:courseeventId/edit',
			templateUrl: 'modules/courseevents/views/edit.client.view.html'
		});
	}
]);
