'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Sourcetype = mongoose.model('Sourcetype'),
	_ = require('lodash');

/**
 * Create a source
 */
exports.create = function(req, res) {
    var sourcetype = new Sourcetype(req.body);
    sourcetype.user = req.user;

    sourcetype.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sourcetype);
        }
    });
};

/**
 * Show the current Source
 */
exports.read = function(req, res) {
    res.jsonp(req.sourcetype);
};

/**
 * Update a Source
 */
exports.update = function(req, res) {
    var sourcetype = req.sourcetype ;

    sourcetype = _.extend(sourcetype , req.body);

    sourcetype.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sourcetype);
        }
    });
};

/**
 * Delete an Course
 */
exports.delete = function(req, res) {
    var sourcetype = req.sourcetype ;

    sourcetype.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sourcetype);
        }
    });
};

/**
 * List of Courses
 */
exports.list = function(req, res) {


    Sourcetype.find().sort('+created').exec(function(err, sourcetypes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sourcetypes);
        }
    });
};

/**
 * Course middleware
 */
exports.sourcetypeByID = function(req, res, next, id) {
    Sourcetype.findById(id).populate('user', 'displayName').exec(function(err, sourcetype) {
        if (err) return next(err);
        if (! sourcetype) return next(new Error('Failed to load Sourcetype ' + id));
        req.sourcetype = sourcetype ;
        next();
    });
};

/**
 * Course authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.user.roles === undefined || req.user.roles.indexOf("admin") <0) {
        return res.status(403).send('User is not authorized');
    }
    next();
};


