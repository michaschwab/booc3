'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', function ($window, $location, $rootScope) {
    var auth = {
      user: $window.user
    };

    var user = auth.user;

    $rootScope.$on('$locationChangeSuccess', function()
    {
        checkConsent();
    });

    function checkConsent()
    {
        if(typeof user === 'object')
        {
            if(user.trackingConsent === undefined || user.trackingConsent === null)
            {
                $location.path('/consent');
            }
        }
    }

    checkConsent();

    auth.hasOneRole = function(roles)
    {
      for(var i = 0; i < roles.length; i++)
      {
        var role = roles[i];

        if(auth.user.roles && auth.user.roles.indexOf(role) !== -1)
          return true;
      }

      return false;
    };
    auth.hasRole = function(role)
    {
      return auth.user.roles && auth.user.roles.indexOf(role) !== -1;
    };

    auth.isAdmin = function()
    {
      return this.hasRole('admin');
    };
    auth.isTeacher = function()
    {
      return this.hasOneRole(['admin', 'teacher']);
    };

    auth.isCourseTeachingAssistant = function(courseId)
    {
      var roles = auth.user.roles;

      return auth.hasOneRole(['admin', 'courseadmin;teacher;'+courseId, 'courseadmin;ta;'+courseId]);
    };

    auth.isCourseContentEditor = function(courseId)
    {
        var roles = auth.user.roles;

        return auth.hasOneRole(['admin', 'courseadmin;teacher;'+courseId, 'courseadmin;ta;'+courseId, 'courseadmin;content-editor;'+courseId]);
    };

    auth.isCourseTeacher = function(courseId)
    {
        var roles = auth.user.roles;

        return auth.hasOneRole(['admin', 'courseadmin;teacher;'+courseId]);
    };

    auth.canCreateCourses = function()
    {
      return auth.isTeacher();
    };
    auth.canEditCourse = function(courseId)
    {
      return auth.isCourseTeachingAssistant(courseId);
    };
    auth.isOneCourseAdmin = function()
    {
      var roles = auth.user.roles.map(function(role) { return role.substr(0, 'courseadmin'.length)});
      return roles.indexOf('admin') !== -1 || roles.indexOf('teacher') !== -1 || roles.indexOf('courseadmin') !== -1;
    };


    return auth;
  }
);
