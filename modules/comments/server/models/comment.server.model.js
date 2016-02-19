'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var CommentSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    editedTimes: [{
        type: Date
    }],
    course: { type: Schema.ObjectId, ref: 'Course' },
    concept: { type: Schema.ObjectId, ref: 'Concept' },
    segment: { type: Schema.ObjectId, ref: 'Segment' },
    source: { type: Schema.ObjectId, ref: 'Source' },
    title: {
        type: String,
        default: '',
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true,
        required: 'Content cannot be blank'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Comment', CommentSchema);
