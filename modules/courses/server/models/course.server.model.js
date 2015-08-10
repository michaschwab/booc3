'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Course Schema
 */
var CourseSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    short: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    segments: [{ type: Schema.ObjectId, ref: 'Segment' }],
    concepts: [{ type: Schema.ObjectId, ref: 'Concept' }],
    created: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Course', CourseSchema);
