'use strict';

module.exports = function(app) {
	var courses = require('../controllers/courses.server.controller');

	// Courses Routes
	app.route('/api/courses')
		.get(courses.list)
		.post(courses.create); // Teachers can create courses

	app.route('/api/courses/:courseId')
		.get(courses.read)
		.put(courses.update) // Course Teachers can edit own course
		.delete(courses.delete); // Course Teachers can delete own course

	// Finish by binding the Course middleware
	app.param('courseId', courses.courseByID);
};
