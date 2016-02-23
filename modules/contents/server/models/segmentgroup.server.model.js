'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Segment Schema
 */
var SegmentGroupSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    icon: {
        type: String,
        default: '',
        trim: true
    },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    concept: { type: Schema.Types.ObjectId, ref: 'Concept' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    order: { type: Number },
    created: {
        type: Date,
        default: Date.now
    }
});

var Segmentgroup = mongoose.model('Segmentgroup', SegmentGroupSchema);
