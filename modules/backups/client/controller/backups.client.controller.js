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
                        var backup = response.data;

                        var course = new Courses(backup.course);
                        course.$save();

                        backup.concepts.forEach(function(conceptData)
                        {
                            var concept = new Concepts(conceptData);
                            concept.$save();
                        });
                        backup.conceptdependencies.forEach(function(depData)
                        {
                            var dep = new Conceptdependencies(depData);
                            dep.$save();
                        });
                        backup.courseevents.forEach(function(eventData)
                        {
                            var event = new Courseevents(eventData);
                            event.$save();
                        });
                        backup.sources.forEach(function(srcData)
                        {
                            var source = new Sources(srcData);
                            source.$save();
                        });
                        backup.segments.forEach(function(segData)
                        {
                            var seg = new Segments(segData);
                            seg.$save();
                        });
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
                                $http.post('api/backups/' + courseId, backup).then(function(response)
                                {
                                    //success
                                    var fileName = response.data;
                                    $scope.backups.push(fileName);

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
