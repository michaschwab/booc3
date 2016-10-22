'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

// Using the memory backend
acl = new acl(new acl.memoryBackend());


/*
app.route('/courses')
 .get(courses.list)
 .post(users.requiresLogin, users.isTeacher, courses.create); // Teachers can create courses

 app.route('/courses/:courseId')
 .get(courses.read)
 .put(users.requiresLogin, users.isCourseTeacher, courses.update) // Course Teachers can edit own course
 .delete(users.requiresLogin, users.isCourseTeacher, courses.delete); // Course Teachers can delete own course*/

/**
 * Invoke Courses Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['admin'],
        allows: [{
            resources: '/api/courses',
            permissions: '*'
        }, {
            resources: '/api/courses/:courseId',
            permissions: '*'
        }]
    }, {
        roles: ['teacher'],
        allows: [{
            resources: '/api/courses',
            permissions: ['get', 'put', 'post'] // 'global' teachers can create courses
        }, {
            resources: '/api/courses/:courseId',
            permissions: ['get']
        }]
    }, {
        roles: ['user', 'guest'],
        allows: [{
            resources: '/api/courses',
            permissions: ['get']
        }, {
            resources: '/api/courses/:courseId',
            permissions: ['get']
        }]
    }]);
};

var courseSpecificRights = {
    '/api/courses/:courseId': {
        'put': ['teacher'], // only teachers of a specific course can edit it
        'delete': ['teacher'] // only teachers of a specific course can delete it
    },
    '/api/courses/:deletedCourseId': {
        'post': ['teacher'] // only teachers of a specific course can restore it
    }
};

/**
 * Check If Course Policy Allows
 */
exports.isAllowed = function (req, res, next)
{
    var roles = (req.user) ? req.user.roles : ['guest'];
    var courseId = typeof req.course == 'object' ? req.course._id : req.course;
    if(req.body._id) courseId = req.body._id;

    if(courseTeacherPolicy.checkCourseSpecificRights(req, courseSpecificRights, courseId))
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
