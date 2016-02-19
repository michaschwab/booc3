'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke comments Permissions
 */

exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/comments',
            permissions: '*'
        }, {
            resources: '/api/comments/:commentId',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/comments',
            permissions: ['get', 'post']
        }, {
            resources: '/api/comments/:commentId',
            permissions: ['get']
        }]
    }]);
};

var courseSpecificRights = {
    '/api/comments': {
        'post': ['ta'], // only teaching assistants of a specific course can create dependencies in it
        'put': ['ta'] // only teaching assistants of a specific course can create dependencies in it
    },
    '/api/comments/:commentId': {
        'post': ['ta'], // only teachers of a specific course can edit it
        'put': ['ta'], // only teachers of a specific course can edit it
        'delete': ['ta'] // only teachers of a specific course can delete it
    }
};

/**
 * Check If comments Policy Allows
 */
exports.isAllowed = function (req, res, next)
{
    var roles = (req.user) ? req.user.roles : ['guest'];

    if(req.comment || req.body)
    {
        var comment = req.comment || req.body;
        var courseIds = comment.courses;

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
