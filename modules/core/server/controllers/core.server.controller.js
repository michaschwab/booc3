'use strict';

var path = require('path'),
    config = require(path.resolve('./config/config')),
    mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport(config.mailer.options);
var courseadmin = require('../../../users/server/controllers/courseadmin.server.controller.js');

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};

exports.sendFeedback = function(req, res, next)
{
  async.waterfall([
    function(done) {
      //var mainAdmin = 'michaschwab@gmail.com';
      var mainAdmin = 'booc.harvard@gmail.com';

      if(req.body.course && req.body.course._id)
      {
        courseadmin.getCourseAdmins(req.body.course._id, function(admins)
        {
          var receivers = admins.map(function(admin) { return admin.email; }).filter(function(email) { return (email);});
          receivers.push(mainAdmin);

          var uniqueReceivers = receivers.filter(function(item, pos) {
            return receivers.indexOf(item) == pos;
          });

          done(null, uniqueReceivers);
        });
      }
      else
      {
        done(null, [mainAdmin]);
      }
    },
    function (receivers, done)
    {
      res.render(path.resolve('modules/core/server/views/feedback-email'), {
        user: req.user,
        userId: req.user._id.toString(),
        appName: config.app.title,
        url: req.headers.host,
        formData: req.body
      }, function (err, emailHTML) {
        done(err, emailHTML, receivers, req.user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, receivers, done)
    {
      var count = 0;
      var err = 0;

      receivers.forEach(function(receiver)
      {
        var mailOptions = {
          to: receiver,
          from: config.mailer.from,
          subject: 'booc.io Feedback',
          html: emailHTML
        };
        smtpTransport.sendMail(mailOptions, function (singleErr) {
          count++;
          if (singleErr) err = singleErr;

          if(count == receivers.length - 1)
          {
            if (!err) {
              res.send({
                message: 'Feedback has been sent.'
              });
            } else {
              console.log(err);
              return res.status(400).send({
                message: 'Failure sending email'
              });
            }
          }
          //done(err);
        });
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};
