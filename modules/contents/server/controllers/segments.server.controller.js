'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Segment = mongoose.model('Segment'),
    Segmentgroup = mongoose.model('Segmentgroup'),
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
exports.update = function(req, res)
{
    var segment = req.segment ;

    segment = _.extend(segment , req.body);

    segment.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(segment);
        }
    });
};

var updateGroups = function(updateGroups, callback)
{
    var groupCallbacks = 0;
    var callbackErr = null;

    updateGroups.forEach(function(updateGroup)
    {
        Segmentgroup.findById(updateGroup._id).exec(function(err, group)
        {
            group = _.extend(group, updateGroup);
            group.save(function(err)
            {
                groupCallbacks++;

                if(err)
                {
                    callbackErr = err;
                }

                if(groupCallbacks == updateGroups.length)
                {
                    callback(callbackErr);
                }
            });
        });
    });
};

var updateSegments = function(updateSegments, callback)
{
    var expectedCallbacks = updateSegments.length;
    var receivedCallbacks = 0;

    var callbackErr = null;

    Segment.find().exec(function(err, allSegments)
    {
        updateSegments.forEach(function(updateSegment)
        {
            var sameSegments = allSegments.filter(function(seg)
            {
                return seg._id == updateSegment._id;
            });
            if(sameSegments.length)
            {
                var segment = sameSegments[0];

                segment = _.extend(segment, updateSegment);

                segment.save(function(err)
                {
                    receivedCallbacks++;

                    if(err)
                    {
                        callbackErr = err;
                    }

                    if(receivedCallbacks == expectedCallbacks)
                    {
                        callback(callbackErr);
                    }
                });
            }
            else
            {
                console.error('could not find a segment for which update was scheduled:', updateSegment);
                expectedCallbacks--;
            }
        });
    });
};

exports.updateMany = function(req, res)
{
    var updateData = req.body;

    updateGroups(updateData.groups, function(err)
    {
        updateSegments(updateData.segments, function(callbackErr)
        {
            if (callbackErr) {
                console.log(callbackErr);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(callbackErr)
                });
            } else {
                res.jsonp(updateSegments);
            }
        });
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
        if (! segment)
        {
            // For POST requests, allow it to specify a Segment via ID that might not exist (yet). This allows creation of concepts with specific ID.
            if(req.method != 'POST')
                return next(new Error('Failed to load Segment ' + id));
        }
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
