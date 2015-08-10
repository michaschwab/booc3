'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Chatroom = mongoose.model('Chatroom'),
    Chatparticipant = mongoose.model('Chatparticipant'),
    _ = require('lodash');

/**
 * Create a Chatroom
 */
exports.create = function(req, res)
{
    var chatroom = new Chatroom(req.body);
    chatroom.user = req.user;
    
    chatroom.save(function(err) {
        if (err) {
            return res.status(400).send({
                chatroom: errorHandler.getErrorChatroom(err)
            });
        } else {
            res.jsonp(chatroom);
        }
    });
};

/**
 * Show the current Chatroom
 */
exports.read = function(req, res) {
    res.jsonp(req.chatroom);
};

/**
 * Update a Chatroom
 */
exports.update = function(req, res) {
    var chatroom = req.chatroom ;
    
    chatroom = _.extend(chatroom , req.body);
    
    chatroom.save(function(err) {
        if (err) {
            return res.status(400).send({
                chatroom: errorHandler.getErrorChatroom(err)
            });
        } else {
            res.jsonp(chatroom);
        }
    });
};

/**
 * Delete an Chatroom
 */
exports.delete = function(req, res) {
    var chatroom = req.chatroom ;

    //todo delete chatparticipants and messages
    
    chatroom.remove(function(err) {
        if (err) {
            return res.status(400).send({
                chatroom: errorHandler.getErrorChatroom(err)
            });
        } else {
            res.jsonp(chatroom);
        }
    });
};

/**
 * List of Chatrooms
 */
/*exports.list = function(req, res)
{
    //to do only get the ones with access!!
    Chatparticipant.find({ user: req.user._id  }).exec(function(err, participants)
    {
        console.log(participants);
    });

    Chatroom.find().sort('-created').exec(function(err, chatrooms) {
        if (err) {
            return res.status(400).send({
                chatroom: errorHandler.getErrorChatroom(err)
            });
        } else {
            res.jsonp(chatrooms);
        }
    });
};*/

/**
 * Chatroom middleware
 */
exports.chatroomByID = function(req, res, next, id)
{
    Chatroom.findById(id).exec(function(err, chatroom)
    {
        if (err) return next(err);
        if (! chatroom) return next(new Error('Failed to load Chatroom ' + id));

        Chatparticipant.find({chatroom: id}).exec(function(err, participants)
        {
            if (err) return next(err);
            if (! participants) return next(new Error('Failed to load Chatroom because no participants' + id));

            //console.log(participants);
            chatroom.participants = participants;
            req.chatroom = chatroom ;
            next();
        });
    });
};

/**
 * Chatroom authorization middleware
 */
exports.isInChat = function(req, res, next)
{
    var participantUserIds = req.chatroom.participants.map(function(p) { return '' + p.user; });

    if (participantUserIds.indexOf(req.user.id) == -1)
    {
        return res.status(403).send('User is not authorized');
    }
    next();
};
