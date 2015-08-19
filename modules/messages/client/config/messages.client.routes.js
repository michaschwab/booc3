'use strict';

//Setting up route
angular.module('messages').config(['$stateProvider',
	function($stateProvider) {
		// Messages state routing
		$stateProvider
			.state('messages', {
				abstract: true,
				url: '',
				template: '<ui-view/>'
			}).
			state('messages.list', {
				url: '/messages',
				templateUrl: 'modules/messages/views/list-messages.client.view.html'
			})
			.state('messages.create', {
				url: '/messages/create',
				templateUrl: 'modules/messages/views/create-message.client.view.html'
			})

			.state('messages.createByUserId', {
				url: '/messages/to/:toUserId',
				templateUrl: 'modules/messages/views/create-message.client.view.html'
			}).
			state('messages.viewChatroom', {
				url: '/chats/:chatroomId',
				templateUrl: 'modules/messages/views/chatroom.client.view.html'
			}).
			state('messages.edit', {
				url: '/messages/:messageId/edit',
				templateUrl: 'modules/messages/views/edit-message.client.view.html'
			});
	}
]);
