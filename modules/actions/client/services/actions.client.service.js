'use strict';

//Conceptdependencies service used to communicate Conceptdependencies REST endpoints
angular.module('actions').factory('Actions', ['$socketResource', '$http',
	function($resource, $http) {
		var Action = $resource('actions/:actionId', { actionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});

		return Action;
	}
]);
