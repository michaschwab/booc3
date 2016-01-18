'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    CasStrategy = require('passport-cas').Strategy,
    users = require('../../controllers/users.server.controller');

module.exports = function (config)
{
    passport.use(new CasStrategy({
        version: config.cas.version,
        ssoBaseURL: config.cas.ssoBaseUrl,
        serverBaseURL: config.cas.serverBaseUrl,
        validateURL: config.cas.validateUrl
    }, function(login, done) {
        console.log(arguments);
        /*User.findOne({login: login}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Unknown user'});
            }
            return done(null, user);
        });*/
    }));
};
