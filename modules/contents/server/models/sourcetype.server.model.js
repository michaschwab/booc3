'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Sourcetype Schema
 */
var SourcetypeSchema = new Schema({
    title: {
        type: String,
        unique: 'testing error message',
        trim: true,
        required: 'Title cannot be blank'
    },
    player: {
        type: String,
        default: '',
        trim: true,
        required: 'Player cannot be blank'
    },
    icon: {
        type: String,
        default: 'file'
    },
    formats: [{
        type: String,
        default: '',
        trim: true
    }],
    created: {
        type: Date,
        default: Date.now
    }
});

var SourceType = mongoose.model('Sourcetype', SourcetypeSchema);
module.exports = SourceType;
