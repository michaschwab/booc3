'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash'),

    Course = mongoose.model('Course'),
    Concept = mongoose.model('Concept'),
    Conceptdependency = mongoose.model('Conceptdependency'),
    Courseevent = mongoose.model('Courseevent'),
    Source = mongoose.model('Source'),
    Segment = mongoose.model('Segment');

var ObjectId = mongoose.Types.ObjectId;

var io;

exports.setIo = function(newIo)
{
    io = newIo;
};

/**
 * Create a Backup
 */
exports.create = function(req, res)
{
    var courseId = req.params.courseId;

    console.log(courseId);
    var backup = {};

    Course.findById(courseId).exec(function(err, course)
    {
        backup.course = course;
        Concept.find({courses: { $in: [courseId]}}).exec(function(err, concepts)
        {
            backup.concepts = concepts;

            Conceptdependency.find({course: courseId}).exec(function(err, conceptdependencies)
            {
                backup.conceptdependencies = conceptdependencies;

                Courseevent.find({course: courseId}).exec(function(err, courseevents)
                {
                    backup.courseevents = courseevents;

                    Source.find({courses: { $in: [courseId]}}).exec(function(err, sources)
                    {
                        backup.sources = sources;
                        var sourceIds = backup.sources.map(function(s) { return s._id; });

                        Segment.find({source: { $in: sourceIds}}).exec(function(err, segments)
                        {
                            backup.segments = segments;

                            exports.saveFile(courseId, backup, function(error, fileName)
                            {
                                if(error) console.error(error);
                                return res.jsonp(fileName);
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.saveFile = function(courseId, backupData, callback)
{
    var subDir = courseId;
    var fileName = new Date().toISOString();
    var fullDir = './modules/backups/server/uploads/' + subDir;

    fs.stat(fullDir, function(err, stats)
    {
        if(err)
        {
            fs.mkdirSync(fullDir);
        }
        fs.writeFile(fullDir + '/' + fileName + '.json', JSON.stringify(backupData), function (uploadError)
        {
            callback(uploadError, fileName + '.json');
        });
    });
};


exports.restore = function(req, res)
{
    var data = req.body;

    res.jsonp(data);

    /*console.log('Concepts: ' + data.concepts.length);
    console.log(data.concepts[0]);*/
};


/**
 * List of backups
 */
exports.list = function(req, res)
{
    var courseId = req.params.courseId;

    var subDir = courseId;
    var fullDir = './modules/backups/server/uploads/' + subDir;

    fs.readdir(fullDir, function(err, files)
    {
        res.jsonp(files);
    });
    //res.jsonp(req.backup);
};


/**
 * Show backups
 */
exports.read = function(req, res)
{
    var courseId = req.params.courseId;
    var backupFileName = req.params.backupFileName;
    var fullPath = './modules/backups/server/uploads/' + courseId + '/' + backupFileName;

    fs.readFile(fullPath, function(err, data)
    {
        //res.jsonp(data);
        res.send(data);
    });
};

/**
 * Update a backup
 */
exports.update = function(req, res) {
    var backup = req.backup ;

    backup = _.extend(backup , req.body);

    backup.save(function(err) {
        if (err) {
            return res.status(400).send({
                backup: err
            });
        } else {
            res.jsonp(backup);
        }
    });
};

/**
 * Delete an backup
 */
exports.delete = function(req, res) {
    var backup = req.backup ;

    backup.remove(function(err) {
        if (err) {
            return res.status(400).send({
                backup: err
            });
        } else {
            res.jsonp(backup);
        }
    });
};



/**
 * backup middleware
 */
exports.backupByID = function(req, res, next, id) {
    /*backup.findById(id).exec(function(err, backup) {
        if (err) return next(err);
        if (! backup) return next(new Error('Failed to load backup ' + id));
        req.backup = backup ;
        next();
    });*/
};

exports.backupsByUserId = function(req, res, next, id)
{
    /*var qObject = { user: id };

    backup.find(qObject).exec(function(err, backups) {
        if (err) return next(err);
        if (! backups) return next(new Error('Failed to load backup ' + id));
        req.backup = backups ;
        next();
    });*/
    next();
};

/**
 * backup authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.backup.user != req.user.id) {
        return res.status(403).send('User is not authorized' + req.backup.user + ' !== ' + req.user.id);
    }
    next();
};
