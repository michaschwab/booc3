'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Source Schema
 */
var SourceSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    path: {
        type: String,
        default: '',
        trim: true
    },
    segments: [{ type: Schema.Types.ObjectId, ref: 'Segment' }],
    created: {
        type: Date,
        default: Date.now
    },
    type: { type: Schema.Types.ObjectId, ref: 'Sourcetype', required: 'has to have a type' },
    data: Schema.Types.Mixed,
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

var Source = mongoose.model('Source', SourceSchema);
module.exports = Source;
