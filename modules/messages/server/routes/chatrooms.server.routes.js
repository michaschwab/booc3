'use strict';

module.exports = function(app) {
    var chatrooms = require('../controllers/chatrooms.server.controller');

    // Messages Routes
    app.route('/chatrooms')
        .post(chatrooms.create);

    app.route('/chatrooms/:chatroomId')
        .get(chatrooms.read)
        .put(chatrooms.update)
        .delete(chatrooms.delete);

    // Finish by binding the Message middleware
    app.param('chatroomId', chatrooms.chatroomByID);
};
