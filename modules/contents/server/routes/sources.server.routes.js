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

	app.route('/api/sources/:sourceId/pdfMerge')
		.get(sources.mergeLectureSlides);

	app.route('/api/sources/:sourceId')
		.get(sources.read)
		.post(sources.create)
		.put(sources.update)
		.delete(sources.delete);

	app.route('/api/sources/:sourceId/pdf')
		.get(sources.readPdf);

	app.route('/api/websiteIsEmbeddable')
		.get(sources.isEmbeddable);
	app.route('/api/websiteHasHttpsVersion')
		.get(sources.hasHttpsVersion);

	// Finish by binding the Course middleware
	app.param('sourceId', sources.sourceByID);
};
