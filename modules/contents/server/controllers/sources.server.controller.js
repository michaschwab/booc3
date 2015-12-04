'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Source = mongoose.model('Source'),
    Segment = mongoose.model('Segment'),
    Courseadmin = mongoose.model('Courseadmin'),
    JSZip = require("jszip"),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');

/**
 * Create a source
 */
exports.create = function(req, res)
{
    var source = new Source(req.body);
    source.user = req.user;

    source.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(source);
        }
    });
};

/**
 * Show the current Source
 */
exports.read = function(req, res) {
    res.jsonp(req.source);
};

/**
 * Update a Source
 */
exports.update = function(req, res) {
    var source = req.source ;

    source = _.extend(source , req.body);

    source.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(source);
        }
    });
};

/**
 * Delete an Course
 */
exports.delete = function(req, res)
{
    var source = req.source ;
    var sourceId = source._id;

    var segmentQuery = { source: sourceId };

    //todo also delete all segments, and remove the concept segment entries
    Segment.find(segmentQuery).exec(function(err, segments)
    {
        // TODO remove from concept segment list

        Segment.remove(segmentQuery).exec(function(err)
        {
            source.remove(function(err)
            {
                if (err)
                {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                else
                {
                    var deletedData = { Segment: segments, Source: [source] };

                    actions.doDelete(req.user, deletedData, function()
                    {
                        res.jsonp(source);
                    });

                    res.jsonp(source);
                }
            });
        });
    });
};

exports.uploadLectureSlides = function(req, res)
{
    var buffer = req.files.file.buffer;
    var zip = new JSZip(buffer);

    var fileNames = Object.keys(zip.files);

    var xmlFileNames = fileNames.filter(function(fName) { return fName.substr(fName.length-4) === '.xml'});

    if(xmlFileNames.length !== 1)
    {
        return res.status(400).send({
            message: 'Did not find 1 XML file, but ' + xmlFileNames.length
        });
    }
    var xmlFileName = xmlFileNames[0];

    var materialsFolderNames = fileNames.filter(function(fName) { return fName === 'materials/'; });

    if(materialsFolderNames.length !== 1)
    {
        return res.status(400).send({
            message: 'Did not find 1 Materials folder, but ' + materialsFolderNames.length
        });
    }

    var xmlFile = zip.files[xmlFileNames[0]];
    var xmlFileContent = zip.file(xmlFileName).asText();

    // TODO: Save all PDFs on the server.
    // TODO: Parse xmlFileContent with xml reader (figure out video - slides synchronization), then save in DB, and return to client.

    res.jsonp({a: 'test'});
};

/**
 * List of Courses
 */
exports.list = function(req, res) {

    var qObject = {};

    // allowed query parameters:
    if (req.query['_id']){
        qObject['_id'] = new ObjectId(req.query['_id']);
    }
    if (req.query['courses']){
        qObject['courses'] = new ObjectId(req.query['courses']);
    }

    Source.find(qObject).sort('+created').exec(function(err, sources) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sources);
        }
    });
};

/**
 * Course middleware
 */
exports.sourceByID = function(req, res, next, id) {
    Source.findById(id).populate('user', 'displayName').exec(function(err, source) {
        if (err) return next(err);
        if (! source) return next(new Error('Failed to load Source ' + id));
        req.source = source ;
        next();
    });
};

/**
 * Course authorization middleware
 */

exports.isCourseContentEditor = function(req, res, next)
{
    var userId = req.user._id;
    var sourceCourses = req.body.courses;

    if(req.user.roles && (req.user.roles.indexOf("admin") != -1 || req.user.roles.indexOf("teacher") != -1))
    {
        next();
    }
    else
    {
        Courseadmin.find({user: userId}).exec(function(err, admins)
        {
            if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return sourceCourses.indexOf(courseId) !== -1 && ['content-editor', 'teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
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
