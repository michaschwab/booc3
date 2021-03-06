'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());


/*
 app.route('/courseevents')
 .get(users.requiresLogin, courseevents.list)
 .post(users.requiresLogin, users.isCourseTa, courseevents.create); // need to be teacher, and a teacher of that course of that course, to be able to add other course evebts

 app.route('/courseevents/:courseeventId')
 .get(users.requiresLogin, courseevents.read)
 .put(users.requiresLogin, users.isCourseTa, courseevents.update)
 .delete(users.requiresLogin, users.isCourseTa, courseevents.delete);
* */

/**
 * Invoke Conceptdependencies Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/conceptdependencies',
            permissions: '*'
        }, {
            resources: '/api/conceptdependencies/:conceptdependencyId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/conceptdependencies',
            permissions: ['get', 'post']
        }, {
            resources: '/api/conceptdependencies/:conceptdependencyId',
            permissions: ['get']
        }]
    }, {
        roles: ['guest'],
        allows: [{
            resources: '/api/conceptdependencies',
            permissions: ['get']
        }, {
            resources: '/api/conceptdependencies/:conceptdependencyId',
            permissions: ['get']
        }]
    }]);
};

/**
 * Check If Conceptdependencies Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    /*var roles = (req.user) ? req.user.roles : ['guest'];
    
    // If an conceptdependency is being processed and the current user created it then allow any manipulation
    if (req.conceptdependency && req.user && req.conceptdependency.user.id === req.user.id) {
        return next();
    }
    
    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });*/
};
