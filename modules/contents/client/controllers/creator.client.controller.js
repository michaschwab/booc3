'use strict';

angular.module('contents').controller('CreatorController',
    function($scope, $stateParams, $state, Courses, Sourcetypes, Sources, Segments, $timeout, $location, Courseruns, LectureCreator, WikiCreator, LTICreator, Concepts, $filter, YoutubeCreator, WebsiteCreator, PdfCreator, ExtensionSchoolCreator, Authentication, RandomString, Tag)
    {
        $scope.courseId = $stateParams.courseId;
        $scope.activeCourseIds = [$scope.courseId];
        $scope.stateParams = $stateParams;

        var hasAccess = Authentication.isOneCourseAdmin();
        if(!hasAccess)
        {
            console.error('no access: not content editor of any course');
            return $state.go('home');
        }

        $scope.possibleActions = {
            'add_edit': 'Add Material from Existing Source',
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
        var segmentSameTitleAsSource = false;

        /**
         * This function is responsible for showing the course runs of the material's course(s).
         */
        var updateCourseRuns = function()
        {
            if(!$scope.activeCourseIds || !$scope.activeCourseIds.length) return;

            Courseruns.query(function(runs)
            {
                $scope.courseruns = runs.filter(function(run)
                {
                    return $scope.activeCourseIds.indexOf(run.course) !== -1;
                });
                $scope.courseruns.map(function(run)
                {
                    run.startText = moment(run.start).format('YYYY-MM-DD');
                });
                $scope.courserunIds = $scope.courseruns.map(function(run)
                {
                    return run._id;
                });
            });
        };

        $scope.$watch('activeCourseIds', updateCourseRuns);

        /**
         * This function filters the tags according to a search for tag names.
         * @param $query Name of the desired tag in String format.
         * @returns List of filtered tags.
         */
        $scope.filterTags = function($query) {
            var tags = $scope.tags;
            return tags.filter(function(tag) {
                return tag.title.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

        /**
         * Loads the data.
         */
        $scope.init = function()
        {
            Courses.query(function(courses)
            {
                if (courses.length>0)
                {
                    $scope.courses = courses;
                    $scope.courseIds = courses.map(function(c) { return c._id; });
                    $scope.courseMap = {};
                    courses.forEach(function(course)
                    {
                        $scope.courseMap[course._id] = course;
                    });

                    if($scope.courseId)
                    {
                        $scope.course = $scope.courses[$scope.courseIds.indexOf($scope.courseId)];

                        var courseSelectScope = angular.element('.course-select').scope();
                        var courseSearchScope = courseSelectScope ? courseSelectScope.$$childHead : null;

                        if(courseSearchScope)
                            courseSearchScope.$select.selected = $scope.course;
                    }
                }
            });

            $scope.tags = Tag.query(function()
            {
                $scope.tagMap = {};
                $scope.tags.forEach(function(tag)
                {
                    $scope.tagMap[tag._id] = tag;
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

                                    if($scope.source.tags && $scope.source.tags.length)
                                    {
                                        $scope.source.tagObjects = $scope.source.tags.map(function(tagId)
                                        {
                                            return $scope.tagMap[tagId];
                                        });
                                    }

                                    Segments.query({source: $scope.sourceId}, function(segments)
                                    {
                                        $scope.segments = segments.filter(function(s) { return s.source == $scope.sourceId });

                                        if($scope.segments.length == 1 && $scope.segments[0].title == $scope.source.title)
                                        {
                                            segmentSameTitleAsSource = true;
                                        }

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

                                    if(activeCourseIds && activeCourseIds.length && !$scope.courseId)
                                    {
                                        $scope.courseId = activeCourseIds[0];
                                        $scope.activeCourseIds = activeCourseIds;
                                    }
                                    if($scope.courseId)
                                    {
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
            });


        };

        /**
         * Adds a Concept to a Segment.
         * @param concept The concept to be added.
         * @param scope The scope of the Concept selection element so it can be reset.
         */
        $scope.addConcept = function(concept, scope)
        {
            if(!$scope.activeSegment.conceptObjects) $scope.activeSegment.conceptObjects = [];
            $scope.activeSegment.conceptObjects.push(concept);
            scope.$select.selected = null;
        };

        /**
         * Removes a Concept from a Segment.
         * @param concept The Concept to be removed.
         */
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

        $scope.selectEditSource = function(editSource)
        {
            $scope.editSource = editSource;
            $scope.activeAction='add_edit';
        };

        /**
         * If a source has been selected, redirect to the edit page of that source.
         */
        var redirectToSource = function()
        {
            var source = $scope.editSource;

            if(source && source != $scope.source)
            {
                $scope.source = source;
                //console.log($scope.editSource);
                //$scope.activeType = $scope.sourcetypes.filter(function(t) { return t._id == source.type; })[0];
                var conceptId = $scope.conceptId ? $scope.conceptId : $stateParams.conceptId;
                var courseId = $scope.courseId ? $scope.courseId : source.course;

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
        };

        var updateConcepts = function()
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
        };

        var updateConceptObjects = function()
        {
            if($scope.activeSegment && $scope.addToConcept)
            {
                if($scope.activeSegment.conceptObjects.map(function(c) { return c._id; }).indexOf($scope.addToConcept.concept._id) === -1)
                    $scope.activeSegment.conceptObjects.push($scope.addToConcept.concept);
            }
        };

        $scope.$watch('editSource', redirectToSource);
        $scope.$watchCollection('[allConcepts, course]', updateConcepts);
        $scope.$watch('activeSegment', updateConceptObjects);

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

                var params = {
                    courseId: courseId,
                    mode: 'admin'
                };

                if($scope.addToConcept && $scope.addToConcept.parentData)
                    params.active = $scope.addToConcept.parentData.concept._id;

                $state.go('courses.view', params);
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

            if($scope.source.tagObjects && $scope.source.tagObjects.length)
            {
                $scope.source.tags = $scope.source.tagObjects.map(function(tag)
                {
                    return tag._id;
                });
            }
            else
            {
                $scope.source.tags = [];
            }

            if($scope.source.courses && $scope.source.courses.length)
            {
                if($scope.source.courses.indexOf($scope.course._id) === -1)
                {
                    $scope.source.courses.push($scope.course._id);
                }
            }
            else
            {
                $scope.source.courses = [$scope.course._id];
            }


            if(sourceHelper.beforeSave)
                sourceHelper.beforeSave();

            //todo be more flexible and allow multiple courses
            var source = $scope.source;

            if(!source.courserun)
                delete source.courserun;

            if($scope.source._id)
            {
                console.log('saving edited source..');

                Sources.update({_id:$scope.source._id}, $scope.source, saveSegments,
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
                src.$save(saveSegments, function(errorResponse) { console.error(errorResponse.data); });
            }
        };

        /**
         * After successful saving of the source, the remaining data - mainly the Segments - are saved in this function.
         * @param source
         */
        var saveSegments = function(source)
        {
            console.log("saved:", source);
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
                    segment.source = source._id;

                    if(!segment.order)
                    {
                        segment.order = {};
                    }

                    //todo be more flexible and allow multiple courses
                    segment.courses = [$scope.course._id];

                    var cb2 = function()
                    {
                        redirectBack();
                    };

                    if(segment.created)
                    {
                        console.log('updating segment');

                        if(segmentSameTitleAsSource)
                        {
                            // make sure it's still the same.
                            segment.title = $scope.source.title;
                        }

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
                        delete segment.justCreated;
                        delete segment._id;

                        console.log('creating new segment');

                        if(!segment.title && $scope.segments.length == 1)
                        {
                            segment.title = $scope.source.title;
                        }

                        var seg = new Segments(segment);
                        seg.$save(cb2);
                    }
                });
            }
            else
            {
                redirectBack();
            }
        };

        /**
         * This function selects the correct source helper based on the active source type, and starts the service.
         * @param readable Readable Active Source Type Name.
         */
        var startSourceHelper = function(readable)
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
                //console.log(readable);
                sourceHelper.start($scope);
            }
        };

        $scope.$watch('activeReadableType', startSourceHelper);

        /**
         * Sets the active Segment's start time / page to the current position within the source.
         */
        $scope.setSegmentStart = function()
        {
            if($scope.activeSegment)
            {
                $scope.activeTimes.startDuration = moment.duration(sourceHelper.getCurrentPosition() * 1000);
            }
        };

        /**
         * Sets the active Segment's end time / page to the current position within the source.
         */
        $scope.setSegmentEnd = function()
        {
            if($scope.activeSegment)
            {
                $scope.activeTimes.endDuration = moment.duration(sourceHelper.getCurrentPosition() * 1000);
            }
        };

        /**
         * This function makes sure the active readable type is always up to date with the active source type.
         */
        var updateReadableType = function()
        {
            if($scope.activeType)
            {
                $scope.activeReadableType = $scope.getReadableType($scope.activeType);
            }
        };

        $scope.$watch('activeType', updateReadableType);

        /**
         * This function takes a source type and returns a readable version of its title.
         * @param sourcetype The source type of which the readable version is requested.
         * @returns {string} Readable version of the source type's title.
         */
        $scope.getReadableType = function(sourcetype)
        {
            return sourcetype.title.toLowerCase().replace(/[^a-z]/g,'');
        };

        /**
         * Sets the active source type to the source type specified, and cancels the passed event.
         * @param type The Source Type that should be set to the active one.
         * @param event The event do be cancelled.
         */
        $scope.selectSourcetype = function(type, event)
        {
            event.preventDefault();
            $scope.setSourcetype(type);
        };

        $scope.selectConcept = function(newConcept, conceptIndex, segment)
        {
            segment.conceptObjects[conceptIndex] = newConcept;
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
            var start = sourceHelper.getCurrentPosition();
            var end = sourceHelper.getEndPosition();

            var id = RandomString.get(12);
            var segment = new Object({_id: id, justCreated: true, title: 'New Segment', start: start, end: end});

            if($scope.segments.length !== 0 && $scope.segments[$scope.segments.length-1].end === segment.end)
            {
                $scope.segments[$scope.segments.length-1].end = segment.start;
            }

            $scope.segments.push(segment);

            $timeout(function()
            {
                $scope.selectSegment(segment);
            }, 100);
        };

        var confirmDeleteAllSegmentsTimeout = null;
        $scope.showSegmentRemoveAllConfirmation = false;
        $scope.removeAllSegmentsButtonClick = function()
        {
            if(!$scope.showSegmentRemoveAllConfirmation)
            {
                $scope.showSegmentRemoveAllConfirmation = true;
                confirmDeleteAllSegmentsTimeout = $timeout(function()
                {
                    $scope.showSegmentRemoveAllConfirmation = false;
                }, 2000);
            }
            else
            {
                $scope.showSegmentRemoveAllConfirmation = false;
                $timeout.cancel(confirmDeleteAllSegmentsTimeout);
                $scope.removeAllSegments();
            }
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

            var el = $('#segment-' + segment._id + ' .segment-title-panel');

            el.focus();
            if(segment.title == 'New Segment')
            {
                window.setTimeout (function(){
                    el.select();
                }, 100);
            }
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
});
