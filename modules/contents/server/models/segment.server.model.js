'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Segment Schema
 */
var SegmentSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    start: Number,
    end: Number,
    //TODO do validation
    //courses: { type: [Schema.Types.ObjectId], ref: 'Course', validate: function(value) {return value.length > 0;}},
    //courses: { type: [Schema.Types.ObjectId], ref: 'Course', validate: [function(value) {return value.length > 0;}]},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    //courses: [{ type: Schema.Types.ObjectId, ref: 'Course', validate: function(value) {return value.length > 0;} }],
    concepts: [{ type: Schema.Types.ObjectId, ref: 'Concept' }],
    order: Schema.Types.Mixed,
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    source: { type: Schema.Types.ObjectId, ref: 'Source', required: 'has to be part of a source' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    created: {
        type: Date,
        default: Date.now
    }
});

var Segment = mongoose.model('Segment', SegmentSchema);
