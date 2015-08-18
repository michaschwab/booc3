'use strict';

module.exports = function(app) {
    var chatrooms = require('../controllers/chatrooms.server.controller');

    // Messages Routes
    app.route('/api/chatrooms')
        .post(chatrooms.create);

    app.route('/api/chatrooms/:chatroomId')
        .get(chatrooms.read)
        .put(chatrooms.update)
        .delete(chatrooms.delete);

    // Finish by binding the Message middleware
    app.param('chatroomId', chatrooms.chatroomByID);
};
