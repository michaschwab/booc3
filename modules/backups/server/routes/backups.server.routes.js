'use strict';

module.exports = function(app)
{
    var backups = require('../controllers/backups.server.controller');

    // Messages Routes
    app.route('/api/backups')
        //.get(backups.list)
        .post(backups.restore);

    app.route('/api/backups/:courseId')
        .post(backups.create)
        .get(backups.list)
        .put(backups.update)
        .delete(backups.delete);

    app.route('/api/backups/:courseId/:backupFileName')
        .get(backups.read);

    // Finish by binding the Backup middleware
    //app.param('backupId', backups.backupByID);
};
