'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Comment = mongoose.model('Comment'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a comment
 */
exports.create = function (req, res) {
    var comment = new Comment(req.body);
    comment.user = req.user;

    comment.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comment);
        }
    });
};

/**
 * Show the current comment
 */
exports.read = function (req, res) {
    res.json(req.comment);
};

/**
 * Update a comment
 */
exports.update = function (req, res) {
    var comment = req.comment;

    comment.title = req.body.title;
    comment.content = req.body.content;

    comment.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comment);
        }
    });
};

/**
 * Delete an comment
 */
exports.delete = function (req, res) {
    var comment = req.comment;

    comment.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comment);
        }
    });
};

/**
 * List of Comments
 */
exports.list = function (req, res) {
    Comment.find().sort('-created').populate('user', 'displayName').exec(function (err, comments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(comments);
        }
    });
};

/**
 * Comment middleware
 */
exports.commentByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Comment is invalid'
        });
    }

    Comment.findById(id).populate('user', 'displayName').exec(function (err, comment) {
        if (err) {
            return next(err);
        } else if (!comment) {
            return res.status(404).send({
                message: 'No comment with that identifier has been found'
            });
        }
        req.comment = comment;
        next();
    });
};
