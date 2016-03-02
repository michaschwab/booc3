'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Course Schema
 */
var TagSchema = new Schema({
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
    created: {
        type: Date,
        default: Date.now
    }

});

mongoose.model('Tag', TagSchema);
