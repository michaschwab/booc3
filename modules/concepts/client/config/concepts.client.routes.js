'use strict';

//Setting up route
angular.module('concepts').config(['$stateProvider',
	function($stateProvider) {
		// Concepts state routing
		$stateProvider.
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
		});

	}
]);
