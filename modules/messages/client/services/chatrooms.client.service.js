'use strict';

//Messages service used to communicate Messages REST endpoints
angular.module('messages').factory('Chatrooms', ['$resource',
	function($resource) {
		return $resource('/api/chatrooms/:chatroomId', { messageId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
