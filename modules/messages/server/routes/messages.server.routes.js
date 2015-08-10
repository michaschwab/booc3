'use strict';

module.exports = function(app) {
	var messages = require('../controllers/messages.server.controller');

	// Messages Routes
	app.route('/messages')
		.get(messages.list)
		.post(messages.create);

	app.route('/messages/:messageId')
		.get(messages.read) // Only members of a chatroom can read messages
		.put(messages.update) // Only admins can edit messages
		.delete(messages.delete); // Only admins can delete messages

	// Finish by binding the Message middleware
	app.param('messageId', messages.messageByID);
};
