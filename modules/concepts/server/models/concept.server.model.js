'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Concept Schema
 */
var ConceptSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    color: { type: String, default: '' },
    order: { type: Number },
    children: [{ type: Schema.ObjectId, ref: 'Concept' }],
    parents: [{ type: Schema.ObjectId, ref: 'Concept' }],

    //dependencies: [{ type: Schema.ObjectId, ref: 'ConceptDependency' }],
    //providing: [{ type: Schema.ObjectId, ref: 'ConceptDependency' }],

    segments: [{ type: Schema.ObjectId, ref: 'Segment' }],
    courses: [{ type: Schema.ObjectId, ref: 'Course' }],
    user: { type: Schema.ObjectId, ref: 'User' }
});

mongoose.model('Concept', ConceptSchema);
