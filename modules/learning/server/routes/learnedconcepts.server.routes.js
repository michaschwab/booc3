'use strict';

module.exports = function(app) {
    var learnedconcepts = require('../controllers/learnedconcepts.server.controller');

	// Concepts Routes
	app.route('/api/learnedconcepts')
		.get(learnedconcepts.list)
		.post(learnedconcepts.create);

	app.route('/api/learnedconcepts/:learnedconceptId')
		.get(learnedconcepts.read)
		.put(learnedconcepts.update)
        .delete(learnedconcepts.delete);
		//.delete(users.requiresLogin, learnedconcepts.hasAuthorization, learnedconcepts.delete);

	// Finish by binding the Concept middleware
	app.param('learnedconceptId', learnedconcepts.learnedconceptByID);




};
