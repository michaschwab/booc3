'use strict';

angular.module('contents').controller('ContentsController',
    function($scope, $stateParams, Courses, Sourcetypes, Sources, Segments, $timeout, $location, Concepts)
    {
        $scope.courseId = $stateParams.courseId;
        $scope.sourceTypeMap = {};
        $scope.sourceTypes = [];
        $scope.sourceSegments = {};
        $scope.conceptMap = {};

        Concepts.query(function(concepts)
        {
            $scope.concepts = concepts;

            concepts.forEach(function(concept)
            {
                $scope.conceptMap[concept._id] = concept;
            });
        });

        Sources.query(function(sources)
        {
            $scope.sources = sources;

            Sourcetypes.query(function(sourceTypes)
            {
                $scope.sourceTypes = sourceTypes;

                sourceTypes.forEach(function(sourceType)
                {
                    $scope.sourceTypeMap[sourceType._id] = sourceType;
                });

                Segments.query({courses:$stateParams.courseId}).$promise.then(function(segments)
                {
                    $scope.segments = segments;


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

                    /*sources.filter(function(source)
                    {
                        return source.type == $scope.sourceType._id;
                    }).forEach(function(source)
                    {
                        $scope.sources.push(source);
                    });*/
                });

                /*sources.forEach(function(source)
                {
                    if(!$scope.sourceTypeMap[source.type])
                    {
                        $scope.sourceTypeMap[source.type] = Sourcetypes.get
                    }
                });*/
            });


        });

        $scope.getSegmentsNumberShort = function(num, source)
        {
            if(!$scope.sourceSegments[source._id] || num > $scope.sourceSegments[source._id].length)
            {
                //console.log($scope.sourceSegments[source._id].length);
                num = !$scope.sourceSegments[source._id] ? 0 : $scope.sourceSegments[source._id].length;
            }

            return new Array(num);
        };

        $scope.getConceptsNumberShort = function(num, source)
        {
            if(!$scope.sourceSegments[source._id])
            {
                num = 0;
            }
            else
            {
                var conceptNum = 0;
                $scope.sourceSegments[source._id].forEach(function(seg) { conceptNum += seg.concepts.length; });


                if(num > conceptNum)
                    num = conceptNum;
            }

            return new Array(num);
        };
    });
