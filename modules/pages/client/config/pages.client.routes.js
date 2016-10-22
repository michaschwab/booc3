'use strict';

//Setting up route
angular.module('messages').config(['$stateProvider',
	function($stateProvider) {
		// Messages state routing
		$stateProvider
			/*.state('pages', {
				abstract: true,
				url: '',
				template: '<ui-view/>'
			}).*/
			.state('paper', {
				url: '/paper',
				templateUrl: 'modules/pages/views/paper.client.view.html'
			})
			.state('paper2', {
				url: '/paper/',
				templateUrl: 'modules/pages/views/paper.client.view.html'
			});
	}
]);
