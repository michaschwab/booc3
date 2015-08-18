'use strict';

//Messages service used to communicate Messages REST endpoints
angular.module('messages').factory('Chatparticipants', ['$socketResource',
	function($resource) {
		return $resource('/api/chatparticipants/:chatparticipantId', { chatparticipantId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
