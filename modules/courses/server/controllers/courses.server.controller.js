'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	courseAdmin = require(path.resolve('./modules/users/server/controllers/courseadmin.server.controller')),
	Course = mongoose.model('Course'),
	_ = require('lodash');

/**
 * Create a Course
 */
exports.create = function(req, res)
{
	var course = new Course(req.body);
	course.user = req.user;

	course.save(function(err)
	{
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		else
		{
			// todo ensure that the creating user is made course admin.
			courseAdmin.addTeacherRole(course.user, course._id, function(err)
			{
				if(err) console.log(err);
				res.jsonp(course);
			});

		}
	});
};

/**
 * Show the current Course
 */
exports.read = function(req, res) {
	res.jsonp(req.course);
};

/**
 * Update a Course
 */
exports.update = function(req, res) {
	var course = req.course ;

	course = _.extend(course , req.body);

	course.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(course);
		}
	});
};

/**
 * Delete an Course
 */
exports.delete = function(req, res)
{
	var course = req.course;

	// todo remove dependencies, and concepts that are not used by other courses, courseadmins,..

	course.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(course);
		}
	});
};

/**
 * List of Courses
 */
exports.list = function(req, res)
{
	Course.find().sort('+created').exec(function(err, courses) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(courses);
		}
	});
};

/**
 * Course middleware
 */
exports.courseByID = function(req, res, next, id) { 
	Course.findById(id).populate('user', 'displayName').exec(function(err, course) {
		if (err) return next(err);
		if (! course)
		{
			res.status(404);
			return next(new Error('Failed to load Course ' + id));
		}
		req.course = course ;
		next();
	});
};

