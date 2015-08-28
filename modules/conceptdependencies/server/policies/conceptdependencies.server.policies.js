'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

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
    }]);
};

var courseSpecificRights = {
    '/api/conceptdependencies': {
        'post': ['ta'], // only teaching assistants of a specific course can create dependencies in it
        'put': ['ta'] // only teaching assistants of a specific course can create dependencies in it
    },
    '/api/conceptdependencies/:conceptdependencyId': {
        'post': ['ta'], // only teachers of a specific course can edit it
        'put': ['ta'], // only teachers of a specific course can edit it
        'delete': ['ta'] // only teachers of a specific course can delete it
    }
};

/**
 * Check If Conceptdependencies Policy Allows
 */
exports.isAllowed = function (req, res, next)
{
    var roles = (req.user) ? req.user.roles : ['guest'];
    var courseId = req.conceptdependency.courseId;

    if(courseTeacherPolicy.checkCourseSpecificRights(req, courseSpecificRights, courseId))
    {
        next();
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
    });
};
