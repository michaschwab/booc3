'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/learnedconcepts',
            permissions: '*'
        },
        {
            resources: '/api/learnedconcepts/:learnedconceptId',
            permissions: '*'
        }]
    }]);
};

/**
 * Check If Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    if(req.learnedconcept && req.learnedconcept.user.__id != req.user.__id)
    {
        /*console.log(req.learnedconcept.user);
        console.log(req.user);*/

        return res.status(403).json({
            message: 'User is not authorized'
        });
    }
    // Check for user roles
    //console.log(roles, req.route.path, req.method.toLowerCase());
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
