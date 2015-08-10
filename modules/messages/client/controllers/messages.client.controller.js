'use strict';

// Messages controller
angular.module('messages').controller('MessagesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Messages', 'Users', 'Chatrooms', 'Chatparticipants', '$timeout',
	function($scope, $stateParams, $location, Authentication, Messages, Users, Chatrooms, Chatparticipants, $timeout) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		$scope.createRoom = function()
		{
			var userId = $stateParams.toUserId;

			var room = new Chatrooms();
			room.$save(function()
			{
				var roomId = room._id;

				var from = new Chatparticipants({
					user: user._id,
					chatroom: roomId
				});

				from.$save(function()
				{
					var to = new Chatparticipants({
						user: userId,
						chatroom: roomId
					});

					to.$save(function()
					{
						$location.path('chats/' + room._id);
					});
				});

			});
		};

		$scope.menuInit = function()
		{

			var userDirectory = {};
			$scope.totalNew = [];
			$scope.messages = {};
			$scope.participants = [];

			var updateMenuActionTimeout = null;

			var updateMenu = function()
			{
				var action = function()
				{
					$scope.chatrooms = [];
					$scope.totalNew = [];

					//console.log('updating message menu');

					$scope.participants.forEach(function(participant)
					{
						var chatroomId = participant.chatroom;

						var chatroom = Chatrooms.get({chatroomId: chatroomId }, function()
						{
							var messages = Messages.query({chatroomId: chatroomId }, function()
							{
								$scope.messages[chatroomId] = messages;
								$scope.$watchCollection('messages[\'' + chatroomId + '\'].downloadedUpdates', function()
								{
									if($scope.messages[chatroomId].downloadedUpdates.length > 0)
									{
										//console.log('messages updated!', $scope.messages[chatroomId].downloadedUpdates.length);
										updateMenu();
									}

								});

								var otherParticipants = Chatparticipants.query({chatroom: chatroomId }, function()
								{
									chatroom.users = [];

									otherParticipants.forEach(function(otherParticipant)
									{
										var userId = otherParticipant.user;
										chatroom.users.push($scope.getUser(userId));
									});

									// See if there are new messages
									chatroom.newMessages = messages.filter(function(m)
									{
										return new Date(m.created).getTime() > new Date(participant.lastRead).getTime();
									});

									$scope.totalNew = $scope.totalNew.concat(chatroom.newMessages);

									$scope.chatrooms.push(chatroom);
								});
							});

						});
					});
				};

				$timeout.cancel(updateMenuActionTimeout);
				updateMenuActionTimeout = $timeout(action, 100);
			};

			$scope.getUser = function(userId)
			{
				if(!userDirectory[userId])
				{
					userDirectory[userId] = Users.get({userId: userId});
				}

				return userDirectory[userId];
			};

			$scope.participants = Chatparticipants.query({user: Authentication.user._id }, function()
			{
				//updateMenu();

				$scope.$watchCollection('participants.downloadedUpdates', function()
				{
					//console.log('updated participants');
					updateMenu();
				});
			});
		};

		$scope.chatInit = function()
		{
			//$scope.toUser = Users.get({userId: $stateParams.toUserId });
			var chatroomId = $stateParams.chatroomId;

			$scope.chatroom = Chatrooms.get({chatroomId: chatroomId});

			$scope.participants = Chatparticipants.query({chatroom: chatroomId }, function()
			{
				$scope.$watchCollection('participants.downloadedUpdates', function()
				{
					$scope.participantUserIds = $scope.participants.map(function(p) { return p.user; });
					$scope.activeParticipant = $scope.participants.filter(function(p) { return p.user == $scope.user._id; })[0];
					$scope.userDirectory = {};

					$scope.participantUserIds.forEach(function(userId)
					{
						$scope.userDirectory[userId] = Users.get({userId: userId });
					});
				});
			});
			$scope.messages = Messages.query({chatroom: chatroomId });

			$scope.$watchCollection('messages.downloadedUpdates', function()
			{
				$scope.messages = $scope.messages.sort(function(a, b)
				{
					return new Date(a.created).getTime() - new Date(b.created).getTime();
				});
			});

			$scope.$watchCollection('messages', function()
			{
				if($scope.activeParticipant)
				{
					$scope.activeParticipant.lastRead = Date.now();
					$scope.activeParticipant.$update({ restrictToUserIds: $scope.participantUserIds });

					//console.log('saved last read date', $scope.activeParticipant.lastRead);
				}
				else
				{
					//console.log('..');
				}
			});
		};

		// Create new Message
		$scope.sendMessage = function() {
			// Create new Message object
			var message = new Messages ({
				text: $scope.messageText,
				chatroom: $scope.chatroom._id
			});


			// Redirect after save
			message.$save({ restrictToUserIds: $scope.participantUserIds }, function(response)
			{
				//$location.path('messages/' + response._id);

				// Clear form fields
				$scope.messageText = ''
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Message
		$scope.remove = function(message) {
			if ( message ) { 
				message.$remove();

				for (var i in $scope.messages) {
					if ($scope.messages [i] === message) {
						$scope.messages.splice(i, 1);
					}
				}
			} else {
				$scope.message.$remove(function() {
					$location.path('messages');
				});
			}
		};

		// Update existing Message
		$scope.update = function() {
			var message = $scope.message;

			message.$update(function() {
				$location.path('messages/' + message._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Messages
		$scope.find = function() {
			$scope.messages = Messages.query();
		};

		// Find existing Message
		$scope.findOne = function() {
			$scope.message = Messages.get({ 
				messageId: $stateParams.messageId
			});
		};
	}
]);
