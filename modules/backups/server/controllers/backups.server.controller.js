'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

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
    var backup = req.body;
    var subDir = backup.course._id;
    var fileName = new Date().toISOString();
    var fullDir = './modules/backups/server/uploads/' + subDir;

    fs.stat(fullDir, function(err, stats)
    {
        if(err)
        {
            fs.mkdirSync(fullDir);
        }
        fs.writeFile(fullDir + '/' + fileName + '.json', JSON.stringify(backup), function (uploadError)
        {
            console.error(uploadError);
            return res.jsonp(backup);
        });
    });
};

/**
 * Show the current backup
 */
exports.read = function(req, res)
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
 * List of backups
 */
exports.list = function(req, res) {

    /*var qObject = {};
    if(!req.user)
    {
        return res.jsonp([]);
    }
    qObject['user'] = new ObjectId(req.user._id);

    backup.find(qObject).sort('-time').exec(function(err, backups) {
        if (err) {
            return res.status(400).send({
                backup: err
            });
        } else {
            res.jsonp(backups);
        }
    });*/
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
