'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Chatroomparticipants Schema
 */
var ChatparticipantSchema = new Schema({
	joined: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'need user for participant'
	},
	chatroom: {
		type: Schema.ObjectId,
		ref: 'Chatroom',
		required: 'need chatroom to send to'
	},
	lastRead: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Chatparticipant', ChatparticipantSchema);
