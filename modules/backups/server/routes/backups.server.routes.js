'use strict';

module.exports = function(app)
{
    var backups = require('../controllers/backups.server.controller');
    //todo access checks.

    // Messages Routes
    app.route('/api/backups')
        .get(backups.listCourseIds)
        .post(backups.restore);

    app.route('/api/backups/:possiblyDeletedCourseId')
        .post(backups.create)
        .get(backups.list)
        .put(backups.update)
        .delete(backups.delete);

    app.route('/api/backups/:possiblyDeletedCourseId/readCourseNameFromFile')
        .get(backups.readCourseNameFromFile);

    app.route('/api/backups/:possiblyDeletedCourseId/:backupFileName')
        .get(backups.read);

    // Finish by binding the Backup middleware
    //app.param('backupId', backups.backupByID);
};
