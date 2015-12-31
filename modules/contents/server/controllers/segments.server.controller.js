'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Segment = mongoose.model('Segment'),
    Concept = mongoose.model('Concept'),
    Courseadmin = mongoose.model('Courseadmin'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');

/**
 * Create a Segment
 */
exports.create = function(req, res) {
    var segment = new Segment(req.body);
    segment.user = req.user;

    segment.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segment);
        }
    });
};

/**
 * Show the current Segment
 */
exports.read = function(req, res) {
    res.jsonp(req.source);
};

/**
 * Update a Segment
 */
exports.update = function(req, res) {
    var segment = req.segment ;

    segment = _.extend(segment , req.body);

    segment.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segment);
        }
    });
};

exports.deleteByList = function(segments, callback)
{
    var numberSegments = segments.length;
    var cbs = 0;

    segments.forEach(function(segment)
    {
        segment.remove(function()
        {
            Concept.find({ segments: { $in: [segment._id]} }).exec(function(err, concepts)
            {
                //todo remove segment id from concept, or change db to drop that.

                cbs++;

                if(cbs == numberSegments)
                {
                    callback();
                }
            });
        })
    });
};

/**
 * Delete a Segment
 */
exports.delete = function(req, res) {
    var segment = req.segment ;

    //todo also remove from course, and concept segments

    segment.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var deletedData = { Segment: [segment] };

            actions.doDelete(req.user, deletedData, function()
            {
                res.jsonp(segment);
            });
        }
    });
};

/**
 * List of Segments
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

    Segment.find(qObject).sort('+created').exec(function(err, segments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segments);
        }
    });
};

/**
 * Segment middleware
 */
exports.segmentByID = function(req, res, next, id) {
    Segment.findById(id).populate('user', 'displayName').exec(function(err, segment) {
        if (err) return next(err);
        if (! segment) return next(new Error('Failed to load Segment ' + id));
        req.segment = segment ;
        next();
    });
};

/**
 * Segment authorization middleware
 */
exports.isCourseContentEditor = function(req, res, next)
{
    var userId = req.user._id;
    var segmentCourses = req.body.courses;

    if(req.user.roles && (req.user.roles.indexOf("admin") != -1 || req.user.roles.indexOf("teacher") != -1))
    {
        next();
    }
    else
    {
        Courseadmin.find({user: userId}).exec(function(err, admins)
        {
            if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return segmentCourses.indexOf(courseId) !== -1 && ['content-editor', 'teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
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
