'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Concept Schema
 */
var LearnedConceptSchema = new Schema(
{
    concept: { type: Schema.ObjectId, ref: 'Concept' },
    user: { type: Schema.ObjectId, ref: 'User' },
    time: {
        type: Date,
        default: Date.now
    },
    course: { type: Schema.ObjectId, ref: 'Course' }
});

LearnedConceptSchema.index({ user: 1, concept: 1, course: 1 }, { unique: true });

var LearnedConcept = mongoose.model('LearnedConcept', LearnedConceptSchema);
module.exports = LearnedConcept;
