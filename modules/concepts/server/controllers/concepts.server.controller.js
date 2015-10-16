'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Concept = mongoose.model('Concept'),
	Conceptdependency = mongoose.model('Conceptdependency'),
	LearnedConcept = mongoose.model('LearnedConcept'),
	Courseadmin = mongoose.model('Courseadmin'),
	_ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');

/**
 * Create a Concept
 */
exports.create = function(req, res) {
	var concept = new Concept(req.body);
	concept.user = req.user;

	concept.save(function(err) {
		if (err) {
			console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(concept);
		}
	});
};

/**
 * Show the current Concept
 */
exports.read = function(req, res) {
	res.jsonp(req.concept);
};

/**
 * Update a Concept
 */
exports.update = function(req, res)
{
	var concept = req.concept ;

	concept = _.extend(concept , req.body);

	concept.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(concept);
		}
	});
};

/**
 * Delete an Concept
 */
exports.delete = function(req, res)
{
	var concept = req.concept;

	removeConcept(concept, function(msg)
	{
		return res.status(400).send({message: msg });
	}, function(deletedData)
	{
		// Save Removal as Action so it can be undone, except if this is already being executed as an Action Undo or Redo.
		if(!req.query || req.query.triggerAction !== 'false')
		{
			actions.doDelete(req.user, deletedData, function()
			{
				res.jsonp(concept);
			});
		}
	});
};

function removeConcept(concept, onerror, callback)
{
	var conceptId = concept._id;

	//todo also delete from course concept list, segment concept list, ..

	concept.remove(function(err) {
		if (err) {
			return onerror(errorHandler.getErrorMessage(err));
		}
		else
		{
			var learnedConceptQuery = {concept: conceptId};
			var conceptdependencyQuery1 = {dependant: conceptId};
			var conceptdependencyQuery2 = {provider: conceptId};

			LearnedConcept.find(learnedConceptQuery).exec(function(err, learnedconcepts)
			{
				LearnedConcept.remove(learnedConceptQuery).exec(function(err)
				{
					Conceptdependency.find(conceptdependencyQuery1).exec(function(err, conceptdependencies1)
					{
						Conceptdependency.remove(conceptdependencyQuery1).exec(function(err)
						{
							Conceptdependency.find(conceptdependencyQuery2).exec(function(err, conceptdependencies2)
							{
								Conceptdependency.remove(conceptdependencyQuery2).exec(function(err)
								{
									var conceptdependencies = conceptdependencies1.concat(conceptdependencies2);
									var deletedData = { LearnedConcept: learnedconcepts, Conceptdependency: conceptdependencies, Concept: [concept] };

									Concept.find({parents: {$in: [conceptId]}}).exec(function(err, childConcepts)
									{
										var totalCbs = childConcepts.length;
										var currentCbs = 0;

										if(!childConcepts.length)
										{
											callback(deletedData);
										}
										else
										{
											childConcepts.forEach(function(child)
											{
												removeConcept(child, onerror, function(deletedChildData)
												{
													deletedData.LearnedConcept = deletedData.LearnedConcept.concat(deletedChildData.LearnedConcept);
													deletedData.Conceptdependency = deletedData.Conceptdependency.concat(deletedChildData.Conceptdependency);
													deletedData.Concept = deletedData.Concept.concat(deletedChildData.Concept);
													currentCbs++;

													if(currentCbs == totalCbs)
													{
														callback(deletedData);
													}
												});
											});
										}
									});
								});
							});
						});
					});
				});
			});
		}
	});
}

/**
 * List of Concepts
 */
exports.list = function(req, res) {
    /**BOOC ADDONS **/
    var qObject = {};

    // allowed query parameters:
    if (req.query['courses']){
        qObject['courses'] = new ObjectId(req.query['courses']);
    }

	Concept.find(qObject).sort('-created').exec(function(err, concepts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(concepts);
		}
	});
};

/**
 * Concept middleware
 */
exports.conceptByID = function(req, res, next, id) { 
	Concept.findById(id).exec(function(err, concept) {
		if (err) return next(err);
		if (!concept)
		{
			// For POST requests, allow it to specify a Concept via ID that might not exist (yet). This allows creation of concepts with specific ID.
			if(req.method != 'POST')
				return next(new Error('Failed to load Concept ' + id));
		}
		req.concept = concept ;
		next();
	});
};

exports.hasReqAuthorization = function(req, res, next)
{
	//var body = req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
	var userId = req.user._id;
	var conceptCourses = req.body.courses;

	if(req.user.roles && req.user.roles.indexOf("admin") != -1)
	{
		next();
	}
	else
	{
		Courseadmin.find({user: userId}).exec(function(err, admins)
		{
			if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return conceptCourses.indexOf(courseId) !== -1 && ['teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
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


//exports.directQuery = function (req, res) {
//
//    var reqQuery = req.query;
//    var qq ={};
//    Object.keys(reqQuery).forEach(function(key){
//        console.log("key", key);
//        if (reqQuery.hasOwnProperty(key)){
//            var value = reqQuery[key];
//            if (value.indexOf("ObjectId")==0){
//                qq[key]= new ObjectId(value.substring(8+2,value.length-2));
//            }else{
//                qq[key]= reqQuery[key].trim();
//            }
//        }
//    })
//
//    Concept.find(qq).sort('-created').exec(function(err, concepts) {
//        if (err) {
//            return res.status(400).send({
//                message: errorHandler.getErrorMessage(err)
//            });
//        } else {
//            res.jsonp(concepts);
//        }
//    });
//
//};
