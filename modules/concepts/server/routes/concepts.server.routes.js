'use strict';

module.exports = function(app) {
	var concepts = require('../controllers/concepts.server.controller');

	// Concepts Routes
	app.route('/api/concepts')
		.get(concepts.list)
		.post(concepts.create);

	app.route('/api/concepts/:conceptId')
		.get(concepts.read)
		.post(concepts.create)
		.put(concepts.update)
		.delete(concepts.delete);

	// Finish by binding the Concept middleware
	app.param('conceptId', concepts.conceptByID);




};
