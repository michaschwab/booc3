'use strict';

//var coursePolicy = require('../policies/courses.server.policy');
var tags = require('../controllers/tags.server.controller');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

module.exports = function(app) {


    // Courses Routes
    app.route('/api/tags')
        .get(courseTeacherPolicy.hasAnyPrivileges, tags.list)
        .post(courseTeacherPolicy.hasAnyPrivileges, tags.create); // Teachers can create courses

    app.route('/api/courses/:courseId')
        .get(courseTeacherPolicy.hasAnyPrivileges, tags.read)
        .put(courseTeacherPolicy.hasAnyPrivileges, tags.update) // Course Teachers can edit own course
        .delete(courseTeacherPolicy.hasAnyPrivileges, tags.delete); // Course Teachers can delete own course

    // Finish by binding the Course middleware
    app.param('tagId', tags.tagByID);
};
