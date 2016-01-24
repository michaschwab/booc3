'use strict';

module.exports = function(app)
{
    var logs = require('../controllers/logs.server.controller');
    
    // Messages Routes
    app.route('/api/logs')
        .get(logs.list)
        .post(logs.create);

    app.route('/api/logs/:logId')
        .get(logs.read)
        .put(logs.update)
        .delete(logs.delete);

    // Finish by binding the Action middleware
    app.param('logId', logs.logByID);
};
