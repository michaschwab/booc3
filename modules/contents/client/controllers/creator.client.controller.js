'use strict';

angular.module('contents').controller('CreatorController',
    function($scope, $stateParams, Courses, Sourcetypes, Sources, Segments, $timeout, $location, LectureCreator, WikiCreator, LTICreator, Concepts, $filter)
    {
        $scope.courseId = $stateParams.courseId;
        $scope.activeReadableType = '';
        $scope.defaultReadableType = 'lecture';
        $scope.activeType = null;
        $scope.source = {};
        $scope.allConcepts = [];
        $scope.concepts = [];
        $scope.readableTypes = [];
        $scope.segments = [];

        $scope.activeTimes = {start: 0, end: 0};
        $scope.activeSegment = null;
        $scope.activeConcept = null;
        $scope.newConcept = null;

        $scope.addingConcept = null;

        $scope.init = function()
        {
            Courses.query(function(courses)
            {
                if (courses.length>0)
                {
                    $scope.courses = courses;
                    $scope.courseIds = courses.map(function(c) { return c._id; });

                    var courseSearchScope = angular.element('.course-select').scope().$$childHead;
                    courseSearchScope.$select.selected = $scope.courses[$scope.courseIds.indexOf($scope.courseId)];
                }
            });

            Concepts.query().$promise.then(function(concepts)
            {
                $scope.allConcepts = concepts;
                $scope.conceptMap = {};
                concepts.forEach(function(concept)
                {
                    $scope.conceptMap[concept._id] = concept;
                });

                if($stateParams.conceptId)
                {
                    $scope.conceptId = $stateParams.conceptId;

                    $scope.addingConcept = $scope.conceptMap[$scope.conceptId];
                }

                Sourcetypes.query().$promise.then(function(sourcetypes)
                {
                    $scope.sourcetypes = sourcetypes;
                    if($scope.defaultReadableType)
                    {
                        $scope.readableTypes = $scope.sourcetypes.map(function(s) { return $scope.getReadableType(s); });
                        $scope.activeType = $scope.sourcetypes[$scope.readableTypes.indexOf($scope.defaultReadableType)];
                    }

                    $scope.updateActive();

                    Sources.query(function(sources)
                    {
                        $scope.sources = sources;

                        sources.forEach(function(source)
                        {
                            source.typeObject = $scope.sourcetypes.filter(function(t) { return t._id == source.type; })[0];
                        });
                    });

                    if($stateParams.sourceId)
                    {
                        $scope.sourceId = $stateParams.sourceId;

                        Sources.query({_id: $scope.sourceId}, function(sources)
                        {
                            if(sources.length === 1)
                            {
                                $scope.source = sources[0];
                                $scope.editSource = $scope.source;

                                Segments.query({source: $scope.sourceId}, function(segments)
                                {
                                    $scope.segments = segments.filter(function(s) { return s.source == $scope.sourceId });

                                    $scope.segments.forEach(function(segment)
                                    {
                                        segment.conceptObjects = segment.concepts.map(function(conceptId)
                                        {
                                            return $scope.conceptMap[conceptId];
                                        });
                                    });
                                });

                                var type = $scope.sourcetypes.filter(function(t) { return t._id == $scope.source.type; })[0];
                                $scope.setSourcetype(type);
                            }
                            else
                            {
                                var e = new Error('Problem occurred at searching for source, found ' + sources.length + ' results!');
                                console.log(e.stack);
                            }
                        })
                    }
                });
            });
        };
/*
        $scope.addConcept = function(concept, scope)
        {
            console.log(concept);
            $scope.activeSegment.conceptObjects.push(concept);
            scope.$select.selected = null;
        };
*/
        $scope.$watch('editSource', function()
        {
            var source = $scope.editSource;

            if(source && source != $scope.source)
            {
                //console.log($scope.editSource);
                //$scope.activeType = $scope.sourcetypes.filter(function(t) { return t._id == source.type; })[0];
                var address = 'courses/' + $scope.courseId;
                if($scope.conceptId) address += '/concepts/' + $scope.conceptId;
                address += '/contents/' + source._id + '/edit';

                $location.url(address);
            }
        });

        //$scope.$watchGroup(['allConcepts', 'course'], function()
        $scope.$watchCollection('[allConcepts, course]', function()
        {
            if($scope.course)
            {
                //console.log($scope.course, $scope.allConcepts);
                $scope.concepts = $scope.allConcepts.filter(function(c)
                {
                    return c.courses.indexOf($scope.course._id) !== -1;
                });
            }
        });

        $scope.$watch('activeSegment', function()
        {
            if($scope.activeSegment && $scope.addingConcept)
            {
                $scope.activeSegment.conceptObjects.push($scope.addingConcept);
            }
        });

        $scope.updateActive = function()
        {
            var searchParams = $location.search();

            var newReadableType = searchParams.type;
            var index = $scope.readableTypes.indexOf(newReadableType);
            if(index !== -1)
            {
                $scope.activeType = $scope.sourcetypes[index];
            }
        };

        $scope.createContents = function()
        {
            var courseId = $scope.source.course._id;
            $scope.source.type = $scope.activeType._id;
            $scope.source.courses = [$scope.source.course._id];
            delete $scope.source.course;

            var cb = function(v)
            {
                console.log("saved:", v);
                $scope.error = "saved  at " +new Date();

                if($scope.segments.length > 0)
                {
                    console.log($scope.segments);
                    $scope.segments.forEach(function(segment)
                    {
                        var conceptIds = segment.conceptObjects.map(function(concept)
                        {
                            return concept._id;
                        });
                        delete segment.conceptObjects;
                        segment.concepts = conceptIds;

                        var cb2 = function()
                        {

                        };

                        if(segment._id)
                        {
                            Segments.update({_id: segment._id}, segment, cb2,
                                function(err){
                                    console.log("ERROR saving:", err);
                                    console.log(err.data);
                                    $scope.error = "DID NOT SAVE !! (Error) ";
                                }
                            );
                        }
                        else
                        {
                            var seg = new Segments(segment);
                            seg.$save(cb2);
                        }
                    });
                }
            };
            var source = $scope.source;

            if($scope.source._id)
            {
                console.log('saving edited source..');

                Sources.update({_id:$scope.source._id}, $scope.source, cb,
                    function(err){
                        console.log("ERROR saving:", err);
                        console.log(err.data);
                        $scope.error = "DID NOT SAVE !! (Error) ";
                    }
                );
            }
            else
            {
                console.log('saving new source..');
                var src = new Sources($scope.source);
                src.$save(cb);
            }



            /*var source = new Source({
             type: $scope.activeType._id,
             title: $scope.source.title,
             path: $scope.source.path,
             course: $scope.source.course._id,
             data: $scope.source.data
             });*/



            //skyvar course = Course.$getById($scope.source.course._id);

            /*
            $scope.source.save(function()
            {
                if($scope.segments.length > 0)
                {
                    var segIds = [];
                    var cb = function(seg)
                    {
                        return function()
                        {
                            segIds.push(seg._id);

                            if(seg.concepts !== undefined && seg.concepts.length === 1)
                            {
                                var concept = Concept.$getById(seg.concepts[0], function()
                                {
                                    if(concept.segments === undefined)
                                    {
                                        concept.segments = [seg._id];
                                        console.log('updating concept..', concept);
                                        concept.save();
                                    }
                                    else if(concept.segments.indexOf(seg._id) === -1)
                                    {
                                        concept.segments.push(seg._id);
                                        console.log('updating concept..', concept);
                                        concept.save();
                                    }
                                    // Otherwise the concept already has the segment linked.
                                });
                            }

                            if(segIds.length === $scope.segments.length)
                            {
                                // could add them to course and to source here, but dont need that?
                            }
                        }
                    };

                    for(var i = 0; i < $scope.segments.length; i++)
                    {
                        var data = $scope.segments[i];
                        console.log(data);

                        data.source = source._id;
                        data.courses = [courseId];

                        data.save(cb(data));

                        $location.path('/sources');
                    }
                }
                else
                {
                    //TODO create segment of whole length
                }
            });*/

        };


        $scope.$watch('activeReadableType', function(readable)
        {
            if(readable === 'lecture')
            {
                LectureCreator.start($scope);
            }
            else if(readable === 'wikipediaarticle')
            {
                WikiCreator.start($scope);
            }
            else if(readable === 'lti')
            {
                LTICreator.start($scope);
            }
        });

        $scope.$watch('activeType', function()
        {
            if($scope.activeType)
            {
                $scope.activeReadableType = $scope.getReadableType($scope.activeType);
            }
        });

        $scope.getReadableType = function(sourcetype)
        {
            return sourcetype.title.toLowerCase().replace(/[^a-z]/g,'');
        };

        $scope.selectSourcetype = function(type, event)
        {
            event.preventDefault();

            $scope.setSourcetype(type);
        };

        $scope.setSourcetype = function(type)
        {
            $location.search('type', $scope.getReadableType(type));
        };

        $scope.activeSegmentTimeChange = function()
        {
            var mapToNumbers = function(secs) { return parseInt(secs); };
            var startSplit = $scope.activeTimes.startFormatted.split(':').map(mapToNumbers);
            var endSplit = $scope.activeTimes.endFormatted.split(':').map(mapToNumbers);

            $scope.activeSegment.start = 3600 * startSplit[0] + 60 * startSplit[1] + startSplit[2];
            $scope.activeSegment.end = 3600 * endSplit[0] + 60 * endSplit[1] + endSplit[2];
        };

        $scope.addSegment = function()
        {
            //var randNum = parseInt(Math.rand() * 100000);
            //var segment = new Segment({title: 'New Segment', _id: 'a'+randNum});
            var segment = new Object({title: 'New Segment', start: 0, end: 0});

            if($scope.segments.length !== 0 && $scope.segments[$scope.segments.length-1].end === segment.end)
            {
                $scope.segments[$scope.segments.length-1].end = segment.start;
            }

            $scope.segments.push(segment);
            $scope.selectSegment(segment);
        };

        $scope.removeAllSegments = function()
        {
            $scope.segments = [];
        };

        $scope.selectSegment = function(segment)
        {
            $scope.activeSegment = segment;

            //$scope.activeTimes.start = new Date(1970, 0, 1, 0, 0, segment.start);
            //$scope.activeTimes.end = new Date(1970, 0, 1, 0, 0, segment.end);

            $scope.activeTimes.startDuration = moment.duration(segment.start * 1000);
            $scope.activeTimes.endDuration = moment.duration(segment.end * 1000);

            //$scope.activeTimes.startFormatted = $filter('time')(segment.start, 'HH:mm:ss', 'UTC');
            //$scope.activeTimes.endFormatted = $filter('time')(segment.end, 'HH:mm:ss', 'UTC');

            if(segment.concepts && segment.concepts.length > 0)
            {
                segment.conceptObjects = segment.concepts.map(function(conceptId)
                {
                    return $scope.getConceptById(conceptId);
                });
            }
            else
            {
                segment.conceptObjects = [];
            }
            //$scope.activeConcept = segment.concepts && segment.concepts.length > 0 ? $scope.getConceptById(segment.concepts[0]) : null;

            $('#segmentTitle').focus();
            window.setTimeout (function(){
                $('#segmentTitle').select();
            }, 100);
            //todo check if segment has any concepts.
        };


        $scope.$on('$locationChangeSuccess', $scope.updateActive);

    }).filter('time', function() {
        return function(input, format) {
            input = input || 0;
            //console.log(input);

            var date = new Date(null);
            date.setUTCSeconds(input);

            return date.toISOString().substr(11, 8);
        };
    });
