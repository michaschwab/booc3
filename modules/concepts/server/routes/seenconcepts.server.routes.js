'use strict';

module.exports = function (app)
{
	// User Routes
	var learnedConceptPolicy = require('../policies/seenconcepts.server.policies'),
		seenconcepts = require('../controllers/seenConcepts.server.controller');

	app.route('/api/seenconcepts')
		.get(seenconcepts.list)
		.post(seenconcepts.create);

	app.route('/api/seenconcepts/:learnedconceptId')
		.get(learnedConceptPolicy.isAllowed, seenconcepts.read)
		.put(learnedConceptPolicy.isAllowed, seenconcepts.update)
		.delete(learnedConceptPolicy.isAllowed, seenconcepts.delete);

	// Finish by binding the user middleware
	app.param('seenconceptId', seenconcepts.seenconceptByID);
};
