'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    actions = require(path.resolve('./modules/actions/server/controllers/actions.server.controller')),
    Tag = mongoose.model('Tag'),
    _ = require('lodash');

/**
 * Create a Tag
 */
exports.create = function(req, res)
{
    var tag = new Tag(req.body);

    //tag.user = req.user;

    tag.save(function(err)
    {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else
        {
            res.jsonp(tag);
        }
    });
};

/**
 * Show the current Tag
 */
exports.read = function(req, res) {
    res.jsonp(req.tag);
};

/**
 * Update a Tag
 */
exports.update = function(req, res) {
    var tag = req.tag ;

    tag = _.extend(tag , req.body);

    tag.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(tag);
        }
    });
};


/**
 * Delete a Tag
 */
exports.delete = function(req, res)
{
    var tag = req.tag;

    var deletedData = { };

    tag.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            deletedData['Tag'] = [tag];

            actions.doDelete(req.user, deletedData, function()
            {
                res.jsonp(tag);
            });
        }
    });
};

/**
 * List of Tags
 */
exports.list = function(req, res)
{
    Tag.find().sort('+created').exec(function(err, tags) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(tags);
        }
    });
};

/**
 * Tag middleware
 */
exports.tagByID = function(req, res, next, id) {
    Tag.findById(id).exec(function(err, tag) {
        if (err) return next(err);
        if (! tag)
        {
            res.status(404);
            return next(new Error('Failed to load Tag ' + id));
        }
        req.tag = tag ;
        next();
    });
};
