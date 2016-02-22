'use strict';

//Conceptdependencies service used to communicate Conceptdependencies REST endpoints
angular.module('logs').factory('Log', ['$resource', '$http',
	function($resource, $http) {
		var Log = $resource('/api/logs/:logId', { logId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});

		return Log;
	}
]);
