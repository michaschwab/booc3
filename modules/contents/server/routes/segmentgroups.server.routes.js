'use strict';

module.exports = function(app) {
	var segmentgroups = require('../controllers/segmentgroups.server.controller');

	// Courses Routes
	app.route('/api/segmentgroups')
		.get(segmentgroups.list)
		.post(segmentgroups.create);

	app.route('/api/segmentgroups/:segmentgroupId')
		.get(segmentgroups.read)
		.put(segmentgroups.update)
		.delete(segmentgroups.delete)
		.post(segmentgroups.create);

	// Finish by binding the Course middleware
	app.param('segmentgroupId', segmentgroups.segmentgroupByID);
};
