'use strict';

module.exports = function (app)
{
	// User Routes
	var learnedConceptPolicy = require('../policies/learnedconcepts.server.policies'),
		learnedconcepts = require('../controllers/learnedconcepts.server.controller');

	app.route('/api/learnedconcepts')
		.get(learnedconcepts.list)
		.post(learnedconcepts.create);

	app.route('/api/progress/reset')
		.get(learnedconcepts.reset);

	app.route('/api/learnedconcepts/:learnedconceptId')
		.get(learnedConceptPolicy.isAllowed, learnedconcepts.read)
		.put(learnedConceptPolicy.isAllowed, learnedconcepts.update)
		.delete(learnedConceptPolicy.isAllowed, learnedconcepts.delete);

	// Finish by binding the user middleware
	app.param('learnedconceptId', learnedconcepts.learnedconceptByID);
};
