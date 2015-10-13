'use strict';

var path = require('path'),
    config = require(path.resolve('./config/config')),
    mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

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
    // Lookup user by username
    function (done) {
      //todo need to ask the user for permission to use the user info, otherwise anonymize.
      res.render(path.resolve('modules/core/server/views/feedback-email'), {
        user: req.user,
        appName: config.app.title,
        formData: req.body
      }, function (err, emailHTML) {
        done(err, emailHTML, req.user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, done) {
      var mailOptions = {
        to: 'michaschwab@gmail.com',
        from: config.mailer.from,
        subject: 'booc.io Feedback',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
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

        //done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};
