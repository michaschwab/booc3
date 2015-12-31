'use strict';

module.exports = function(app) {
	var segments = require('../controllers/segments.server.controller');

	// Courses Routes
	app.route('/api/segments')
		.get(segments.list)
		.post(segments.create);

	app.route('/api/segments/:segmentId')
		.get(segments.read)
		.put(segments.update)
		.delete(segments.delete)
		.post(segments.create);

	// Finish by binding the Course middleware
	app.param('segmentId', segments.segmentByID);
};
