'use strict';

module.exports = function(app) {
	var concepts = require('../controllers/concepts.server.controller');
	var conceptPolicies = require('../policies/concepts.server.policies');

	// Concepts Routes
	app.route('/api/concepts')
		.get(conceptPolicies.isAllowed, concepts.list)
		.post(conceptPolicies.isAllowed, concepts.create);

	app.route('/api/concepts/:conceptId')
		.get(conceptPolicies.isAllowed, concepts.read)
		.post(conceptPolicies.isAllowed, concepts.create)
		.put(conceptPolicies.isAllowed, concepts.update)
		.delete(conceptPolicies.isAllowed, concepts.delete);

	// Finish by binding the Concept middleware
	app.param('conceptId', concepts.conceptByID);




};
