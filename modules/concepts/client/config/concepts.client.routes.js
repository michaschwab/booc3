'use strict';

//Setting up route
angular.module('concepts').config(['$stateProvider',
	function($stateProvider) {
		// Concepts state routing

		$stateProvider
			.state('concepts', {
				abstract: true,
				url: '/concepts',
				template: '<ui-view/>',
				data: {
					roles: ['admin', 'courseadmin']
				}
			}).
			state('concepts.list', {
				url: '/concepts',
				templateUrl: 'modules/concepts/views/list-concepts.client.view.html'
			}).
			state('concepts.create', {
				url: '/concepts/create',
				templateUrl: 'modules/concepts/views/create-concept.client.view.html'
			}).
			state('concepts.view', {
				url: '/concepts/:conceptId',
				templateUrl: 'modules/concepts/views/view-concept.client.view.html'
			}).
			state('concepts.edit', {
				url: '/concepts/:conceptId/edit',
				templateUrl: 'modules/concepts/views/edit-concept.client.view.html'
			}).
			state('concepts.bulk-edit', {
				url: '/bulkEdit',
				templateUrl: 'modules/concepts/views/concepts-bulk-edit.client.view.html'
			});

		/*$stateProvider.
		state('listConcepts', {
			url: '/concepts',
			templateUrl: 'modules/concepts/views/list-concepts.client.view.html'
		}).
		state('createConcept', {
			url: '/concepts/create',
			templateUrl: 'modules/concepts/views/create-concept.client.view.html'
		}).
            state('bulkEditConcepts', {
                url: '/concepts/bulkEdit',
                templateUrl: 'modules/concepts/views/concepts-bulk-edit.client.view.html'
            }).
		state('viewConcept', {
			url: '/concepts/:conceptId',
			templateUrl: 'modules/concepts/views/view-concept.client.view.html'
		}).
		state('editConcept', {
			url: '/concepts/:conceptId/edit',
			templateUrl: 'modules/concepts/views/edit-concept.client.view.html'
		});*/

	}
]);
