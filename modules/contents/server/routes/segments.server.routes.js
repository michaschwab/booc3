'use strict';

module.exports = function(app) {
	var segments = require('../controllers/segments.server.controller');

	// Courses Routes
	app.route('/segments')
		.get(segments.list)
		.post(segments.create);

	app.route('/segments/:segmentId')
		.get(segments.read)
		.put(segments.update)
		.delete(segments.delete);

	// Finish by binding the Course middleware
	app.param('segmentId', segments.segmentByID);
};
