'use strict';

/**
 * Module dependencies.
 */

/**
 * Invoke Admin Permissions
 */


/**
 * Check If Admin Policy Allows
 */
exports.isCourseTeacher = function (req, res, next)
{
    if (hasCourseRole('teacher', req, res))
    {
        return next();
    }

    return res.status(403).json({
        message: 'User is not authorized'
    });
};

exports.isCourseTeachingAssistant = function (req, res, next)
{
    if (hasCourseRole('ta', req, res) || hasCourseRole('teacher', req, res))
    {
        return next();
    }

    return res.status(403).json({
        message: 'User is not authorized'
    });
};

exports.isCourseContentEditor = function (req, res, next)
{
    if (hasCourseRole('content-editor', req, res) || hasCourseRole('ta', req, res) || hasCourseRole('teacher', req, res))
    {
        return next();
    }

    return res.status(403).json({
        message: 'User is not authorized'
    });
};

exports.hasCourseRole = function(role, userRoles, courseId)
{
    var completeRole = 'courseadmin;' + role + ';' + courseId;
    //console.log('checking if user has role ' + completeRole);

    return userRoles.indexOf(completeRole) !== -1;
};

exports.hasAnyCourseRole = function(roles, userRoles, courseId)
{
    for(var i = 0; i < roles.length; i++)
    {
        var role = roles[i];

        if(exports.hasCourseRole(role, userRoles, courseId))
        {
            return true;
        }
    }
    return false;
};

exports.hasAnyPrivileges = function(req)
{
    var roles = (req.user) ? req.user.roles : ['guest'];
    var hasPrivileges = false;

    roles.forEach(function(role)
    {
        if(role == 'admin' || role == 'teacher' || role.substr('courseadmin'.length) == 'courseadmin')
        {
            hasPrivileges = true;
        }
    });

    return hasPrivileges;
};

exports.checkCourseSpecificRights = function(req, courseSpecificRights, courseIds)
{
    var roles = (req.user) ? req.user.roles : ['guest'];
    if(!Array.isArray(courseIds)) courseIds = [courseIds];

    if(courseSpecificRights[req.route.path])
    {
        var specificRights = courseSpecificRights[req.route.path];
        var method = req.method.toLowerCase();

        if(specificRights[method])
        {
            for(var i = 0; i < courseIds.length; i++)
            {
                var courseId = courseIds[i];

                if(exports.hasAnyCourseRole(specificRights[method], roles, courseId))
                {
                    return true;
                }
            }

        }
    }
    return false;
};

function hasCourseRole(role, req, res)
{
    var courseId = typeof req.course == 'object' ? req.course._id : req.course;
    var completeRole = 'courseadmin;' + role + ';' + courseId;
    var roles = (req.user) ? req.user.roles : ['guest'];

    return roles.indexOf(completeRole) !== -1;
}
