'use strict';

//Setting up route
angular.module('conceptdependencies').config(['$stateProvider',
	function($stateProvider) {
		// Conceptdependencies state routing
		$stateProvider
			.state('dependencies', {
				abstract: true,
				url: '/dependencies',
				template: '<ui-view/>'
			}).
			state('dependencies.bulk-edit', {
				url: '/bulkEdit',
				templateUrl: 'modules/conceptdependencies/views/conceptdependency-bulk-edit.client.view.html'
			});
		//state('listConceptdependencies', {
		//	url: '/conceptdependencies',
		//	templateUrl: 'modules/conceptdependencies/views/list-conceptdependencies.client.view.html'
		//}).
		//state('createConceptdependency', {
		//	url: '/conceptdependencies/create',
		//	templateUrl: 'modules/conceptdependencies/views/create-conceptdependency.client.view.html'
		//}).
		//state('viewConceptdependency', {
		//	url: '/conceptdependencies/:conceptdependencyId',
		//	templateUrl: 'modules/conceptdependencies/views/view-conceptdependency.client.view.html'
		//}).
		//state('editConceptdependency', {
		//	url: '/conceptdependencies/:conceptdependencyId/edit',
		//	templateUrl: 'modules/conceptdependencies/views/edit-conceptdependency.client.view.html'
		//});
	}
]);
