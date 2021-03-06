
angular.module('courses').controller('CourseViewController',
    function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, Segments, Sources, Sourcetypes, LearnedConcepts, SeenConcepts, $timeout, $interval, SeenDataManager, ActiveDataManager, $cacheFactory, Courseruns, Segmentgroup, Tag)
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
            hoverSegment: null,
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
            courseId: $scope.courseId
        });

        $scope.courseruns = Courseruns.query({course: $scope.courseId});

        ConceptStructure.init($scope, $stateParams.courseId);
        SeenDataManager.init($scope, function() { $scope.$broadcast('dataUpdated'); });
        ActiveDataManager.init($scope);

        $scope.tags = Tag.query(function()
        {
            $scope.tagMap = {};
            $scope.tags.forEach(function(tag)
            {
                $scope.tagMap[tag._id] = tag;
            });
        });

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
                    $scope.extSchoolType = sourcetypes.filter(function(type)
                    {
                        return type.title === 'Harvard Extension School';
                    })[0];

                    /*$scope.segments.forEach(function(segment)
                    {
                        segment.sourceObject = $scope.sourceMap[segment.source];
                        segment.sourcetypeObject = $scope.sourcetypeMap[segment.sourceObject.type];
                    });*/

                    $scope.learned = $scope.authentication.user ? LearnedConcepts.query({user: $scope.authentication.user._id}) : [];

                    Segmentgroup.query({courses:$stateParams.courseId}, function(groups)
                    {
                        $scope.segmentgroups = groups;

                        Segments.query({courses:$stateParams.courseId}).$promise.then(function(segments)
                        {
                            $scope.segments = segments;

                            $scope.$watchCollection('segments.downloadedUpdates', $scope.parseSegments);
                            $scope.$watchCollection('segmentgroups.downloadedUpdates', $scope.parseSegments);

                            if($scope.authentication.user)
                            {
                                $scope.seen = SeenConcepts.query({user: $scope.authentication.user._id}, function()
                                {
                                    SeenDataManager.updateSeenMap();

                                    $scope.$broadcast('dataReady');
                                    dataReady = true;
                                });
                            }
                            else
                            {
                                $scope.seen = [];
                                SeenDataManager.updateSeenMap();

                                $scope.$broadcast('dataReady');
                                dataReady = true;
                            }

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

        $scope.parseSegments = function()
        {
            $scope.segmentMap = {};
            $scope.segmentPerConceptMap = {};
            $scope.segmentgroupMap = {};
            $scope.segmentgroupPerConceptMap = {};
            $scope.segmentPerGroupMap = {};
            var conceptId;

            $scope.segmentgroups.forEach(function(group)
            {
                $scope.segmentgroupMap[group._id] = group;
                if(!$scope.segmentgroupPerConceptMap[group.concept])
                    $scope.segmentgroupPerConceptMap[group.concept] = [];

                $scope.segmentgroupPerConceptMap[group.concept].push(group);
                $scope.segmentPerGroupMap[group._id] = [];
            });

            $scope.segments.forEach(function (segment)
            {
                $scope.segmentMap[segment._id] = segment;

                segment.concepts.forEach(function(conceptId)
                {
                    // If that concept is relevant here (in course)
                    if($scope.conceptMap[conceptId])
                    {
                        if(!$scope.segmentPerConceptMap[conceptId])
                            $scope.segmentPerConceptMap[conceptId] = [];

                        $scope.segmentPerConceptMap[conceptId].push(segment)
                    }
                });
            });

            // Now, sort segments top to bottom, no matter if they are in a group or not.
            for(conceptId in $scope.segmentPerConceptMap)
            {
                if($scope.segmentPerConceptMap.hasOwnProperty(conceptId))
                {
                    $scope.segmentPerConceptMap[conceptId].sort(function(seg1, seg2)
                    {
                        var o1 = seg1.order && seg1.order[conceptId] ? seg1.order[conceptId] : 0;
                        var o2 = seg2.order && seg2.order[conceptId] ? seg2.order[conceptId] : 0;
                        return o1 - o2;
                    });
                }
            }

            // Now, combine segments and segment groups
            $scope.segmentAndGroupPerConceptMap = {};
            for(conceptId in $scope.segmentPerConceptMap)
            {
                if($scope.segmentPerConceptMap.hasOwnProperty(conceptId))
                {
                    var segs = $scope.segmentPerConceptMap[conceptId];
                    if(!$scope.segmentAndGroupPerConceptMap[conceptId])
                        $scope.segmentAndGroupPerConceptMap[conceptId] = [];

                    segs.forEach(function(seg)
                    {
                        var currGroupId = null;

                        if(seg.segmentgroups && seg.segmentgroups.length)
                        {
                            seg.segmentgroups.forEach(function(groupId)
                            {
                                if($scope.segmentgroupMap[groupId] && $scope.segmentgroupMap[groupId].concept == conceptId)
                                {
                                    currGroupId = groupId;
                                    return;
                                }
                            });
                        }

                        if(currGroupId)
                        {
                            // Add to the segment group

                            $scope.segmentPerGroupMap[currGroupId].push(seg);
                        }
                        else
                        {
                            // Add to top level segment list
                            $scope.segmentAndGroupPerConceptMap[conceptId].push(seg);
                        }
                    });
                }
            }

            for(conceptId in $scope.segmentgroupPerConceptMap)
            {
                if($scope.segmentgroupPerConceptMap.hasOwnProperty(conceptId))
                {
                    if(!$scope.segmentAndGroupPerConceptMap[conceptId])
                    {
                        $scope.segmentAndGroupPerConceptMap[conceptId] = [];
                    }

                    var groups = $scope.segmentgroupPerConceptMap[conceptId];

                    groups.forEach(function(group)
                    {
                        group.isGroup = true;
                        group.isSegment = false;

                        $scope.segmentAndGroupPerConceptMap[conceptId].push(group);
                    });
                }
            }

            // Now, sort combined segments and segment groups list
            for(conceptId in $scope.segmentAndGroupPerConceptMap)
            {
                if($scope.segmentAndGroupPerConceptMap.hasOwnProperty(conceptId))
                {
                    $scope.segmentAndGroupPerConceptMap[conceptId].sort(function(seg1, seg2)
                    {
                        var o1 = seg1.order && seg1.order[conceptId] ? seg1.order[conceptId] : 0;
                        if(seg1.isGroup) o1 = seg1.order;
                        var o2 = seg2.order && seg2.order[conceptId] ? seg2.order[conceptId] : 0;
                        if(seg2.isGroup) o2 = seg2.order;

                        return o1 - o2;
                    });
                }
            }

            // Now, sort segments in the order they appear in in the menu, depending on groups.
            for(conceptId in $scope.segmentPerConceptMap)
            {
                if($scope.segmentPerConceptMap.hasOwnProperty(conceptId))
                {
                    $scope.segmentPerConceptMap[conceptId] = [];

                    $scope.segmentAndGroupPerConceptMap[conceptId].forEach(function(data)
                    {
                        if(data.isGroup)
                        {
                            // Add all Group Segments
                            $scope.segmentPerConceptMap[conceptId].push.apply($scope.segmentPerConceptMap[conceptId], $scope.segmentPerGroupMap[data._id]);
                        }
                        else
                        {
                            $scope.segmentPerConceptMap[conceptId].push(data);
                        }
                    });
                }
            }
        };

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
            var cacheSearchPart = $scope.search.active ? 'search-' + $scope.search.text : 'nosearch';
            var cacheKey = concept.concept._id + '-' + cacheKeyGrayPart + cacheSearchPart + '-' + concept.concept.color;
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

                var result = grayout
                    && ((!$scope.search.active && $scope.todoIds.length > 0 && $scope.todoIds.indexOf(concept.concept._id) === -1)
                     || ($scope.search.active && concept.notOnPlan)) ?
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
                //console.log($scope.active.topLevelConcepts);

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
            var contentCols = document.getElementsByClassName('content');
            var width = 0, height = 0;
            for(var i = 0; i < contentCols.length; i++)
            {
                var bounds = contentCols[i].getBoundingClientRect();
                if(bounds.width > width) width = bounds.width;
                if(bounds.height > height) height = bounds.height;
            }
            //$scope.contentWidth = width;
            $scope.contentWidth = $scope.windowWidth - $scope.panelWidth;
            $scope.contentHeight = height;

            updatePanelContentHeight();
        };

        w.bind('resize', $scope.updateSize);
        $scope.updateSize();
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
