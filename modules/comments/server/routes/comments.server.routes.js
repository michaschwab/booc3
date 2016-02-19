'use strict';

module.exports = function(app) {
	var comments = require('../controllers/comments.server.controller');
	var commentPolicies = require('../policies/comments.server.policies');

	// Concepts Routes
	app.route('/api/comments')
		.get(commentPolicies.isAllowed, comments.list)
		.post(commentPolicies.isAllowed, comments.create);

	app.route('/api/comments/:commentId')
		.get(commentPolicies.isAllowed, comments.read)
		.post(commentPolicies.isAllowed, comments.create)
		.put(commentPolicies.isAllowed, comments.update)
		.delete(commentPolicies.isAllowed, comments.delete);

	// Finish by binding the Concept middleware
	app.param('commentId', comments.commentByID);




};
