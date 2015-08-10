'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Courseevent Schema
 */
var CourseeventSchema = new Schema({
	course: {
		type: Schema.ObjectId,
		ref: 'Course',
		required: 'need course to be admin in'
	},
	when: {
		type: String,
		enum: ['before', 'after'],
		default: 'before'
	},
	concept: {
		type: Schema.ObjectId,
		ref: 'Concept',
		required: 'need to have a concept'
	},
	description: {
		type: String,
		default: ''
	},
	name: {
		type: String,
		required: 'event needs a name'
	},
	added: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Courseevent', CourseeventSchema);
