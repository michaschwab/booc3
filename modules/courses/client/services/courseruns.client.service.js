'use strict';

//Courses service used to communicate Courses REST endpoints
angular.module('courses').factory('Courseruns', ['$resource',
	function($resource) {
		return $resource('/api/courseruns/:courserunId', { courserunId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
