'use strict';

module.exports = function(app) {
	var sources = require('../controllers/sources.server.controller');

	// Sources Routes
	app.route('/api/sources')
		.get(sources.list)
		.post(sources.create);

	app.route('/api/sources/lectureZip')
			.post(sources.uploadLectureSlides);

	app.route('/api/sources/pdf')
			.post(sources.uploadPdf);

	app.route('/api/sources/:sourceId')
		.get(sources.read)
		.put(sources.update)
		.delete(sources.delete);

	app.route('/api/sources/:sourceId/pdf')
		.get(sources.readPdf);

	// Finish by binding the Course middleware
	app.param('sourceId', sources.sourceByID);
};
