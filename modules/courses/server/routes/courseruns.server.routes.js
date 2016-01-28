'use strict';

var courserunPolicy = require('../policies/courseruns.server.policy');
var courseruns = require('../controllers/courseruns.server.controller');

module.exports = function(app) {


	// Courseruns Routes
	app.route('/api/courseruns')
		.get(courserunPolicy.isAllowed, courseruns.list)
		.post(courserunPolicy.isAllowed, courseruns.create); // Teachers can create courseruns

	app.route('/api/courseruns/:courserunId')
		.get(courserunPolicy.isAllowed, courseruns.read)
		.put(courserunPolicy.isAllowed, courseruns.update) // Courserun Teachers can edit own courserun
		.post(courserunPolicy.isAllowed, courseruns.create) // for backup restore
		.delete(courserunPolicy.isAllowed, courseruns.delete); // Courserun Teachers can delete own courserun

	// Finish by binding the Courserun middleware
	app.param('courserunId', courseruns.courseRunByID);
};
