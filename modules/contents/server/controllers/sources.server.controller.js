'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	Source = mongoose.model('Source'),
    Segment = mongoose.model('Segment'),
    Courseadmin = mongoose.model('Courseadmin'),
    JSZip = require("jszip"),
    fs = require('fs'),
    cheerio = require('cheerio'),
    mkdirp = require('mkdirp'),
    request = require('request'),
    PDFMerge = require('pdf-merge'),
    _ = require('lodash');

var ObjectId = mongoose.Types.ObjectId;
var actions = require('../../../actions/server/controllers/actions.server.controller');
var courseTeacherPolicy = require('../../../users/server/services/courseteacher.server.policyhelper');

/**
 * Create a source
 */
exports.create = function(req, res)
{
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    var source = new Source(req.body);
    source.user = req.user;

    if(!source.title.length)
    {
        console.error('no source title');
        return res.status(400).send({
            message: 'No title given!'
        });
    }

    source.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(source);
        }
    });
};

/**
 * Show the current Source
 */
exports.read = function(req, res) {
    res.jsonp(req.source);
};

/**
 * Update a Source
 */
exports.update = function(req, res)
{
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    var source = req.source ;

    source = _.extend(source , req.body);

    source.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(source);
        }
    });
};

/*
This function assumes a lecture slide / video combination (lecture) has been recorded in the old (until 2015) Harvard
Extension School format.
 */
exports.mergeLectureSlides = function(req, res)
{
    var source = req.source;

    if(source.data.timestamps || source.data.oldTimestamps)
    {
        var files = [];
        var newTimestamps = [];
        var oldtimeStamps = source.data.timestamps || source.data.oldTimestamps;

        for(var i = 0; i < oldtimeStamps.length; i++)
        {
            var slideTimeEntry = oldtimeStamps[i];
            var pdfPath = '/modules/contents/client/uploads/slides/' + slideTimeEntry.slidepdf;
            files.push(pdfPath);

            newTimestamps.push({ slideNumber: i+1, time: slideTimeEntry.time });
        }
        source.data['slideTimestamps'] = newTimestamps;
        var newData = { slideTimestamps: newTimestamps, oldTimestamps: oldtimeStamps };

        Source.update({ _id: source._id }, { $set: { data: newData } }, function(saveErr) {
        //source.save(function(saveErr) {
            //console.log(saveErr);
            if (saveErr) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(saveErr)
                });
            } else {
                var pdfMerge = new PDFMerge(files);
                pdfMerge.asNewFile('modules/contents/client/uploads/slides/' + source._id + '_merged.pdf').merge(function(error, filePath)
                {
                    if(error)
                    {
                        return res.status(400).send({
                            message: 'merge failed:' + error
                        });
                    }
                    else
                    {
                        return res.jsonp(source);
                    }
                });
            }
        });
    }
    else
    {
        return res.status(400).send({
            message: 'not a lecture with individual slide pdfs'
        });
    }
};

/**
 * Delete a Source
 */
