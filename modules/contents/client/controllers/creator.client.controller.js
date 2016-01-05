'use strict';

angular.module('contents').controller('CreatorController',
    function($scope, $stateParams, $state, Courses, Sourcetypes, Sources, Segments, $timeout, $location, LectureCreator, WikiCreator, LTICreator, Concepts, $filter, YoutubeCreator, WebsiteCreator, PdfCreator, ExtensionSchoolCreator)
    {
        $scope.courseId = $stateParams.courseId;
        $scope.stateParams = $stateParams;

        $scope.possibleActions = {
            'add_edit': 'Add Material from Existing [icon] Source',
            'edit': 'Edit [icon] Source',
            'create': 'Add New [icon] Source',
            'add': 'Add Material'
        };
        $scope.locationSearch = $location.search();
        if($scope.locationSearch.addTo)
        {
            $scope.activeAction = $stateParams.sourceId ? 'add_edit' : 'add';
        }
        else
        {
            $scope.activeAction = $stateParams.sourceId ? 'edit' : 'create';
        }

        $scope.activeReadableType = '';
        //$scope.defaultReadableType = 'youtube';
        $scope.activeType = null;
        $scope.source = {};
        $scope.allConcepts = [];
        $scope.concepts = [];
        $scope.readableTypes = [];
        $scope.segments = [];
        $scope.deletedSegments = [];
        var sourceHelper;

        $scope.activeTimes = {start: 0, end: 0};
        $scope.activeSegment = null;
        $scope.activeConcept = null;
        $scope.newConcept = null;

        $scope.init = function()
        {
            Courses.query(function(courses)
            {
                if (courses.length>0)
                {
                    $scope.courses = courses;
                    $scope.courseIds = courses.map(function(c) { return c._id; });

                    var courseSearchScope = angular.element('.course-select').scope().$$childHead;

                    if($scope.courseId)
                    {
                        courseSearchScope.$select.selected = $scope.courses[$scope.courseIds.indexOf($scope.courseId)];
                    }
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

                Sourcetypes.query().$promise.then(function(sourcetypes)
                {
                    $scope.sourcetypes = sourcetypes;
                    $scope.readableTypes = $scope.sourcetypes.map(function(s) { return $scope.getReadableType(s); });

                    /*if($scope.defaultReadableType)
                    {
                        $scope.activeType = $scope.sourcetypes[$scope.readableTypes.indexOf($scope.defaultReadableType)];
                    }*/

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
                                var activeCourseIds = $scope.source.courses;
                                if(activeCourseIds.length === 1)
                                {
                                    $scope.courseId = activeCourseIds[0];
                                    $scope.course = $scope.courses[$scope.courseIds.indexOf($scope.courseId)];
                                }
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

        $scope.addConcept = function(concept, scope)
        {
            if(!$scope.activeSegment.conceptObjects) $scope.activeSegment.conceptObjects = [];
            $scope.activeSegment.conceptObjects.push(concept);
            scope.$select.selected = null;
        };

        $scope.removeConceptFromSegment = function(concept)
        {
            var index = $scope.activeSegment.conceptObjects.indexOf(concept);
            if(index !== -1)
            {
                $scope.activeSegment.conceptObjects.splice(index, 1);
            }
            else
            {
                console.log('could not find ', concept, ' in ' + $scope.activeSegment.conceptObjects);
            }
        };

        $scope.$watch('editSource', function()
        {
            var source = $scope.editSource;

            if(source && source != $scope.source)
            {
                $scope.source = source;
                //console.log($scope.editSource);
                //$scope.activeType = $scope.sourcetypes.filter(function(t) { return t._id == source.type; })[0];
                var conceptId = $scope.conceptId ? $scope.conceptId : $stateParams.conceptId;
                var courseId = source.course ? source.course : $scope.courseId;

                if(conceptId)
                {
                    var currentParams = $location.search();

                    var params = {
                        courseId: courseId,
                        conceptId: conceptId,
                        sourceId: source._id,
                        mode: 'admin'
                    };

                    if(currentParams.active)
                        params.active = currentParams.active;
                    if(currentParams.addTo)
                        params.addTo = currentParams.addTo;

                    $state.go('contents.editByCourseAndConcept', params);
                }
                else
                {
                    console.log('dont know where to go!');

                    var address = 'courses/' + courseId;
                    if(conceptId) address += '/concepts/' + conceptId;
                    address += '/contents/' + source._id + '/edit';
                    console.log(address);
                }

                /*
                 contents.editByCourseAndConcept', {
                 url: '/courses/:courseId/concepts/:conceptId/contents/:sourceId/edit?mode&active&addTo',
                 */


                //$location.url(address);
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
                    // Check if concept is in selected course
                    if(c.courses.indexOf($scope.course._id) === -1)
                        return false;

                    // Now, check if it has children.
                    // c.children is not well maintained, so have to use .parents.
                    return $scope.allConcepts.filter(function(d) { return d.parents.indexOf(c._id) !== -1; }).length === 0;
                });
            }
        });

        $scope.$watch('activeSegment', function()
        {
            if($scope.activeSegment && $scope.addToConcept)
            {
                if($scope.activeSegment.conceptObjects.map(function(c) { return c._id; }).indexOf($scope.addToConcept.concept._id) === -1)
                    $scope.activeSegment.conceptObjects.push($scope.addToConcept.concept);
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

        var getFixedSourceTypeId = function()
        {
            if($scope.activeReadableType == 'youtube' && YoutubeCreator.isLecture())
            {
                var index = $scope.readableTypes.indexOf('lecture');
                return $scope.sourcetypes[index]._id;
            }
            return $scope.activeType._id;
        };

        var redirectBack = function()
        {
            if($scope.courseId || $scope.course._id)
            {
                var courseId = $scope.courseId ? $scope.courseId : $scope.course._id;

                $state.go('courses.view', {
                    courseId: courseId,
                    mode: 'admin'
                });
            }
            else
            {
                $state.go('courses.list');
            }
        };

        $scope.cancel = function()
        {
            redirectBack();
        };

        $scope.createContents = function()
        {
            $scope.source.type = getFixedSourceTypeId();
            $scope.source.courses = [$scope.course._id];
            //todo be more flexible and allow multiple courses
            //delete $scope.course;

            var cb = function(v)
            {
                console.log("saved:", v);
                $scope.error = "saved  at " +new Date();

                if($scope.segments.length > 0)
                {
                    $scope.deletedSegments.forEach(function(segment)
                    {
                        if(segment._id)
                        {
                            segment.$remove();
                        }
                    });

                    $scope.segments.forEach(function(segment)
                    {
                        var conceptIds = !segment.conceptObjects ? [] : segment.conceptObjects.map(function(concept)
                        {
                            return concept._id;
                        });

                        delete segment.conceptObjects;
                        segment.concepts = conceptIds;
                        segment.source = v._id;

                        //todo be more flexible and allow multiple courses
                        segment.courses = [$scope.course._id];

                        var cb2 = function()
                        {
                            //TODO do some smart redirect.
                            redirectBack();
                        };

                        if(segment._id)
                        {
                            console.log('updating segment');
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
                            console.log('creating new segment');

                            if(!segment.title)
                            {
                                segment.title = $scope.source.title;
                            }

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
        };

        $scope.$watch('activeReadableType', function(readable)
        {
            if(readable === 'lecture')
            {
                sourceHelper = LectureCreator;
            }
            else if(readable === 'wikipediaarticle')
            {
                sourceHelper = WikiCreator;
            }
            else if(readable === 'lti')
            {
                sourceHelper = LTICreator;
            }
            else if(readable === 'youtube')
            {
                sourceHelper = YoutubeCreator;
            }
            else if(readable === 'website')
            {
                sourceHelper = WebsiteCreator;
            }
            else if(readable === 'pdf')
            {
                sourceHelper = PdfCreator;
            }
            else if(readable === 'harvardextensionschool')
            {
                sourceHelper = ExtensionSchoolCreator;
            }

            if(sourceHelper)
            {
                sourceHelper.start($scope);
            }
        });

        $scope.setSegmentStart = function()
        {
            if($scope.activeSegment)
            {
                $scope.activeTimes.startDuration = moment.duration(sourceHelper.getCurrentPosition() * 1000);
            }
        };
        $scope.setSegmentEnd = function()
        {
            if($scope.activeSegment)
            {
                $scope.activeTimes.endDuration = moment.duration(sourceHelper.getCurrentPosition() * 1000);
            }
        };

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
            var readableType = $scope.getReadableType(type);
            if(readableType === 'lecture') readableType = 'youtube';

            var current = $location.search();

            if(!current)
                return;

            //$location.search('type', readableType);

            var index = $scope.readableTypes.indexOf(readableType);
            if(index !== -1)
            {
                $scope.activeType = $scope.sourcetypes[index];
            }
        };

        function activeSegmentTimesChange()
        {
            if(!$scope.activeTimes.startDuration) return;

            $scope.activeSegment.start = Math.round($scope.activeTimes.startDuration._milliseconds / 1000);
            $scope.activeSegment.end = Math.round($scope.activeTimes.endDuration._milliseconds / 1000);
        }

        $scope.$watch('activeTimes.startDuration', activeSegmentTimesChange, true);
        $scope.$watch('activeTimes.endDuration', activeSegmentTimesChange, true);

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
            if($scope.activeSegment == segment) return;

            $scope.activeSegment = segment;

            $scope.activeTimes.startDuration = moment.duration(segment.start * 1000);
            $scope.activeTimes.endDuration = moment.duration(segment.end * 1000);

            if(segment.concepts && segment.concepts.length > 0)
            {
                segment.conceptObjects = segment.concepts.map(function(conceptId)
                {
                    return $scope.conceptMap[conceptId];
                });
            }
            else
            {
                segment.conceptObjects = [];
            }
            //$scope.activeConcept = segment.concepts && segment.concepts.length > 0 ? $scope.conceptMap[segment.concepts[0]] : null;

            /*$('#segmentTitle').focus();
            window.setTimeout (function(){
                $('#segmentTitle').select();
            }, 100);*/
            //todo check if segment has any concepts.
        };

        $scope.deleteSegment = function()
        {
            $scope.segments.splice($scope.segments.indexOf($scope.activeSegment), 1);
            $scope.deletedSegments.push($scope.activeSegment);
            $scope.activeSegment = null;
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
    }).directive("contenteditable", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {

            function read() {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function() {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur keyup change", function() {
                scope.$apply(read);
            });
        }
    };
});;
