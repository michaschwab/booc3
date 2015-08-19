'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Message = mongoose.model('Message'),
	Chatparticipant = mongoose.model('Chatparticipant'),
	_ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a Message
 */
exports.create = function(req, res) {
	var message = new Message(req.body);
	message.user = typeof req.user == 'object' ? req.user._id : req.user;

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {
	res.jsonp(req.message);
};

/**
 * Update a Message
 */
exports.update = function(req, res)
{
	var message = req.message ;

	message = _.extend(message , req.body);

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

/**
 * Delete an Message
 */
exports.delete = function(req, res) {
	var message = req.message ;

	message.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

/**
 * List of Messages
 */
exports.list = function(req, res)
{
	var qObject = {};
	qObject['chatroom'] = req.query['chatroomId'] ? new ObjectId(req.query['chatroomId']) : new ObjectId(req.query['chatroom']);

	Message.find(qObject).sort('-created').exec(function(err, messages) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(messages);
		}
	});
};

/**
 * Message middleware
 */
exports.messageByID = function(req, res, next, id)
{
	Message.findById(id).populate('user', 'displayName').exec(function(err, message) {
		if (err) return next(err);
		if (! message) return next(new Error('Failed to load Message ' + id));
		req.message = message ;
		next();
	});
};

/**
 * Message authorization middleware
 */
exports.isInChat = function(req, res, next)
{
	var body = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
	var chatroomId = body.chatroom ? body.chatroom : body.chatroomId;

	if(!chatroomId)
	{
		return res.status(403).send('User is not authorized because no chatroom specified' + participantUserIds + ' , ' + req.user.id);
	}
	else
	{
		Chatparticipant.find({ chatroom: chatroomId }).exec(function(err, participants)
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
};
