'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke concepts Permissions
 */

exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/concepts',
            permissions: '*'
        }, {
            resources: '/api/concepts/:conceptId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/concepts',
            permissions: ['get', 'post']
        }, {
            resources: '/api/concepts/:conceptId',
            permissions: ['get']
        }]
    }]);
};

var courseSpecificRights = {
    '/api/concepts': {
        'post': ['ta'], // only teaching assistants of a specific course can create dependencies in it
        'put': ['ta'] // only teaching assistants of a specific course can create dependencies in it
    },
    '/api/concepts/:conceptId': {
        'post': ['ta'], // only teachers of a specific course can edit it
        'put': ['ta'], // only teachers of a specific course can edit it
        'delete': ['ta'] // only teachers of a specific course can delete it
    }
};

/**
 * Check If concepts Policy Allows
 */
exports.isAllowed = function (req, res, next)
{
    var roles = (req.user) ? req.user.roles : ['guest'];

    if(req.concept || req.body)
    {
        var concept = req.concept || req.body;
        var courseIds = concept.courses;

        if(courseTeacherPolicy.checkCourseSpecificRights(req, courseSpecificRights, courseIds))
        {
            return next();
        }
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
