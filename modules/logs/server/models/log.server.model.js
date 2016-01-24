'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Concept Schema
 */
var LogSchema = new Schema(
    {
        action: {
            type: String,
            required: 'need action type'
        },
        event: {
            type: Object
        },
        eventTargetId: {
            type: String
        },
        callstack: {
            type: Object
        },
        data: {
            type: Object
        },
        time: {
            type: Date,
            default: Date.now
        },
        address: String,
        course: { type: Schema.ObjectId, ref: 'Course' },
        user: { type: Schema.ObjectId, ref: 'User' }
    });

mongoose.model('Log', LogSchema);
