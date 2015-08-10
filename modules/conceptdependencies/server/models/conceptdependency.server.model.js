'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Conceptdependency Schema
 */
var ConceptdependencySchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    dependant: { type: Schema.ObjectId, ref: 'Concept' },
    provider: { type: Schema.ObjectId, ref: 'Concept' },
    course: { type: Schema.ObjectId, ref: 'Course' }
});

mongoose.model('Conceptdependency', ConceptdependencySchema);
