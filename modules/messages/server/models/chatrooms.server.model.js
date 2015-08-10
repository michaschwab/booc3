'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Chatrooms Schema
 */
var ChatroomSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Chatroom', ChatroomSchema);
