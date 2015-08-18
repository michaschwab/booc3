'use strict';

module.exports = function(app)
{
    var actions = require('../controllers/actions.server.controller');
    
    // Messages Routes
    app.route('/api/actions')
        .get(actions.list)
        .post(actions.create);

    app.route('/api/actions/:actionId')
        .get(actions.read)
        .put(actions.update)
        .delete(actions.delete);

    // Finish by binding the Action middleware
    app.param('actionId', actions.actionByID);
};
