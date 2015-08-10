'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Concept Schema
 */
var ActionSchema = new Schema(
{
    type: {
        type: String,
        enum: ['create', 'edit', 'delete'],
        required: 'need action type'
    },
    data: {
        type: Object
    },
    time: {
        type: Date,
        default: Date.now
    },
    undone: {
        type: Boolean,
        default: false
    },
    undoneDate: {
        type: Date,
        default: '01/01/1970'
    },
    user: { type: Schema.ObjectId, ref: 'User' }
});

mongoose.model('Action', ActionSchema);
