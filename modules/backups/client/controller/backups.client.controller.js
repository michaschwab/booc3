'use strict';

angular.module('actions').controller('BackupsController',
    function($scope, $stateParams, $location, Authentication, Actions, $interval, Undo, Users, Courses)
    {
        $scope.courses = Courses.query();
        $scope.courseSelect = function(course)
        {
            $scope.course = course;
        };
    });
