'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Chatparticipant = mongoose.model('Chatparticipant'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a Chatparticipant
 */
exports.create = function(req, res) {
    var chatparticipant = new Chatparticipant(req.body);
    //chatparticipant.user = req.user;

    chatparticipant.save(function(err) {
        if (err) {
            return res.status(400).send({
                chatparticipant: err
            });
        } else {
            res.jsonp(chatparticipant);
        }
    });
};

/**
 * Show the current Chatparticipant
 */
exports.read = function(req, res) {
    res.jsonp(req.chatparticipant);
};

/**
 * Update a Chatparticipant
 */
exports.update = function(req, res) {
    var chatparticipant = req.chatparticipant ;

    chatparticipant = _.extend(chatparticipant , req.body);

    chatparticipant.save(function(err) {
        if (err) {
            return res.status(400).send({
                chatparticipant: err
            });
        } else {
            res.jsonp(chatparticipant);
        }
    });
};

/**
 * Delete an Chatparticipant
 */
exports.delete = function(req, res) {
    var chatparticipant = req.chatparticipant ;

    chatparticipant.remove(function(err) {
        if (err) {
            return res.status(400).send({
                chatparticipant: err
            });
        } else {
            res.jsonp(chatparticipant);
        }
    });
};

/**
 * List of Chatparticipants
 */
exports.list = function(req, res)
{
    var qObject = {};
    var user = req.user;

    // allowed query parameters:
    if (req.query['chatroom'])
    {
        qObject['chatroom'] = new ObjectId(req.query['chatroom']);

        if (req.query['user'])
        {
            qObject['user'] = new ObjectId(req.query['user']);
        }
    }
    else
    {
        qObject['user'] = new ObjectId(user.id);
    }


    Chatparticipant.find(qObject).sort('-created').exec(function(err, chatparticipants) {
        if (err) {
            return res.status(400).send({
                chatparticipant: err
            });
        } else {
            res.jsonp(chatparticipants);
        }
    });
};

/**
 * Chatparticipant middleware
 */
exports.chatparticipantByID = function(req, res, next, id)
{
    Chatparticipant.findById(id).exec(function(err, chatparticipant) {
        if (err) return next(err);
        if (! chatparticipant) return next(new Error('Failed to load Chatparticipant ' + id));
        req.chatparticipant = chatparticipant ;
        next();
    });
};

/**
 * Chatparticipant authorization middleware
 */
exports.isEditingSelf = function(req, res, next)
{
    if (req.chatparticipant.user != req.user.id) {
        return res.status(403).send('User is not authorized' + req.chatparticipant.user + ' !== ' + req.user.id);
    }
    else
    {
        next();
    }
};

exports.isInChat = function(req, res, next)
{
    // making sure user is in chat before allowing to add other people to it or reading other stuff about the participants.

    var body = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;

    if (!body.user || body.user != req.user.id)
    {
        var chatroomId = body.chatroom;

        Chatparticipant.find({chatroom: chatroomId}).exec(function(err, participants)
        {
            var participantUserIds = participants.map(function(p) { return '' + p.user; });

            if(participantUserIds.indexOf(req.user.id) == -1)
            {
                return res.status(403).send('User is not authorized' + participantUserIds + ' , ' + req.user.id);
            }
            else
            {
                next();
            }
        });
    }
    else
    {
        next();
    }
};
