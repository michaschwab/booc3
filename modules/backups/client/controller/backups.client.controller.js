'use strict';

angular.module('actions').controller('BackupsController',
    function($state, $stateParams, $http, $scope, Courses)
    {
        $scope.date = new Date();
        $scope.courses = Courses.query({}, function()
        {
            $scope.courseMap = {};
            $scope.courses.forEach(function(course) { $scope.courseMap[course._id] = course; });

            $scope.courseId = $stateParams.courseId;
            if($scope.courseId)
            {
                $scope.course = $scope.courses.filter(function(course) { return course._id == $scope.courseId; })[0];

                angular.element('.course-select').scope().$select.selected = $scope.course;

                    $http.get('api/backups/' + $scope.courseId).then(function(response)
                {
                    $scope.backups = response.data ? response.data : [];
                }, function(err)
                {
                    console.error(err);
                });
            }
        });
        $scope.courseSelect = function(course)
        {
            $scope.course = course;

            $state.go('backups.manageByCourse', { courseId: course._id });
        };


        $http.get('api/backups/').then(function(response)
        {
            $scope.backupCourseIds = response.data ? response.data : [];
        });

        $scope.upload = function(element)
        {
            if(element.files.length == 1)
            {
                var file = element.files[0];

                $http.post('api/backups', file,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }
                ).then(function(response)
                {
                    if(response.data)
                    {
                        //var backup = response.data;

                        $state.go('home');
                    }
                    else
                    {
                        console.error(response);
                    }
                });
            }
        };

        $scope.createBackup = function()
        {
            var courseId = $scope.course._id;

            $http.post('api/backups/' + courseId).then(function(response)
            {
                //success
                var fileName = response.data;
                $scope.backups.push(fileName);

            }, function(err)
            {
                console.error(err);
            });
        };
    });
