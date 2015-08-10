'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Courseadmins Schema
 */
var CourseadminSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'need user for course admin'
	},
	course: {
		type: Schema.ObjectId,
		ref: 'Course',
		required: 'need course to be admin in'
	},
	type: {
		type: String,
		enum: ['content-editor', 'ta', 'teacher'],
		default: 'ta'
	},
	added: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Courseadmin', CourseadminSchema);
