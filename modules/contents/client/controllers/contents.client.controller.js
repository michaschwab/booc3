'use strict';

angular.module('contents').controller('ContentsController',
    function($scope, $stateParams, Courses, Sourcetypes, Sources, Segments, $timeout, $location, Concepts, Authentication, $state)
    {
        $scope.courseId = $stateParams.courseId;
        $scope.sourceTypeMap = {};
        $scope.sourceTypes = [];
        $scope.sourceSegments = {};
        $scope.conceptMap = {};

        var hasAccess = Authentication.isOneCourseAdmin();
        if(!hasAccess)
        {
            console.error('no access: not content editor of any course');
            $state.go('home');
        }

        Concepts.query(function(concepts)
        {
            $scope.concepts = concepts;

            concepts.forEach(function(concept)
            {
                $scope.conceptMap[concept._id] = concept;
            });
        });

        $scope.sources = Sources.query(function()
        {
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


                    $scope.sources.forEach(function(source)
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

                    /*$scope.sources.filter(function(source)
                    {
                        return source.type == $scope.sourceType._id;
                    }).forEach(function(source)
                    {
                        $scope.sources.push(source);
                    });*/
                });

                /*$scope.sources.forEach(function(source)
                {
                    if(!$scope.sourceTypeMap[source.type])
                    {
                        $scope.sourceTypeMap[source.type] = Sourcetypes.get
                    }
                });*/
            });


        });

        $scope.removeSourceOnly = function(event, sourceId)
        {
            event.preventDefault();
            event.stopPropagation();

            var src = $scope.sources.filter(function(source) { return source._id == sourceId; })[0];
            src.$remove({sourceOnly: true});

            return false;
        };

        $scope.removeSource = function(event, sourceId)
        {
            event.preventDefault();
            event.stopPropagation();

            var src = $scope.sources.filter(function(source) { return source._id == sourceId; })[0];
            src.$remove();

            return false;
        };

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
