'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	courseAdmin = require(path.resolve('./modules/users/server/controllers/courseadmin.server.controller')),
	concepts = require(path.resolve('./modules/concepts/server/controllers/concepts.server.controller')),
	actions = require(path.resolve('./modules/actions/server/controllers/actions.server.controller')),
	Course = mongoose.model('Course'),
	Concept = mongoose.model('Concept'),
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

var mergeObject = function(data, addedData)
{
	if(typeof addedData == 'object' && addedData.constructor !== Array)
	{
		for(var key in addedData)
		{
			if(addedData.hasOwnProperty(key))
			{
				if(!data[key])
				{
					data[key] = addedData[key];
				}
				else if(typeof addedData[key] == 'object')
				{
					data[key] = mergeObject(data[key], addedData[key]);
				}
			}

		}
	}
	else if(addedData.constructor === Array)
	{
		data = data.concat(addedData);
	}
	return data;
};

/**
 * Delete an Course
 */
exports.delete = function(req, res)
{
	var course = req.course;

	var deletedData = { };

	Concept.find({courses: { $in: [course._id]}}).exec(function(err, conceptList)
	{
		var cbs = 0;
		var maxCallbacks = conceptList.length;

		var makeCallbackFct = function(isErrorFct)
		{
			return function(response)
			{
				if(isErrorFct)
				{
					console.error(response);
				}
				else
				{
					deletedData = mergeObject(deletedData, response);
				}

				cbs++;

				if(cbs == maxCallbacks)
				{
					course.remove(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							deletedData['Course'] = [course];

							actions.doDelete(req.user, deletedData, function()
							{
								res.jsonp(course);
							});
						}
					});
				}
			};
		};

		if(conceptList && conceptList.length)
		{
			conceptList.forEach(function(concept)
			{
				concepts.removeConcept(concept, makeCallbackFct(true), makeCallbackFct(false));
			});
		}
		else
		{
			course.remove(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					deletedData['Course'] = [course];

					actions.doDelete(req.user, deletedData, function()
					{
						res.jsonp(course);
					});
				}
			});
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

