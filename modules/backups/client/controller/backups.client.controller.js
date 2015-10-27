'use strict';

angular.module('actions').controller('BackupsController',
    function($http, $scope, Courses, Concepts, Conceptdependencies, Courseevents, Sources, Segments)
    {
        $scope.date = new Date();
        $scope.courses = Courses.query();
        $scope.courseSelect = function(course)
        {
            $scope.course = course;

            $http.get('api/backups/' + course._id).then(function(response)
            {
                $scope.backups = response.data;
            }, function(err)
            {
                console.error(err);
            })
        };

        $scope.createBackup = function()
        {
            var courseId = $scope.course._id;

            var backup = {};
            backup.course = $scope.course;
            backup.concepts = Concepts.query({ courses: [courseId]}, function()
            {
                backup.conceptdependencies = Conceptdependencies.query({course: courseId }, function()
                {
                    backup.courseevents = Courseevents.query({course: courseId}, function()
                    {
                        backup.sources = Sources.query({courses: [courseId]}, function()
                        {
                            // Get all Segments of these Sources, not only the segments that are assigned to the given course,
                            // Since we're assuming that the Segments and Sources will be removed before restoring and
                            // therefore we would otherwise lose all segments that have not been assigned to the course.

                            var sourceIds = backup.sources.map(function(s) { return s._id; });
                            backup.segments = Segments.query({ source: { $in: sourceIds } }, function()
                            {
                                $scope.backup = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
                                $http.post('api/backups', backup).then(function()
                                {
                                    //success
                                    console.log('success');

                                }, function(err)
                                {
                                    console.error(err);
                                });
                            });
                        });
                    });
                });
            });
        };
    });
