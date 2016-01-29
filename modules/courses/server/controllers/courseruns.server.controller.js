'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    courseAdmin = require(path.resolve('./modules/users/server/controllers/courseadmin.server.controller')),
    concepts = require(path.resolve('./modules/concepts/server/controllers/concepts.server.controller')),
    actions = require(path.resolve('./modules/actions/server/controllers/actions.server.controller')),
    CourseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper'),
    CourseRun = mongoose.model('CourseRun'),
    _ = require('lodash');

/**
 * Create a CourseRun
 */
exports.create = function(req, res)
{
    var courseRun = new CourseRun(req.body);
    courseRun.user = req.user;

    courseRun.save(function(err)
    {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else
        {
            // todo ensure that the creating user is made courseRun admin.
            courseAdmin.addTeacherRole(courseRun.user, courseRun._id, function(err)
            {
                if(err) console.log(err);
                res.jsonp(courseRun);
            });

        }
    });
};

/**
 * Show the current CourseRun
 */
exports.read = function(req, res) {
    res.jsonp(req.courseRun);
};

/**
 * Update a CourseRun
 */
exports.update = function(req, res) {
    var courseRun = req.courseRun ;

    courseRun = _.extend(courseRun , req.body);

    courseRun.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(courseRun);
        }
    });
};

/**
 * Delete an CourseRun
 */
exports.delete = function(req, res)
{
    var courseRun = req.courseRun;

    courseRun.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(courseRun);
        }
    });
};

/**
 * List of CourseRuns
 */
exports.list = function(req, res)
{
    var hasPrivileges = CourseTeacherPolicy.hasAnyPrivileges(req);

    var limit = {};
    if(req.query['course'])
    {
        limit.course = req.query.course;
    }

    CourseRun.find(limit).sort('+created').exec(function(err, courseRuns) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(courseRuns);
        }
    });
};

/**
 * CourseRun middleware
 */
exports.courseRunByID = function(req, res, next, id) {
    CourseRun.findById(id).exec(function(err, courseRun) {
        if (err) return next(err);
        if (! courseRun)
        {
            res.status(404);
            return next(new Error('Failed to load CourseRun ' + id));
        }
        req.courseRun = courseRun ;
        next();
    });
};

