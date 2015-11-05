'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Action = mongoose.model('Action'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

var io;

var mapping = {};
mapping['Concept'] = 'Concepts';
mapping['Conceptdependency'] = 'Conceptdependencies';
mapping['LearnedConcept'] = 'LearnedConcepts';

exports.setIo = function(newIo)
{
    io = newIo;
};

exports.doDelete = function(user, data, cb)
{
    var action = new Action({});
    action.type = 'delete';
    action.data = data;
    action.user = user;

    action.save(function(err)
    {
        if (err)
        {
            cb(err);
        }
        else
        {
            // Because this is a strict server-side function, the event needs to be emitted manually
            // since a client-side library like angular-socket-io has no access to this.
            if(io)
            {
                // This is so the 'undo' message appears.
                io.sockets.emit('save-actions', action);

                // This is so subsequentially deleted contents also are deleted from the front end.
                for(var DataType in action.data)
                {
                    if(action.data.hasOwnProperty(DataType))
                    {
                        action.data[DataType].forEach(function(delContent)
                        {
                            var modName = mapping[DataType] ? mapping[DataType].toLowerCase() : DataType.toLowerCase() + 's';
                            var eventName = 'remove-' + modName;
                            io.sockets.emit(eventName, delContent);
                        });
                    }
                }
            }

            cb();
        }
    })
};

/**
 * Create a Action
 */
exports.create = function(req, res)
{
    var action = new Action(req.body);
    //action.user = req.user;

    action.save(function(err) {
        if (err) {
            return res.status(400).send({
                action: err
            });
        } else {
            res.jsonp(action);
        }
    });
};

/**
 * Show the current Action
 */
exports.read = function(req, res) {
    res.jsonp(req.action);
};

/**
 * Update a Action
 */
exports.update = function(req, res) {
    var action = req.action ;

    action = _.extend(action , req.body);

    action.save(function(err) {
        if (err) {
            return res.status(400).send({
                action: err
            });
        } else {
            res.jsonp(action);
        }
    });
};

/**
 * Delete an Action
 */
exports.delete = function(req, res) {
    var action = req.action ;

    action.remove(function(err) {
        if (err) {
            return res.status(400).send({
                action: err
            });
        } else {
            res.jsonp(action);
        }
    });
};

/**
 * List of Actions
 */
exports.list = function(req, res) {

    var qObject = {};
    if(!req.user)
    {
        return res.jsonp([]);
    }
    qObject['user'] = new ObjectId(req.user._id);

    Action.find(qObject).sort('-time').exec(function(err, actions) {
        if (err) {
            return res.status(400).send({
                action: err
            });
        } else {
            res.jsonp(actions);
        }
    });
};

/**
 * Last User Action
 */
exports.last = function(req, res) {

    var qObject = {};
    qObject['user'] = new ObjectId(req.user._id);

    Action.findOne(qObject).sort('-time').exec(function(err, action) {
        if (err) {
            return res.status(400).send({
                action: err
            });
        } else {
            res.jsonp(action);
        }
    });
};

/**
 * Action middleware
 */
exports.actionByID = function(req, res, next, id) {
    Action.findById(id).exec(function(err, action) {
        if (err) return next(err);
        if (! action) return next(new Error('Failed to load Action ' + id));
        req.action = action ;
        next();
    });
};

exports.actionsByUserId = function(req, res, next, id)
{
    var qObject = { user: id };

    Action.find(qObject).exec(function(err, actions) {
        if (err) return next(err);
        if (! actions) return next(new Error('Failed to load Action ' + id));
        req.action = actions ;
        next();
    });
};

/**
 * Action authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.action.user != req.user.id) {
        return res.status(403).send('User is not authorized' + req.action.user + ' !== ' + req.user.id);
    }
    next();
};
