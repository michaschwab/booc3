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
        providerData.huidHash = hash;

	var userName = '';
	var userNameCharacters = 'abcdefghijklmnopqrstuvwxyz';
	for(var i = 0; i < 13; i++) {
		var index = Math.round(Math.random()*(userNameCharacters.length-1));
		userName += userNameCharacters[index];
	}

        // Create the user OAuth profile
        var providerUserProfile = {
            provider: 'cas',
	    username: userName,
            providerIdentifierField: 'huidHash',
            providerData: providerData
        };

        // Save the user OAuth profile
        users.saveOAuthUserProfile(req, providerUserProfile, done);

    }));
};
