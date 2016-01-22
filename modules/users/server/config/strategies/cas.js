'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    CasStrategy = require('passport-cas').Strategy,
    sha512 = require('js-sha512'),
    users = require('../../controllers/users.server.controller');

module.exports = function (config)
{
    passport.use(new CasStrategy(config.cas, function(req, login, done) {

        var huid = login.user;
        var hash = sha512(config.salt + huid);

        var providerData = {};
        providerData.accessToken = hash;

        // Create the user OAuth profile
        var providerUserProfile = {
            provider: 'cas',
            providerIdentifierField: 'id',
            providerData: providerData
        };

        // Save the user OAuth profile
        users.saveOAuthUserProfile(req, providerUserProfile, done);

    }));
};
