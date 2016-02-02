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
    var courseId = req.params.possiblyDeletedCourseId;
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

exports.readCourseNameFromFile = function(req, res)
{
    var courseId = req.params.possiblyDeletedCourseId;

    var subDir = courseId;
    var fullDir = './modules/backups/server/uploads/' + subDir;

    fs.readdir(fullDir, function(err, files)
    {
        var backupFileName = files[0];
        var fullPath = './modules/backups/server/uploads/' + courseId + '/' + backupFileName;

        fs.readFile(fullPath, function(err, data)
        {
            //res.jsonp(data);
            var json = JSON.parse(data);
            res.send(json.course.title);

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
    var backup = JSON.parse(req.body.backup);

    var course = new Course(backup.course);
    course.save();

    backup.concepts.forEach(function(conceptData)
    {
        var concept = new Concept(conceptData);
        concept.save();
    });

    backup.conceptdependencies.forEach(function(depData)
    {
        var dep = new Conceptdependency(depData);
        dep.save();
    });
    backup.courseevents.forEach(function(eventData)
    {
        var event = new Courseevent(eventData);
        event.save();
    });
    backup.sources.forEach(function(srcData)
    {
        var source = new Source(srcData);
        source.save();
    });
    backup.segments.forEach(function(segData)
    {
        var seg = new Segment(segData);
        seg.save();
    });

    res.jsonp(backup);
};


/**
 * List of backups
 */
exports.list = function(req, res)
{
    var courseId = req.params.possiblyDeletedCourseId;

    var subDir = courseId;
    var fullDir = './modules/backups/server/uploads/' + subDir;

    fs.readdir(fullDir, function(err, files)
    {
        res.jsonp(files);
    });
    //res.jsonp(req.backup);
};

exports.listCourseIds = function(req, res)
{
    var fullDir = './modules/backups/server/uploads/';
    fs.readdir(fullDir, function(err, files)
    {
        var directories = files.filter(function(fileName) { return fileName != '.directory'; });
        res.jsonp(directories);
    });
};


/**
 * Show backups
 */
exports.read = function(req, res)
{
    var courseId = req.params.possiblyDeletedCourseId;
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
