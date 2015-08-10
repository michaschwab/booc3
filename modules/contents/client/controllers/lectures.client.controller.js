'use strict';

angular.module('contents').controller('LecturesController',
    function($scope, $stateParams, Courses, Sourcetypes, Sources, Segments, Concepts, Authentication, $location, ConceptStructure)
    {
        $scope.findLectures = function()
        {
            $scope.courseId = $stateParams.courseId;
            var sourceTypeName = 'Lecture Duo';

            Sourcetypes.query({title: sourceTypeName}).$promise.then(function(types)
            {
                types.filter(function(type) {
                    if(type.title === sourceTypeName)
                    {
                        $scope.sourceType = type;
                    }
                });

                Sources.query().$promise.then(function(sources)
                {
                    $scope.sources = [];

                    ConceptStructure.init($scope, $stateParams.courseId);
                    ConceptStructure.getConceptsAndDeps(function()
                    {

                    });

                    Segments.query({courses:$stateParams.courseId}).$promise.then(function(segments)
                    {
                        $scope.segments = segments;
                        $scope.sourceSegments = {};

                        sources.forEach(function(source)
                        {
                            segments.filter(function(segment)
                            {
                                return segment.source === source._id;
                            }).forEach(function(segment)
                            {
                                if($scope.sourceSegments[source._id] === undefined)
                                {
                                    $scope.sourceSegments[source._id] = [];
                                }
                                $scope.sourceSegments[source._id].push(segment);
                            });
                        });

                        sources.filter(function(source)
                        {
                            return source.type == $scope.sourceType._id;
                        }).forEach(function(source)
                        {
                            $scope.sources.push(source);
                        });
                    });
                });
            });
        };

        $scope.playVideoClick = function(sourceId, courseId, $event)
        {
            //console.log(sourceId, courseId, $event);
        };

        $scope.getSegmentsNumberShort = function(num, source)
        {
            if(num > $scope.sourceSegments[source._id].length)
            {
                console.log($scope.sourceSegments[source._id].length);
                num = $scope.sourceSegments[source._id].length;
            }
            return new Array(num);
        };
    });
