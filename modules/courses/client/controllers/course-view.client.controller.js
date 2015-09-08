
angular.module('courses').controller('CourseViewController',
    function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, Segments, Sources, Sourcetypes, LearnedConcepts, SeenConcepts, $timeout)
    {
        $scope.learnMode = false;
        $scope.learnModeYesNo = 'no';
        $scope.editSourceMode = $location.url().indexOf('contents') !== -1;
        $scope.courseId = $stateParams.courseId;
        $scope.concepts = [];
        //$scope.remoteConcepts = [];
        //$scope.dependencies = [];
        $scope.learned = [];
        $scope.segments = [];
        $scope.sources = [];
        $scope.understood = [];
        $scope.todo = [];
        $scope.todoIds = [];
        $scope.colors = [];
        //$scope.directories.concepts = {};
        $scope.goalConcept = null;
        $scope.directories = {
            concepts: []
        };
        $scope.active = {
            hierarchy: [],
            hierarchyIds: [],
            goalHierarchy: [],
            goalHierarchyIds: [],
            concept: null,
            topLevelConcepts: [],
            segment: null,
            segments: [],
            segmentId: '',
            hoverConcept: null,
            hoveringConceptIds: [],
            hoverHierarchyIds: [],
            learnedConceptIds: [],
            watchableConcept: null,
            sourceId: '',
            source: null
        };

        $scope.course = Courses.get({
            courseId: $stateParams.courseId
        });

        ConceptStructure.init($scope, $stateParams.courseId);
        ConceptStructure.getConceptsAndDeps(function(deps)
        {
            $scope.dependencies = deps;


            Sources.query().$promise.then(function(sources) {
                $scope.sources = sources;
                $scope.sourceMap = {};
                sources.forEach(function (source) {
                    $scope.sourceMap[source._id] = source;
                });

                Sourcetypes.query().$promise.then(function(sourcetypes)
                {
                    $scope.sourcetypes = sourcetypes;
                    $scope.sourcetypeMap = {};
                    sourcetypes.forEach(function(sourcetype)
                    {
                        $scope.sourcetypeMap[sourcetype._id] = sourcetype;
                    });

                    $scope.lectureduoType = sourcetypes.filter(function(type)
                    {
                        return type.title === 'Lecture';
                    })[0];

                    $scope.segments.forEach(function(segment)
                    {
                        segment.sourceObject = $scope.sourceMap[segment.source];
                        segment.sourcetypeObject = $scope.sourcetypeMap[segment.sourceObject.type];
                    });

                    LearnedConcepts.query(function(learned)
                    {
                        $scope.learned = learned;
                    });

                    Segments.query({courses:$stateParams.courseId}).$promise.then(function(segments) {
                        $scope.segments = segments;
                        $scope.segmentMap = {};
                        $scope.segmentPerConceptMap = {};

                        segments.forEach(function (segment)
                        {
                            $scope.segmentMap[segment._id] = segment;

                            segment.concepts.forEach(function(conceptId)
                            {
                                // If that concept is relevant here (in course)
                                if($scope.conceptMap[conceptId])
                                {
                                    $scope.segmentPerConceptMap[conceptId]
                                        ? $scope.segmentPerConceptMap[conceptId].push(segment)
                                        : $scope.segmentPerConceptMap[conceptId] = [segment];
                                }
                            });
                        });
                    });

                    SeenConcepts.query(function(seen)
                    {
                        $scope.seen = seen;

                    });

                    updateActive();
                });
            });

            //ConceptStructure.getConceptChildren($scope.topLevelConcepts, null, null, 1, function() {});
            //console.log($scope.topLevelConcepts);
        });

        $scope.$watchCollection('seen', makeSeenMap);

        function makeSeenMap()
        {
            $scope.seenMap = {};
            $scope.seenMapByConcept = {};

            if($scope.seen)
            {
                $scope.seen.forEach(function(seenConcept)
                {
                    $scope.seenMap[seenConcept._id] = seenConcept;
                    $scope.seenMapByConcept[seenConcept.concept] = seenConcept;
                });
                //console.log($scope.seenMap);
            }
        }

        var updateTodoTimeout = null;
        $scope.$watchCollection('active.hoveringConceptIds', function()
        {
            if($scope.active.hoveringConceptIds.length === 0)
            {
                // Use timeout in case mouse is only switching from one concept to the other
                // to avoid doing this twice within 1ms.
                $timeout.cancel(updateTodoTimeout);
                updateTodoTimeout = $timeout($scope.updateTodo, 1);
            }
            else
            {
                $timeout.cancel(updateTodoTimeout);
                $scope.updateTodo();
            }
        });

        $scope.updateTodo = function()
        {
            var concept = $scope.activeConcept;

            if($scope.goalConcept !== null)
            {
                $scope.todo = ConceptStructure.getTodoListSorted($scope.goalConcept);
            }
            else
            {
                var hover = $scope.active.hoveringConceptIds;

                if(hover !== undefined && hover.length > 0)
                {
                    $scope.todo = ConceptStructure.getTodoListSorted($scope.directories.concepts[hover[0]]);
                }
                else
                {
                    $scope.todo = concept ? ConceptStructure.getTodoListSorted(concept) : ConceptStructure.getTodoListSorted();
                }
            }
            if(!$scope.todo.length) $timeout($scope.updateTodo, 20);
            //console.log($scope.goalConcept, $scope.active.hoveringConceptIds, concept, $scope.todo);
        };

        function updateCurrentGoal()
        {
            var goalConcept = null;

            if($scope.goalConcept)
            {
                goalConcept = $scope.goalConcept;
            }
            else if($scope.active.hoveringConceptIds.length !== 0)
            {
                goalConcept = $scope.directories.concepts[$scope.active.hoveringConceptIds[0]];
            }
            else if($scope.activeConcept)
            {
                goalConcept = $scope.activeConcept;
            }
            $scope.currentGoal = goalConcept;
        }

        $scope.getPathColor = function(orig)
        {
            var colorHsl = d3.hsl(orig);
            var saturation = (colorHsl.s + 1) / 2;
            var lightness = (colorHsl.l ) / (3 - colorHsl.s);
            //color = d3.rgb(color).brighter().toString();
            return d3.hsl(colorHsl.h, saturation, lightness).toString();
        };

        $scope.$watch('todo', function()
        {
            //console.log('updating todo ids');
            $scope.todoIds = $scope.todo.map(function(t) { return t.concept._id; });
            updateCurrentGoal();
        });

        $scope.$watch('active.topLevelConcepts', function()
        {
            $scope.updateTodo();
        });


        $scope.$watchCollection('active.goalHierarchy', function()
        {
            $scope.active.goalHierarchyIds = $scope.active.goalHierarchy.map(function(concept)
            {
                return concept.concept._id;
            });
        });

        $scope.$watchCollection('active.hierarchy', function(actives)
        {
            $scope.active.hierarchyIds = $scope.active.hierarchy.map(function(concept)
            {
                return concept.concept._id;
            });

            if(actives.length > 0)
            {
                $scope.activeConcept = actives[actives.length-1];
            }
            else
            {
                $scope.activeConcept = null;
            }
            /*if($scope.goalConcept === null)
            {
                $scope.goalConcept = $scope.activeConcept;
            }*/
            //$scope.activeConcept = h.length > 0 ? h[h.length-1] : null;
        }, true);

        $scope.$watch('activeConcept', function()
        {
            setActiveSegments();

            $scope.updateTodo();
            updateCurrentGoal();
        });

        $scope.$watchCollection('segments', setActiveSegments);

        function setActiveSegments()
        {
            if($scope.activeConcept)
            {
                $location.search('active', $scope.activeConcept.concept._id);

                var hierarchy = [];
                var concept = $scope.activeConcept;
                while(concept !== null && concept !== undefined)
                {
                    hierarchy.push(concept);
                    concept = concept.parentData;
                }

                $scope.active.hierarchy = hierarchy.reverse();

                $scope.active.segments = $scope.segments.filter(function(segment)
                {
                    return segment.concepts.indexOf($scope.activeConcept.concept._id) !== -1;
                });
                //console.log($scope.active.segments);

                setSegment();
            }
            else
            {
                $scope.active.hierarchy = [];
                //$location.search('active', '');
            }
        }

        $scope.$watch('goalConcept', function()
        {
            if($scope.goalConcept !== null)
            {
                var hierarchy = [];
                var concept = $scope.goalConcept;
                while(concept !== null && concept !== undefined)
                {
                    hierarchy.push(concept);
                    concept = concept.parentData;
                }

                $scope.active.goalHierarchy = hierarchy.reverse();
            }
            else
            {
                $scope.active.goalHierarchy = [];
            }

            $scope.updateTodo();
        });

        $scope.addColor = function(color)
        {
            if($scope.colors.indexOf(color) === -1)
            {
                $scope.colors.push(color);
            }
        };

        $scope.depthColorModification = function (concept, grayout)
        {
            var orig = d3.rgb(concept.concept.color);
            for (var i = 1; i< concept.depth; i++) {
                orig = orig.darker()
            }

            var result = grayout && $scope.todoIds.length > 0 && $scope.todoIds.indexOf(concept.concept._id) === -1 ?
                         d3.hsl(orig.hsl().h, 0, orig.hsl().l).toString() : orig.toString();
            $scope.addColor(result);

            //console.log($scope.todoIds);
            return result;
            //return $scope.grayed ? d3.hsl(orig.hsl().h, 0, orig.hsl().l) : orig.toString();
        };

        $scope.$watch('active.segmentId', function()
        {
            var newSegments = $scope.active.segments.filter(function(segment)
            {
                return segment._id === $scope.active.segmentId;
            });

            if(newSegments.length === 1)
            {
                setSegment();
            }
            else
            {
                if($scope.active.segments.length > 0)
                {
                    var e = new Error('Specified Segment that is not active!');

                    console.log(e.stack);
                    console.log($scope.active.segments);
                }
            }
        });

        function setSegment()
        {
            // Default is to take the lecture duo segment.
            //console.log($scope.active.segments.length);

            if($scope.active.segments.length > 0)
            {
                if($scope.active.segmentId !== '')
                {
                    var segment = $scope.segmentMap[$scope.active.segmentId];
                    var conceptId = $scope.activeConcept.concept._id;
                }
                if($scope.active.segmentId !== '' && segment.concepts.indexOf(conceptId) !== -1)
                {
                    $scope.active.segment = $scope.segmentMap[$scope.active.segmentId];
                }
                else
                {
                    //console.log('loading not what was specified, but the default segment..');
                    var lectures = $scope.active.segments.filter(function(segment)
                    {
                        var source = $scope.sourceMap[segment.source];
                        return source.type === $scope.lectureduoType._id;
                    });
                    $scope.active.segment = lectures.length > 0 ? lectures[0] : $scope.active.segments[0]; //todo
                }

                //$scope.active.source = $scope.sourceMap[$scope.active.segment.source];
                //$scope.active.sourcetype = $scope.sourcetypeMap[$scope.active.source.type];
            }
        }

        function setSource()
        {
            if($scope.active.sourceId.length > 0)
            {
                var newSrc = $scope.sourceMap[$scope.active.sourceId];

                if($scope.active.source === null || newSrc._id !== $scope.active.source._id)
                {
                    //console.log('setting new source!', newSrc._id);
                    $scope.active.source = newSrc
                }
            }
        }

        $scope.$watch('active.segmentId', function()
        {
            setSegment();
        });

        $scope.$watch('active.sourceId', function()
        {
            setSource();
        });

        $scope.$watch('active.segment', function()
        {
            if($scope.active.segment !== null)
            {
                $scope.active.sourceId = $scope.active.segment.source;
            }
        });

        $scope.$watch('active.source', function()
        {
            if($scope.active.source !== null)
            {
                $scope.active.sourcetype = $scope.sourcetypeMap[$scope.active.source.type];
            }
            else
            {
                $scope.active.sourcetype = null;
            }
        });

        $scope.$watch('goalConcept', function()
        {
            if($scope.goalConcept)
            {
                $location.search('goal', $scope.goalConcept.concept._id);
                //console.log('setting goal search to ', $scope.goalConcept.concept._id);
            }
            else
            {
                //$location.search('goal', '');
                //console.log('resetting goal search');
            }

            $scope.updateTodo();
        });

        $scope.setGoalId = function(id)
        {
            $location.search('goal', id);
        };

        $scope.understood = function(concept)
        {
            var userId = Authentication.user._id;
            var learned = new LearnedConcepts();
            learned.course = $scope.courseId;
            learned.concept = concept.concept._id;
            learned.user = userId;

            learned.$save(function(learnedconcept)
            {
                $scope.learned.push(learnedconcept);
            });
        };

        $scope.notUnderstood = function(concept)
        {
            var conceptId = concept.concept._id;

            $scope.learned.filter(function(l)
            {
                return l.concept === conceptId;
            }).forEach(function(learned, i)
            {
                learned.$remove(function()
                {
                    $scope.learned.splice($scope.learned.indexOf(learned), 1);
                });

            });
        };

        $scope.addDependency = function(providerId, dependantId, callback)
        {
            var cd = new Conceptdependencies({
                dependant: dependantId,
                provider: providerId,
                course: $scope.courseId
            });

            cd.$save(function () {
                console.log(cd,  " saved.");
                $scope.dependencies.push(cd);
                callback();
            });
        };

        $scope.$watchCollection('learned', function()
        {
            $scope.active.learnedConceptIds = $scope.learned.map(function(l) { return l.concept; });
            //console.log($scope.learnedConceptIds);
        });

        $scope.hoverConcept = function(concept)
        {
            if($scope.active.hoveringConceptIds.indexOf(concept.concept._id) === -1)
            {
                $scope.active.hoverConcept = concept;
                $scope.active.hoveringConceptIds = [concept.concept._id];
                //console.log('hover', concept.concept._id);
            }
        };

        $scope.leaveConcept = function(concept)
        {
            if($scope.active.hoveringConceptIds.length > 0 && (!concept || $scope.active.hoveringConceptIds.indexOf(concept.concept._id) !== -1))
            {
                //console.log('emptying hovers', $scope.active.hoverConcept, $scope.active.hoveringConceptIds);
                $scope.active.hoverConcept = null;
                $scope.active.hoveringConceptIds = [];
            }
        };

        $scope.$watch('active.hoveringConceptIds', function()
        {
            var hoverHierarchyIds = [];
            for(var i = 0; i < $scope.active.hoveringConceptIds.length; i++)
            {
                var id = $scope.active.hoveringConceptIds[i];
                var concept = $scope.directories.concepts[id];
                var addition = concept.parentChain ? concept.parentChain.map(function(c) { return c.concept._id; }) : [];
                hoverHierarchyIds = hoverHierarchyIds.concat(addition, [concept.concept._id]);
            }
            $scope.active.hoverHierarchyIds = hoverHierarchyIds;
            updateCurrentGoal();
        });

        $scope.$watchCollection('concepts.downloadedUpdates', function()
        {
            //TODO have to do this because have to wait for the childconcepts to be set by getConceptChildren.
            // Should automatically do this after that instead of some timer.
            $timeout(updateActive, 5);
        });

        function updateActive()
        {
            var searchParams = $location.search();

            //console.log(searchParams);
            //console.log($scope.directories.concepts);

            if(searchParams.active && $scope.directories.concepts[searchParams.active])
            {
                $scope.activeConcept = $scope.directories.concepts[searchParams.active];
            }
            else if($stateParams.conceptId && $scope.directories.concepts[$stateParams.conceptId])
            {
                $scope.activeConcept = $scope.directories.concepts[$stateParams.conceptId];
            }
            else
            {
                $scope.activeConcept = null;
            }
            if(searchParams.goal)
            {
                $scope.goalConcept = $scope.directories.concepts[searchParams.goal];
            }
            else
            {
                $scope.goalConcept = null;
            }

            if(searchParams.source && searchParams.source.length > 0)
            {
                $scope.active.sourceId = searchParams.source;
            }
            else
            {
                $scope.active.sourceId = '';
            }

            if(searchParams.learn && searchParams.learn === 'yes')
            {
                $scope.learnMode = true;
            }
            else
            {
                $scope.learnMode = false;
            }
            $scope.learnModeYesNo = $scope.learnMode ? 'yes' : 'no';

            if(searchParams.segment)
            {
                $scope.active.segmentId = searchParams.segment;
            }

            $scope.activeMode = searchParams.mode;
            updateCurrentGoal();
        }

        $scope.$on('$locationChangeSuccess', function() { updateActive(); $timeout(updatePanelContentHeight, 20); });

        //TODO set the TLC here instead of in the map. It's a more general thing.
        /*$scope.$watchCollection('concepts.downloadedUpdates',function()
        {
            var tlc = [];

            ConceptStructure.getConceptChildren(tlc, null, null, 1, $scope.configCircle);

            $scope.active.topLevelConcepts = tlc;
        });*/

        var w = angular.element($window);
        $scope.windowHeight = $window.innerHeight;
        $scope.windowWidth = $window.innerWidth;
        $scope.contentWidth = $window.innerWidth / 4 * 3;
        $scope.panelWidth =  $window.innerWidth / 4;

        $scope.updateSize = function ()
        {
            $scope.safeApply();

            $scope.windowHeight = $window.innerHeight;
            $scope.windowWidth = $window.innerWidth;
            //$scope.contentWidth =
            var contentCols = document.getElementsByClassName('contentCol');
            var width = 0, height = 0;
            for(var i = 0; i < contentCols.length; i++)
            {
                var bounds = contentCols[i].getBoundingClientRect();
                if(bounds.width > width) width = bounds.width;
                if(bounds.height > height) height = bounds.height;
            }
            $scope.contentWidth = width;
            $scope.contentHeight = height;

            updatePanelContentHeight();
        };

        w.bind('resize', $scope.updateSize);
        $scope.$watch('panelWidth', function()
        {
            $scope.contentWidth = $scope.windowWidth - $scope.panelWidth;
        });

        updatePanelContentHeight();
        $timeout(updatePanelContentHeight, 2000);

        function updatePanelContentHeight()
        {
            d3.selectAll('.panel-content-active').forEach(function(el)
            {
                if(el[0] !== undefined)
                {
                    $scope.panelOffsetTop = el[0].getBoundingClientRect().top;

                }
                else
                {
                    //console.log('not yet');
                    $timeout(updatePanelContentHeight, 20);
                }

            });
        }
    }
);
