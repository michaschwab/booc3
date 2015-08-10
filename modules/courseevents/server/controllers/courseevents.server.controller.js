'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Courseevent = mongoose.model('Courseevent'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');

/**
 * Create a Courseevent
 */
exports.create = function(req, res) {
    var courseevent = new Courseevent(req.body);
    //courseevent.user = req.user;
    
    courseevent.save(function(err) {
        if (err) {
            return res.status(400).send({
                courseevent: err
            });
        } else {
            res.jsonp(courseevent);
        }
    });
};

/**
 * Show the current Courseevent
 */
exports.read = function(req, res) {
    res.jsonp(req.courseevent);
};

/**
 * Update a Courseevent
 */
exports.update = function(req, res) {
    var courseevent = req.courseevent ;
    
    courseevent = _.extend(courseevent , req.body);
    
    courseevent.save(function(err) {
        if (err) {
            return res.status(400).send({
                courseevent: err
            });
        } else {
            res.jsonp(courseevent);
        }
    });
};

/**
 * Delete an Courseevent
 */
exports.delete = function(req, res) {
    var courseevent = req.courseevent ;
    
    courseevent.remove(function(err) {
        if (err)
        {
            return res.status(400).send({
                courseevent: err
            });
        }
        else
        {
            actions.doDelete(req.user, { Courseevent: [courseevent] }, function()
            {
                res.jsonp(courseevent);
            });


        }
    });
};

/**
 * List of Courseevents
 */
exports.list = function(req, res) {
    
    var qObject = {};

    if (req.query['course'])
    {
        qObject['course'] = new ObjectId(req.query['course']);
    }
    
    /*if(req.user.roles.indexOf('admin') != -1 || req.user.roles.indexOf('teacher') != -1)
    {
        if (req.query['user']){
            qObject['user'] = new ObjectId(req.query['user']);
        } else if (req.query['userId']){
            qObject['user'] = new ObjectId(req.query['userId']);
        }
    }
    else
    {
        qObject['user'] = new ObjectId(req.user._id);
    }*/
    
    Courseevent.find(qObject).sort('-created').exec(function(err, courseevents) {
        if (err) {
            return res.status(400).send({
                courseevent: err
            });
        } else {
            res.jsonp(courseevents);
        }
    });
};

/**
 * Courseevent middleware
 */
exports.courseeventByID = function(req, res, next, id) {
    Courseevent.findById(id).exec(function(err, courseevent) {
        if (err) return next(err);
        if (! courseevent) return next(new Error('Failed to load Courseevent ' + id));
        req.courseevent = courseevent ;
        next();
    });
};

/**
 * Courseevent authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    /*if (req.courseevent.user != req.user.id) {
        return res.status(403).send('User is not authorized' + req.courseevent.user + ' !== ' + req.user.id);
    }*/
    next();
};
