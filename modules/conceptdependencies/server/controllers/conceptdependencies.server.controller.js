'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Conceptdependency = mongoose.model('Conceptdependency'),
	Courseadmin = mongoose.model('Courseadmin'),
	_ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a Conceptdependency
 */
exports.create = function(req, res) {
	var conceptdependency = new Conceptdependency(req.body);
	conceptdependency.user = req.user;

	conceptdependency.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(conceptdependency);
		}
	});
};

/**
 * Show the current Conceptdependency
 */
exports.read = function(req, res) {
	res.jsonp(req.conceptdependency);
};

/**
 * Update a Conceptdependency
 */
exports.update = function(req, res) {
	var conceptdependency = req.conceptdependency ;

	conceptdependency = _.extend(conceptdependency , req.body);

	conceptdependency.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(conceptdependency);
		}
	});
};

/**
 * Delete an Conceptdependency
 */
exports.delete = function(req, res) {
	var conceptdependency = req.conceptdependency ;

	conceptdependency.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(conceptdependency);
		}
	});
};

/**
 * List of Conceptdependencies
 */
exports.list = function(req, res) {
    /**BOOC ADDONS **/
    var qObject = {};

    // allowed query parameters:
    if (req.query['course']){
        qObject['course'] = new ObjectId(req.query['course']);
    }


    Conceptdependency.find(qObject).sort('-created').populate('user', 'displayName').exec(function(err, conceptdependencies) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(conceptdependencies);
		}
	});
};

/**
 * Conceptdependency middleware
 */
exports.conceptdependencyByID = function(req, res, next, id) { 
	Conceptdependency.findById(id).populate('user', 'displayName').exec(function(err, conceptdependency) {
		if (err) return next(err);
		if (! conceptdependency) {
			if(req.method != 'POST')
				return next(new Error('Failed to load Conceptdependency ' + id));
		}
		req.conceptdependency = conceptdependency ;
		next();
	});
};

/**
 * Conceptdependency authorization middleware
 */



exports.hasReqAuthorization = function(req, res, next)
{
	//var body = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
	var userId = req.user._id;
	var conceptCourses = req.body.course;

	if(req.user.roles && req.user.roles.indexOf("admin") != -1)
	{
		next();
	}
	else
	{
		Courseadmin.find({user: userId}).exec(function(err, admins)
		{
			if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return conceptCourses == courseId && ['teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
			{
				return res.status(403).send('User is not authorized: need teacher permissions');
			}
			else
			{
				next();
			}
		});
	}
};
/*

exports.hasResAuthorization = function(req, res, next)
{
	// to do
	/!*if (req.conceptdependency.user.id !== req.user.id) {
	 return res.status(403).send('User is not authorized');
	 }*!/
	next();
};
*/
