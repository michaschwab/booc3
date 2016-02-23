'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Segmentgroup = mongoose.model('Segmentgroup'),
    Concept = mongoose.model('Concept'),
    Courseadmin = mongoose.model('Courseadmin'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');

/**
 * Create a Segmentgroup
 */
exports.create = function(req, res) {
    var segmentgroup = new Segmentgroup(req.body);
    segmentgroup.user = req.user;

    segmentgroup.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segmentgroup);
        }
    });
};

/**
 * Show the current Segmentgroup
 */
exports.read = function(req, res) {
    res.jsonp(req.source);
};

/**
 * Update a Segmentgroup
 */
exports.update = function(req, res) {
    var segmentgroup = req.segmentgroup ;

    segmentgroup = _.extend(segmentgroup , req.body);

    segmentgroup.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segmentgroup);
        }
    });
};

exports.deleteByList = function(segmentgroups, callback)
{
    var numberSegmentgroups = segmentgroups.length;
    var cbs = 0;

    segmentgroups.forEach(function(segmentgroup)
    {
        segmentgroup.remove(function()
        {
            Concept.find({ segmentgroups: { $in: [segmentgroup._id]} }).exec(function(err, concepts)
            {
                //todo remove segmentgroup id from concept, or change db to drop that.

                cbs++;

                if(cbs == numberSegmentgroups)
                {
                    callback();
                }
            });
        })
    });
};

/**
 * Delete a Segmentgroup
 */
exports.delete = function(req, res) {
    var segmentgroup = req.segmentgroup ;

    //todo also remove from course, and concept segmentgroups

    segmentgroup.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var deletedData = { Segmentgroup: [segmentgroup] };

            actions.doDelete(req.user, deletedData, function()
            {
                res.jsonp(segmentgroup);
            });
        }
    });
};

/**
 * List of Segmentgroups
 */
exports.list = function(req, res) {

    var qObject = {};

    // allowed query parameters:
    if (req.query['courses']){
        qObject['courses'] = [new ObjectId(req.query['courses'])];
    }
    if (req.query['_id']){
        qObject['_id'] = new ObjectId(req.query['_id']);
    }
    if(typeof req.query['sources'] == 'string')
    {
        if(!req.query['sources'])
        {
            res.jsonp([]);
            return;
        }

        qObject['source'] = { '$in': req.query['sources'].split(';')};
    }

    Segmentgroup.find(qObject).sort('+created').exec(function(err, segmentgroups) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segmentgroups);
        }
    });
};

/**
 * Segmentgroup middleware
 */
exports.segmentgroupByID = function(req, res, next, id) {
    Segmentgroup.findById(id).populate('user', 'displayName').exec(function(err, segmentgroup) {
        if (err) return next(err);
        if (! segmentgroup)
        {
            // For POST requests, allow it to specify a Segmentgroup via ID that might not exist (yet). This allows creation of concepts with specific ID.
            if(req.method != 'POST')
                return next(new Error('Failed to load Segmentgroup ' + id));
        }
        req.segmentgroup = segmentgroup ;
        next();
    });
};

/**
 * Segmentgroup authorization middleware
 */
exports.isCourseContentEditor = function(req, res, next)
{
    var userId = req.user._id;
    var segmentgroupCourses = req.body.courses;

    if(req.user.roles && (req.user.roles.indexOf("admin") != -1 || req.user.roles.indexOf("teacher") != -1))
    {
        next();
    }
    else
    {
        Courseadmin.find({user: userId}).exec(function(err, admins)
        {
            if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return segmentgroupCourses.indexOf(courseId) !== -1 && ['content-editor', 'teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
            {
                return res.status(403).send('User is not authorized: need content editor permission for this course');
            }
            else
            {
                next();
            }
        });
    }
};
