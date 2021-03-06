'use strict';

module.exports = function(app) {
    var chatparticipants = require('../controllers/chatparticipants.server.controller');

    // Messages Routes
    app.route('/api/chatparticipants')
        .get(chatparticipants.list)
        .post(chatparticipants.create);

    app.route('/api/chatparticipants/:chatparticipantId')
        .get(chatparticipants.read)
        .post(chatparticipants.update)
        .put(chatparticipants.update)
        .delete(chatparticipants.delete);

    // Finish by binding the Message middleware
    app.param('chatparticipantId', chatparticipants.chatparticipantByID);
};
