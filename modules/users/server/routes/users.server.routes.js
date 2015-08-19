'use strict';

module.exports = function (app) {
  // User Routes
  var userPolicy = require('../policies/user.server.policy'),
      users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  app.route('/api/users/:userId')
    .get(userPolicy.isAllowed, users.read)

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
