'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Log = mongoose.model('Log'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

var io;



/**
 * Create a Log
 */
exports.create = function(req, res)
{
    var log = new Log(req.body);
    //log.user = req.user;

    log.save(function(err) {
        if (err) {
            return res.status(400).send({
                log: err
            });
        } else {
            res.jsonp(log);
        }
    });
};

/**
 * Show the current Log
 */
exports.read = function(req, res) {
    res.jsonp(req.log);
};

/**
 * Update a Log
 */
exports.update = function(req, res) {
    var log = req.log ;

    log = _.extend(log , req.body);

    log.save(function(err) {
        if (err) {
            return res.status(400).send({
                log: err
            });
        } else {
            res.jsonp(log);
        }
    });
};

/**
 * Delete an Log
 */
exports.delete = function(req, res) {
    var log = req.log ;

    log.remove(function(err) {
        if (err) {
            return res.status(400).send({
                log: err
            });
        } else {
            res.jsonp(log);
        }
    });
};

/**
 * List of Logs
 */
exports.list = function(req, res) {

    var qObject = {};
    if(!req.user)
    {
        return res.jsonp([]);
    }
    //qObject['user'] = new ObjectId(req.user._id);

    Log.find(qObject).sort('-time').exec(function(err, logs) {
        if (err) {
            return res.status(400).send({
                log: err
            });
        } else {
            res.jsonp(logs);
        }
    });
};

/**
 * Log middleware
 */
exports.logByID = function(req, res, next, id) {
    Log.findById(id).exec(function(err, log) {
        if (err) return next(err);
        if (! log) return next(new Error('Failed to load Log ' + id));
        req.log = log ;
        next();
    });
};

exports.logsByUserId = function(req, res, next, id)
{
    var qObject = { user: id };

    Log.find(qObject).exec(function(err, logs) {
        if (err) return next(err);
        if (! logs) return next(new Error('Failed to load Log ' + id));
        req.log = logs ;
        next();
    });
};

/**
 * Log authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.log.user != req.user.id) {
        return res.status(403).send('User is not authorized' + req.log.user + ' !== ' + req.user.id);
    }
    next();
};
