'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('comments').factory('Comment', ['$socketResource',
	function($resource) {
		return $resource('/api/comments/:commentId', { commentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
