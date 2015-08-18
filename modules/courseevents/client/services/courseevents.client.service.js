'use strict';

//Courses service used to communicate Courses REST endpoints
angular.module('courseevents').factory('Courseevents', ['$resource',
	function($resource) {
		return $resource('/api/courseevents/:courseeventId', { courseeventId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
