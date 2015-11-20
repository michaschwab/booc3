'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.addTeacherRole = function(userId, courseId, callback)
{
    var roleName = 'courseadmin;teacher;' + courseId;

    User.findById(userId, '-salt -password').exec(function (err, user)
    {
        if (err)
        {
            return err;
        }
        else if (!user)
        {
            return 'didnt find user';
            //return next(new Error('Failed to load user ' + id));
        }
        user.roles.push(roleName);
        user.save(callback);

        /*req.model = user;
        next();*/
    });
};

exports.getCourseAdmins = function(courseId, callback)
{
    User.find({}, function(err, users)
    {
        var admins = users.filter(function(user)
        {
            for(var i = 0; i < user.roles.length; i++)
            {
                var roleParts = user.roles[i].split(';');

                if(roleParts[0] == 'courseadmin' && roleParts[2] == courseId)
                    return true;
            }

            return false;
        });

        callback(admins);

    });
};
