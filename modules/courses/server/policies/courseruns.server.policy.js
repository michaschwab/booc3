'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

// Using the memory backend
acl = new acl(new acl.memoryBackend());


/*
app.route('/courseruns')
 .get(courseruns.list)
 .post(users.requiresLogin, users.isTeacher, courseruns.create); // Teachers can create courseruns

 app.route('/courseruns/:courserunId')
 .get(courseruns.read)
 .put(users.requiresLogin, users.isCourseTeacher, courseruns.update) // Course Teachers can edit own courserun
 .delete(users.requiresLogin, users.isCourseTeacher, courseruns.delete); // Course Teachers can delete own courserun*/

/**
 * Invoke Courses Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/courseruns',
            permissions: '*'
        }, {
            resources: '/api/courseruns/:courserunId',
            permissions: '*'
        }]
    }, {
        roles: ['teacher'],
        allows: [{
            resources: '/api/courseruns',
            permissions: ['get', 'put', 'post'] // 'global' teachers can create courseruns
        }, {
            resources: '/api/courseruns/:courserunId',
            permissions: ['get']
        }]
    }, {
        roles: ['user', 'guest'],
        allows: [{
            resources: '/api/courseruns',
            permissions: ['get']
        }, {
            resources: '/api/courseruns/:courserunId',
            permissions: ['get']
        }]
    }]);
};

var courserunSpecificRights = {
    '/api/courseruns/:courserunId': {
        'post': ['teacher'], // only teachers of a specific course can edit it
        'put': ['teacher'], // only teachers of a specific course can edit it
        'delete': ['teacher'] // only teachers of a specific course can delete it
    }
};

/**
 * Check If Course Policy Allows
 */
exports.isAllowed = function (req, res, next)
{
    var roles = (req.user) ? req.user.roles : ['guest'];
    var courseId = req.body.course;

    if(courseTeacherPolicy.checkCourseSpecificRights(req, courserunSpecificRights, courseId))
    {
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
    });
};
