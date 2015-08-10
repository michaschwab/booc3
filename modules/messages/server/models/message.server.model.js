'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
	text: {
		type: String,
		default: '',
		required: 'Please fill Message text',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'need sender'
	},
	chatroom: {
		type: Schema.ObjectId,
		ref: 'Chatroom',
		required: 'need chatroom to send to'
	}
});

mongoose.model('Message', MessageSchema);
