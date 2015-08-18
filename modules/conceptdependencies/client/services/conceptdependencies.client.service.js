'use strict';

//Conceptdependencies service used to communicate Conceptdependencies REST endpoints
angular.module('conceptdependencies').factory('Conceptdependencies', ['$socketResource',
	function($resource) {
		return $resource('api/conceptdependencies/:conceptdependencyId', { conceptdependencyId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
