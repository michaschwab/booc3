'use strict';

//Messages service used to communicate Messages REST endpoints
angular.module('messages').factory('Messages', ['$socketResource',
	function($resource) {
		return $resource('/api/messages/:messageId', { messageId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
