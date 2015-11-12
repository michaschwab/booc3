'use strict';

var coursePolicy = require('../policies/courses.server.policy');
var courses = require('../controllers/courses.server.controller');

module.exports = function(app) {


	// Courses Routes
	app.route('/api/courses')
		.get(coursePolicy.isAllowed, courses.list)
		.post(coursePolicy.isAllowed, courses.create); // Teachers can create courses

	app.route('/api/courses/:courseId')
		.get(coursePolicy.isAllowed, courses.read)
		.put(coursePolicy.isAllowed, courses.update) // Course Teachers can edit own course
		.post(coursePolicy.isAllowed, courses.create) // for backup restore
		.delete(coursePolicy.isAllowed, courses.delete); // Course Teachers can delete own course

	// Finish by binding the Course middleware
	app.param('courseId', courses.courseByID);
};
