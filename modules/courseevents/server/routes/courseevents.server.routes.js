'use strict';

module.exports = function(app) {
    var courseevents = require('../controllers/courseevents.server.controller');

    // Messages Routes
    app.route('/api/courseevents')
        .get(courseevents.list)
        .post(courseevents.create); // need to be teacher, and a teacher of that course of that course, to be able to add other course evebts
    
    app.route('/api/courseevents/:courseeventId')
        .get(courseevents.read)
        .put(courseevents.update)
        .delete(courseevents.delete);
    
    // Finish by binding the Message middleware
    app.param('courseeventId', courseevents.courseeventByID);
};
