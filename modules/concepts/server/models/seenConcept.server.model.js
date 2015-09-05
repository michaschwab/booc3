'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Concept Schema
 */
var SeenConceptSchema = new Schema(
{
    concept: { type: Schema.ObjectId, ref: 'Concept' },
    user: { type: Schema.ObjectId, ref: 'User' },
    time: {
        type: Date,
        default: Date.now
    },
    course: { type: Schema.ObjectId, ref: 'Course' }
});

SeenConceptSchema.index({ user: 1, concept: 1, course: 1 }, { unique: true });

var SeenConcept = mongoose.model('SeenConcept', SeenConceptSchema);
module.exports = SeenConcept;
