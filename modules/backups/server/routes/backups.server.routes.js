'use strict';

module.exports = function(app)
{
    var backups = require('../controllers/backups.server.controller');

    // Messages Routes
    app.route('/api/backups')
        .get(backups.list)
        .post(backups.create);

    app.route('/api/backups/:courseId')
        .get(backups.read)
        .put(backups.update)
        .delete(backups.delete);

    // Finish by binding the Backup middleware
    app.param('backupId', backups.backupByID);
};
