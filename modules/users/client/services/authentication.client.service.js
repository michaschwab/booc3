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
    auth.hasRole = function(role)
    {
      return auth.user.roles.indexOf(role) !== -1;
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

    auth.canCreateCourses = function()
    {
      return auth.hasRole('admin') || auth.hasRole('teacher');
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
]);