exports.delete = function(req, res)
{
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    var source = req.source ;
    var sourceId = source._id;

    var segmentQuery = { source: sourceId };

    if(req.query && req.query.sourceOnly)
    {
        source.remove(function(err)
        {
            if (err)
            {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else
            {
                var deletedData = { Source: [source] };

                actions.doDelete(req.user, deletedData, function()
                {
                    res.jsonp(source);
                });

                //res.jsonp(source);
            }
        });
    }
    else
    {
        //todo remove the concept segment entries
        Segment.find(segmentQuery).exec(function(err, segments)
        {
            // TODO remove from concept segment list

            Segment.remove(segmentQuery).exec(function(err)
            {
                source.remove(function(err)
                {
                    if (err)
                    {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                    else
                    {
                        var deletedData = { Segment: segments, Source: [source] };

                        actions.doDelete(req.user, deletedData, function()
                        {
                            res.jsonp(source);
                        });

                        //res.jsonp(source);
                    }
                });
            });
        });
    }
};

exports.uploadPdf = function(req, res)
{
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    var buffer = req.files.file.buffer;
    var fileName = req.files.file.name;
    var saveAs = './modules/contents/client/uploads/pdf/' + fileName;

    fs.writeFile(saveAs, buffer, function (uploadError)
    {
        if (uploadError) {
            return res.status(400).send({
                message: 'Error occurred while uploading pdf file'
            });
        } else {
            res.json({filePath: saveAs, fileName: fileName});
        }
    });
};

exports.readPdf = function(req, res)
{
    var path = req.source.path;
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    if(path.indexOf('http') === 0)
    {
        //todo redirect
    }
    else
    {
        path = './modules/contents/client/uploads/pdf/' + path;
        fs.readFile(path, function(err, data)
        {
            if (err) {
                return res.status(400).send({
                    message: 'Error occurred while uploading pdf file'
                });
            } else {
                //res.write(data);
                res.header('content-type', 'application/pdf');
                res.send(data);
            }
        });
    }
};

exports.isEmbeddable = function(req, res)
{
    var url = req.query.url;
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    request.get(url, function(error, response, body)
    {
        if(!response || !response.headers) return res.send('no');

        var xFrameOptions = response.headers["x-frame-options"];

        if(!xFrameOptions) return res.send('yes');

        xFrameOptions = xFrameOptions.toLocaleLowerCase();

        if(xFrameOptions == 'sameorigin') return res.send('no');
        if(xFrameOptions == 'deny') return res.send('no');
        if(xFrameOptions == 'allow-from') {
            //todo check if domain is listed.
            return res.send('yes');
        }
    });
};

exports.uploadLectureSlides = function(req, res)
{
    var access = courseTeacherPolicy.hasAnyPrivileges(req);
    if(!access) return res.send('no access');

    var buffer = req.files.file.buffer;
    var zip = new JSZip(buffer);

    var fileNames = Object.keys(zip.files);

    var xmlFileNames = fileNames.filter(function(fName) { return fName.substr(fName.length-4) === '.xml'});

    if(xmlFileNames.length !== 1)
    {
        return res.status(400).send({
            message: 'Did not find 1 XML file, but ' + xmlFileNames.length
        });
    }
    var xmlFileName = xmlFileNames[0];

    var materialsFolderNames = fileNames.filter(function(fName) { return fName === 'materials/'; });

    if(materialsFolderNames.length !== 1)
    {
        return res.status(400).send({
            message: 'Did not find 1 Materials folder, but ' + materialsFolderNames.length
        });
    }

    var pdfPath;

    function uploadPdfs()
    {
        var pdfFileNames = fileNames.filter(function(fName) {
            return fName.substr(fName.length - 4).toLowerCase() === '.pdf';
        });
        var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
        var randomString = '';
        for(var i = 0; i < 15; i++) {
            randomString += alphabet[Math.round(Math.random() * (alphabet.length - 1))];
        }
        pdfPath = randomString;
        var directory = './modules/contents/client/uploads/slides/' + pdfPath;

        mkdirp(directory, function(err)
        {
            if(err) throw err;

            pdfFileNames.forEach(function(pdfFileName)
            {
                var fileNameOnly = pdfFileName.substr(pdfFileName.lastIndexOf('/'));
                var buffer = new Buffer(zip.file(pdfFileName).asUint8Array());
                fs.writeFile(directory + fileNameOnly, buffer, function(err)
                {
                    if (err) throw err;
                })
            });
        });
    }

    uploadPdfs();
    //todo gotta get the correct paths for the pdfs for the timeStamps array.

    var timeStamps = [];

    function addPdfPath(slideHtmlPath, time)
    {
        var index = fileNames.indexOf(slideHtmlPath);
        if(index === -1)
        {
            /*return res.status(400).send({
                message: 'slide html not included, but mentioned in xml: ' + slideHtmlPath
            });*/
            console.error('slide html not included, but mentioned in xml: ' + slideHtmlPath);
        }
        else
        {
            var slideHtml = zip.files[fileNames[index]].asText();

            var $ = cheerio.load(slideHtml);
            var slideBodySrc = $("#slideBody")[0];
            //console.log(slideBodySrc);

            if (slideBodySrc !== undefined && slideBodySrc.attribs.src !== undefined) {

                //var slidePdf= slideBodySrc.attribs.src.replace(/http:\/\/[a-z.]+(:[0-9]+)?\//g, lecturePath + 'materials/');
                var slidePdf = slideBodySrc.attribs.src.replace(/http:\/\/[a-z.]+(:[0-9]+)?\//g, '');
                slidePdf = slidePdf.substr(slidePdf.lastIndexOf('/'));
                slidePdf = pdfPath + slidePdf;

                timeStamps.push({
                    time: time,
                    slidepdf: slidePdf
                });
            }
        }
    }

    //var xmlFile = zip.files[xmlFileNames[0]];
    var xmlFileContent = zip.file(xmlFileName).asText();

    var parseString = require('xml2js').parseString;
    var options = { 'explicitArray': false };
    parseString(xmlFileContent, options, function (err, xmlData)
    {
        var toc = xmlData.presentation.hour.toc.entry; // Table of contents with segment names
        var slideFrames = xmlData.presentation.hour.timestamps.slide; // Synchronization data

        for(var i = 0; i < slideFrames.length; i++)
        {
            var time = parseInt(slideFrames[i].timeInSeconds);
            //url = lecturePath + slideFrames[i].url;

            addPdfPath(slideFrames[i].url, time);
        }

        var segments = [];

        for(i = 0; i < toc.length; i++)
        {
            segments.push({
                title: toc[i].text,
                start: toc[i].timeInSeconds
            });
        }

        res.jsonp({segments: segments, timestamps: timeStamps});
    });
};

/**
 * List of Courses
 */
exports.list = function(req, res) {

    var qObject = {};

    // allowed query parameters:
    if (req.query['_id']){
        qObject['_id'] = new ObjectId(req.query['_id']);
    }
    if (req.query['courses']){
        qObject['courses'] = new ObjectId(req.query['courses']);
    }

    Source.find(qObject).sort('+created').exec(function(err, sources) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(sources);
        }
    });
};

/**
 * Course middleware
 */
exports.sourceByID = function(req, res, next, id) {
    Source.findById(id).populate('user', 'displayName').exec(function(err, source) {
        if (err) return next(err);
        if (! source) {
            // For POST requests, allow it to specify a Concept via ID that might not exist (yet). This allows creation of concepts with specific ID.
            if(req.method != 'POST')
                return next(new Error('Failed to load Source ' + id));
        }
        req.source = source ;
        next();
    });
};

/**
 * Course authorization middleware
 */

exports.isCourseContentEditor = function(req, res, next)
{
    var userId = req.user._id;
    var sourceCourses = req.body.courses;

    if(req.user.roles && (req.user.roles.indexOf("admin") != -1 || req.user.roles.indexOf("teacher") != -1))
    {
        next();
    }
    else
    {
        Courseadmin.find({user: userId}).exec(function(err, admins)
        {
            if (admins === undefined || admins.filter(function(c) { var courseId = '' + c.course; return sourceCourses.indexOf(courseId) !== -1 && ['content-editor', 'teacher', 'ta'].indexOf(c.type) !==-1; }).length == 0)
            {
                return res.status(403).send('User is not authorized: need content editor permission for this course');
            }
            else
            {
                next();
            }
        });
    }
};
