
angular.module('courses').controller('CourseViewController',
    function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, Segments, Sources, Sourcetypes, LearnedConcepts, SeenConcepts, $timeout, $interval, SeenDataManager, ActiveDataManager, $cacheFactory)
    {
        $scope.authentication = Authentication;
        $scope.learnMode = false;
        $scope.learnModeYesNo = 'no';
        $scope.editSourceMode = $location.url().indexOf('contents') !== -1;
        $scope.courseId = $stateParams.courseId;
        $scope.concepts = [];
        $scope.learned = [];
        $scope.segments = [];
        $scope.sources = [];
        $scope.understood = [];
        $scope.todo = [];
        $scope.todoIds = [];
        $scope.colors = [];
        $scope.goalConcept = null;
        $scope.directories = {
            concepts: []
        };
        $scope.activeConcept = null;
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
        var dataReady = false;

        $scope.course = Courses.get({
            courseId: $stateParams.courseId
        });

        ConceptStructure.init($scope, $stateParams.courseId);
        SeenDataManager.init($scope, function() { $scope.$broadcast('dataUpdated'); });
        ActiveDataManager.init($scope);

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

                    $scope.learned = LearnedConcepts.query();

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

                        $scope.seen = SeenConcepts.query(function()
                        {
                            SeenDataManager.updateSeenMap();

                            $scope.$broadcast('dataReady');
                            dataReady = true;
                        });
                    });
                });
            });

            ConceptStructure.getConceptChildren($scope.active.topLevelConcepts, null, null, 1, function() {});
            //console.log($scope.topLevelConcepts);

        });

        /*var updateTodoTimeout = null;
        $scope.$watchCollection('active.hoveringConceptIds', function()
        {
            var updateFct = function()
            {
                ActiveDataManager.updateTodo();
                ActiveDataManager.updatePlan();
            };

            if($scope.active.hoveringConceptIds.length === 0)
            {
                // Use timeout in case mouse is only switching from one concept to the other
                // to avoid doing this twice within 1ms.
                $timeout.cancel(updateTodoTimeout);
                updateTodoTimeout = $timeout(updateFct, 1);
            }
            else
            {
                $timeout.cancel(updateTodoTimeout);
            }
        });*/

        $scope.getPathColor = function(orig)
        {
            var colorHsl = d3.hsl(orig);
            var saturation = (colorHsl.s + 1) / 2;
            var lightness = (colorHsl.l ) / (3 - colorHsl.s);
            //color = d3.rgb(color).brighter().toString();
            return d3.hsl(colorHsl.h, saturation, lightness).toString();
        };

        /*$scope.$watch('todo', function()
        {

            ActiveDataManager.updateTodoIds();
            ActiveDataManager.updateCurrentGoal();
        });*/

        /*$scope.$watch('active.topLevelConcepts', function()
        {
            ActiveDataManager.updateTodo();
        });*/


        /*$scope.$watchCollection('active.goalHierarchy', function()
        {
            $scope.active.goalHierarchyIds = $scope.active.goalHierarchy.map(function(concept)
            {
                return concept.concept._id;
            });
        });*/

        /*$scope.$watch('activeConcept', function()
        {
            ActiveDataManager.setActiveSegments();
            $scope.active.hoveringConceptIds = [];

            ActiveDataManager.updateTodo();
            ActiveDataManager.updateCurrentGoal();
        });*/

        //$scope.$watchCollection('segments', ActiveDataManager.setActiveSegments);

        /*$scope.$watch('goalConcept', function()
        {
            ActiveDataManager.setGoalHierarchy();
            ActiveDataManager.updateTodo();
        });*/

        $scope.addColor = function(color)
        {
            if($scope.colors.indexOf(color) === -1)
            {
                $scope.colors.push(color);
            }
        };

        var colorCache = $cacheFactory.get('depthColors') ? $cacheFactory.get('depthColors') : $cacheFactory('depthColors');

        $scope.depthColorModification = function (concept, grayout)
        {
            var cacheKeyGrayPart = grayout ? '1' + ($scope.todoIds.length > 0 && $scope.todoIds.indexOf(concept.concept._id)) : '';
            var cacheKey = concept.concept._id + '-' + cacheKeyGrayPart + '-' + concept.concept.color;
            var cacheVal = colorCache.get(cacheKey);

            if(cacheVal)
            {
                $scope.addColor(cacheVal);
                return cacheVal;
            }
            else
            {
                var orig = d3.rgb(concept.concept.color);
                for (var i = 1; i< concept.depth; i++) {
                    orig = orig.darker()
                }

                var result = grayout && $scope.todoIds.length > 0 && $scope.todoIds.indexOf(concept.concept._id) === -1 ?
                    d3.hsl(orig.hsl().h, 0, orig.hsl().l).toString() : orig.toString();
                $scope.addColor(result);

                colorCache.put(cacheKey, result);

                return result;
            }
            //return $scope.grayed ? d3.hsl(orig.hsl().h, 0, orig.hsl().l) : orig.toString();
        };


        /*$scope.$watch('active.segmentId', function()
        {
            ActiveDataManager.setSegment();
        });

        $scope.$watch('active.sourceId', function()
        {
            ActiveDataManager.setSource();
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

            ActiveDataManager.updateTodo();
        });*/

        $scope.setGoalId = function(id)
        {
            $location.search('goal', id);
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

        $scope.hoverConcept = function(concept)
        {
            if(!concept) return;

            if($scope.active.hoveringConceptIds.indexOf(concept.concept._id) === -1)
            {
                $scope.active.hoverConcept = concept;
                $scope.active.hoveringConceptIds = [concept.concept._id];

                ActiveDataManager.setActiveHierarchy();
                ActiveDataManager.updateCurrentGoal();
                ActiveDataManager.updateTodo();
                ActiveDataManager.updatePlan();
                $scope.$broadcast('redrawHover');
            }
        };

        $scope.leaveConcept = function(concept, skipUpdate)
        {
            if($scope.active.hoveringConceptIds.length > 0 && (!concept || $scope.active.hoveringConceptIds.indexOf(concept.concept._id) !== -1))
            {
                //console.log('emptying hovers', $scope.active.hoverConcept, $scope.active.hoveringConceptIds);
                $scope.active.hoverConcept = null;
                $scope.active.hoveringConceptIds = [];

                if(!skipUpdate)
                {
                    ActiveDataManager.setActiveHierarchy();
                    ActiveDataManager.updateCurrentGoal();
                    ActiveDataManager.updateTodo();
                    ActiveDataManager.updatePlan();

                    $scope.$broadcast('redrawHover');
                }
            }
        };

        /*$scope.$watch('active.hoveringConceptIds', function()
        {
            ActiveDataManager.setActiveHierarchy();
            ActiveDataManager.updateCurrentGoal();
        });
*/
        $scope.$watchCollection('concepts.downloadedUpdates', function()
        {
            if(dataReady)
            {
                $scope.active.topLevelConcepts = [];
                ConceptStructure.getConceptChildren($scope.active.topLevelConcepts, null, null, 1, function() {});

                ActiveDataManager.updateActive();

                if($scope.concepts.downloadedUpdates.length)
                {
                    $scope.$broadcast('conceptUpdated', $scope.concepts.downloadedUpdates[$scope.concepts.downloadedUpdates.length-1].content);
                }
                $scope.$broadcast('dataUpdated');
            }
        });

        // For some reason learned.downloadedUpdates does not work here.
        $scope.$watchCollection('learned', function()
        {
            // Can not just run updateLearnedConceptIds but need to also update the concept attributes so concept.isLearned is updated. updateData will do it all.
            $scope.$broadcast('dataUpdated');
        });

        $scope.isLearned = function(d)
        {
            if(d.children && d.children.length)
            {
                var isLearned = true;

                for(var i = 0; i < d.children.length; i++)
                {
                    if(!this.isLearned(d.children[i]))
                    {
                        isLearned = false;
                    }
                }

                return isLearned;
            }
            else
            {
                return $scope.active.learnedConceptIds.indexOf(d.concept._id) !== -1;
            }
        };

        $scope.$on('$locationChangeSuccess', function()
        {
            //CourseMapController.redraw();
            /*$timeout(updatePanelContentHeight, 50);
            $timeout(updatePanelContentHeight, 100);
            $timeout(updatePanelContentHeight, 250);
            $timeout(updatePanelContentHeight, 500);*/
        });

        /*$scope.$watch('activeLecture', function()
        {
            ActiveDataManager.setActiveLectureConcepts();
        });*/

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

        //todo move this out of here, and only have this in panel view.
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
