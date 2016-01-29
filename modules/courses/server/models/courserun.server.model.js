'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Course Schema
 */
var CourseRunSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: 'Title cannot be blank'
    },
    course: { type: Schema.ObjectId, ref: 'Course' },
    start: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('CourseRun', CourseRunSchema);
