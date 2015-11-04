'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    auth.hasOneRole = function(roles)
    {
      for(var i = 0; i < roles.length; i++)
      {
        var role = roles[i];

        if(auth.user.roles.indexOf(role) !== -1)
          return true;
      }

      return false;
    };

    auth.isCourseTeachingAssistant = function(courseId)
    {
      var roles = auth.user.roles;

      return auth.hasOneRole(['admin', 'courseadmin;teacher;'+courseId, 'courseadmin;ta;'+courseId]);
    };

    return auth;
  }
]);
