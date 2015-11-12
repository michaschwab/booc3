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
                $scope.backups = response.data ? response.data : [];
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
