'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
	mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Concept = mongoose.model('Concept'),
    LearnedConcept = mongoose.model('LearnedConcept'),
	_ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;

/**
 * Create a Concept
 */
exports.create = function(req, res)
{
	var learnedconcept = new LearnedConcept(req.body);
	learnedconcept.user = req.user;

	learnedconcept.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(learnedconcept);
		}
	});
};

/**
 * Show the current Concept
 */
exports.read = function(req, res) {
	res.jsonp(req.learnedconcept);
};

/**
 * Update a Concept
 */
exports.update = function(req, res)
{
	var learnedconcept = req.learnedconcept ;

	learnedconcept = _.extend(learnedconcept , req.body);

	learnedconcept.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(learnedconcept);
		}
	});
};

/**
 * Delete a learned Concept
 */
exports.delete = function(req, res)
{
    console.log(req);
	var learnedconcept = req.learnedconcept ;

	learnedconcept.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(learnedconcept);
		}
	});
};

/**
 * List of Concepts
 */
exports.list = function(req, res) {

    var qObject = {};

	if(req.user.roles.indexOf('admin') == -1)
	{
		if (req.query['user']){
			qObject['user'] = new ObjectId(req.query['user']);
		}
	}
	else
	{
		qObject['user'] = new ObjectId(req.user._id);
	}
	if (req.query['course']){
		qObject['course'] = new ObjectId(req.query['course']);
	}

    LearnedConcept.find(qObject).populate('user', 'displayName').exec(function(err, learnedconcepts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(learnedconcepts);
		}
	});
};

/**
 * Concept middleware
 */

exports.learnedconceptByID = function(req, res, next, id) {
	LearnedConcept.findById(id).populate('user', 'displayName').exec(function(err, learnedconcept) {
		if (err) return next(err);
		if (! learnedconcept) return next(new Error('Failed to load LearnedConcept ' + id));
		req.learnedconcept = learnedconcept ;
		next();
	});
};

/**
 * Concept authorization middleware
 */
/*exports.hasAuthorization = function(req, res, next)
{
	// to do only the user's!
    //console.log("cehc auth: ", req.user.roles, );
	if (req.user.roles === undefined || req.user.roles.indexOf("admin") <0) {
		return res.status(403).send('User is not authorized');
	}
	next();
};*/


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
