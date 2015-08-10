'use strict';

angular.module('concepts').controller('ConceptPanelController',
    function($scope, $rootScope, $stateParams, $location, Authentication, Concepts, Conceptdependencies, Courses, Sourcetypes, Segments, Sources, ConceptStructure, $timeout, LearnedConcepts, $window, PanelAdmin)
    {
        $scope.unfold = true;
        $scope.minimized = false;
        $scope.courseScope = $scope.$parent.$parent;
        $scope.planConcepts = [];
        PanelAdmin.init($scope);

        $scope.getPanelWidth = function()
        {
            if($scope.minimized)
            {
                return 36;
            }
            else
            {
                // go full screen for small devices
                return $scope.windowWidth < 800 ? $scope.windowWidth : $scope.windowWidth / 4;
            }
        };

        function getChildIds(concept)
        {
            if(concept.children.length > 0)
            {
                var list = [];
                concept.children.forEach(function(child)
                {
                    list = list.concat(getChildIds(child));
                });
                return list;
            }
            else
            {
                return [concept.concept._id];
            }
        }

        $scope.animatePanelWidth = function(goalWidth, onEnd)
        {
            /*var start = $scope.courseScope.panelWidth;
            var distance = start - goalWidth;
            $('#sidepanel').animate({ width: goalWidth }, {progress: function(promise, remaining)
            {
                $scope.courseScope.panelWidth = start - remaining * distance;
            }});*/

            d3.select('#sidepanel').transition()
                .style('width', goalWidth + 'px')
                .each('end', onEnd);
            //
        };

        $scope.minimize = function()
        {
            $scope.minimized = true;
            var newWidth = $scope.getPanelWidth();

            $scope.animatePanelWidth(newWidth, function()
            {
                $scope.courseScope.panelWidth = newWidth;
                $scope.safeApply();
            });
        };

        $scope.maximize = function()
        {
            $scope.minimized = false;
            var newWidth = $scope.getPanelWidth();

            $scope.courseScope.panelWidth = newWidth;
            $scope.safeApply();
            $scope.animatePanelWidth(newWidth);
        };

        function updateLectures()
        {
            if($scope.lectureduoType !== undefined)
            {
                var active = $scope.activeConcept;
                var childConceptIds = active === null ? [] : getChildIds(active); //todo
                //console.log(childConceptIds);

                $scope.activeConceptSegments = $scope.segments.filter(function(segment)
                {
                    if(segment.concepts !== undefined && segment.concepts.length > 0)
                    {
                        var concept = segment.concepts[0];
                        return active === null || childConceptIds.indexOf(concept) !== -1;
                    }
                    else
                    {
                        return false;
                    }
                });

                //console.log($scope.activeConceptSegments);

                $scope.activeConceptLectureSegments = $scope.activeConceptSegments.filter(function(segment)
                {
                    var source = $scope.sourceMap[segment.source];
                    return source.type === $scope.lectureduoType._id
                });

                $scope.activeLectures = [];
                var activeConceptLectureIds = [];

                $scope.activeConceptLectureSegments.forEach(function(segment)
                {
                    if(activeConceptLectureIds.indexOf(segment.source) === -1)
                    {
                        var lecture = $scope.sourceMap[segment.source];
                        var obj = { lecture: lecture, concepts: []};
                        var addedConceptIds = [];

                        $scope.segments.filter(function(seg)
                        {
                            return seg.source === lecture._id;
                        }).sort(function(a,b){return d3.ascending(a.start, b.start);}).forEach(function(lectureSeg)
                        {
                            var conceptId = lectureSeg.concepts[0];

                            if(addedConceptIds.indexOf(conceptId) === -1 && $scope.conceptMap[conceptId])
                            {
                                //obj.concepts.push($scope.directories.concepts[lectureSeg.concepts[0]]);
                                obj.concepts.push($scope.conceptMap[conceptId]);
                                addedConceptIds.push(conceptId);
                            }

                        });

                        $scope.activeLectures.push(obj);
                        activeConceptLectureIds.push(segment.source);
                    }
                });
            }
        }

        function updateNext()
        {
            var todo;

            if($scope.goalConcept === null)
            {
                todo = ConceptStructure.getTodoListSorted();
            }
            else
            {
                todo = ConceptStructure.getTodoListSorted($scope.goalConcept);
            }

            if(todo !== undefined)
            {
                var todoIds = todo.map(function(item) {
                    return item.concept._id;
                });

                var pos = -1;

                if($scope.activeConcept !== null)
                {
                    pos = todoIds.indexOf($scope.activeConcept.concept._id);
                }

                if(todo.length > pos + 1)
                {
                    $scope.nextConcept = todo[pos+1];
                }
                else
                {
                    $scope.nextConcept = null;
                    //console.log('no next concept found');
                }

                if(pos > 0)
                {
                    $scope.previousConcept = todo[pos-1];
                }
                else
                {
                    $scope.previousConcept = null;
                }
            }

            var segments = $scope.active.segments;
            var active = $scope.active.segment;

            if(active !== null)
            {
                var segmentIds = segments.map(function(s) { return s._id; });
                var index = segmentIds.indexOf(active._id);

                if(segments.length > 1)
                {
                    index = (index + 1) % segments.length;
                    $scope.nextSegment = segments[index];
                }
                else
                {
                    $scope.nextSegment = null;
                }
            }

        }

        $scope.$watch('activeConcept', function() { updateLectures(); updateNext(); });
        $scope.$watch('active.segment', updateNext);

        $scope.$watch('lectureduoType', updateLectures);

        $scope.updateDepProviders = function()
        {
            updateNext();

            if($scope.goalConcept === null)
            {
                if($scope.todoIds.length > 0)
                {
                    //console.log($scope.todoIds);
                    $scope.activeDependencyProviderIds = $scope.todoIds;
                }
                else
                {
                    $scope.activeDependencyProviderIds = undefined;
                }

            }
            else
            {
                $scope.activeDependencyProviders = ConceptStructure.getConceptDependencyConcepts($scope.goalConcept);
                $scope.activeDependencyProviderIds = [];

                $scope.activeDependencyProviders.forEach(function(provider)
                {
                    if($scope.activeDependencyProviderIds.indexOf(provider.concept._id) === -1)
                    {
                        var parent = provider;

                        while(parent !== undefined && parent !== null && $scope.activeDependencyProviderIds.indexOf(parent.concept._id) === -1)
                        {
                            //console.log(new Date().getTime(), parent);
                            $scope.activeDependencyProviderIds.push(parent.concept._id);
                            parent = provider.parentData;
                        }
                        //console.log($scope.activeDependencyProviderIds);
                    }
                });

                $scope.activeDependencyProviders.push($scope.goalConcept);


            }

            updatePlan();
        };

        $scope.$watch('goalConcept', function()
        {
            $scope.updateDepProviders();
        });

        $scope.$watch('todoIds', function()
        {
            $scope.updateDepProviders();
        });

        var updatePlan = function()
        {
            if(!$scope.activeDependencyProviderIds) return;
            //todo: set all the active, learned etc attributes here instead of in the panel html.

            var checkDependencyProvider = function(d)
            {
                return $scope.activeDependencyProviderIds.indexOf(d.concept._id) !== -1;
            };

            var isLearned = function(d)
            {
                return $scope.active.learnedConceptIds.indexOf(d.concept._id) !== -1;
            };
            var isActive = function(d)
            {
                return $scope.active.hierarchyIds.indexOf(d.concept._id) !== -1;
            };
            var isGoal = function(d)
            {
                return $scope.goalConcept && $scope.goalConcept.concept._id === d.concept._id;
            };
            var isInGoalHierarchy = function(d)
            {
                return $scope.active.goalHierarchyIds.indexOf(d.concept._id) === -1;
            };
            var isInHoverHierarchy = function(d)
            {
                return $scope.active.hoverHierarchyIds.indexOf(d.concept._id) === -1;
            };
            var isHover = function(d)
            {
                return $scope.active.hoveringConceptIds.indexOf(d.concept._id) !== -1;
            };

            var setAttributes = function(d)
            {
                d.learned = isLearned(d);
                d.active = isActive(d);
                d.goal = isGoal(d);
                d.inGoalHierarchy = isInGoalHierarchy(d);
                d.inHoverHierarchy = isInHoverHierarchy(d);
                d.hover = isHover(d);
            };

            $scope.planConcepts = $scope.active.topLevelConcepts.filter(function(d)
            {
                return !$scope.activeDependencyProviderIds || $scope.activeDependencyProviderIds.indexOf(d.concept._id) !== -1;
            });
            $scope.planConcepts.forEach(function(d)
            {
                //console.log(d.children);
                //console.log($scope.active.hierarchyIds);
                setAttributes(d);

                if(($scope.active.hierarchyIds.indexOf(d.concept._id) !== -1 || $scope.active.goalHierarchyIds.indexOf(d.concept._id) !== -1 || $scope.active.hoverHierarchyIds.indexOf(d.concept._id) !== -1) && d.children)
                {
                    d.planChildren = d.children.filter(checkDependencyProvider);

                    d.planChildren.forEach(function(e)
                    {
                        setAttributes(e);

                        if(($scope.active.hierarchyIds.indexOf(e.concept._id) !== -1 || $scope.active.goalHierarchyIds.indexOf(e.concept._id) !== -1 || $scope.active.hoverHierarchyIds.indexOf(e.concept._id) !== -1) && e.children)
                        {
                            e.planChildren = e.children.filter(checkDependencyProvider);

                            e.planChildren.forEach(function(f)
                            {
                                setAttributes(f);
                            });
                        }
                        else
                        {
                            e.planChildren = [];
                        }

                    });
                    //console.log($scope.activeDependencyProviderIds);
                    //console.log(d.planChildren);
                }
                else
                {
                    d.planChildren = [];
                }
            });

            //console.log($scope.planConcepts);

            //console.log(todo);
        };

        var updateWatchable = function()
        {
            //console.log('updating watchable', $scope.todo);

            if($scope.todo !== undefined && $scope.todo !== null)
            {
                var i = 0;

                if($scope.goalConcept === null && $scope.activeConcept !== null)
                {
                    var todoIds = $scope.todo.map(function(t) { return t.concept._id; });
                    i = todoIds.indexOf($scope.activeConcept.concept._id);
                }

                if(i !== -1)
                {
                    for(; i < $scope.todo.length; i++)
                    {
                        //console.log($scope.todo[i]);
                        var conceptId = $scope.todo[i].concept._id;

                        if(!$scope.segmentPerConceptMap)
                        {
                            return $timeout(updateWatchable, 5000);
                        }

                        //console.log($scope.segmentPerConceptMap);
                        if($scope.segmentPerConceptMap && $scope.segmentPerConceptMap[conceptId] && $scope.segmentPerConceptMap[conceptId].length > 0)
                        {
                            $scope.active.watchableConcept = $scope.todo[i];
                            //console.log($scope.active.watchableConcept );
                            break;
                        }
                    }
                }
            }

            updatePlan();
        };

        $scope.$watch('todo', updateWatchable);

        function updateHierarchy()
        {
            //console.log('updating hierarchy');

            if($scope.activeConcept !== undefined && $scope.activeConcept !== null)
            {
                if(false)//$scope.activeConcept.children.length === 0)
                {
                    $scope.activeHierarchyChildren = $scope.activeConcept.parentData.children;
                    $scope.activeHierarchyConcept = $scope.activeConcept.parentData;
                }
                else
                {
                    //console.log($scope.activeConcept.children);
                    //console.log($scope.activeConcept);
                    //console.log($scope.directories.concepts);
                    $scope.activeHierarchyChildren = $scope.activeConcept.children;
                    $scope.activeHierarchyConcept = $scope.activeConcept;
                }
            }
            else
            {
                $scope.activeHierarchyChildren = $scope.active.topLevelConcepts;
                $scope.activeHierarchyConcept = { concept: $scope.course };
            }

            updatePlan();
        }

        $scope.$watch('activeConcept.children', function()
        {
            updateHierarchy();
        });

        $rootScope.$on('conceptStructureLoaded', function()
        {
            updateHierarchy();
        });

        $scope.$watch('active.topLevelConcepts', function()
        {
            updateHierarchy();
        });

        $scope.$watch('activeSegment', function()
        {
            if($scope.activeSegment !== undefined)
            {
                $scope.sources.filter(function(source) { return source._id === $scope.activeSegment.source }).forEach(function(activeLecture)
                {
                    $scope.activeLecture = activeLecture;
                });
            }
        });


        $scope.$watch('activeLecture', function()
        {
            if($scope.activeLecture !== undefined)
            {
                var currentConcepts = [];
                $scope.activeLectureConcepts = [];

                $scope.segments.filter(function(segment)
                {
                    return segment.source === $scope.activeLecture._id;
                }).forEach(function(segment)
                {
                    currentConcepts = currentConcepts.concat(segment.concepts);
                });

                $scope.concepts
                    .filter(function(concept){
                        return currentConcepts.indexOf(concept._id) !== -1;
                    })
                    .sort(function(a,b){return d3.ascending(a.order, b.order);})
                    .forEach(function(concept, i)
                    {
                        $scope.activeLectureConcepts.push($scope.directories.concepts[concept._id]);
                    });
            }
        });

        $scope.clickConcept = function(concept, $event)
        {
            if($scope.learnMode)
            {

            }
            else
            {
                //$scope.activateConcept(concept, 1);
                $event.preventDefault();
            }
        };

        $scope.$watch('activeConcept.concept.color', function()
        {
            if($scope.activeConcept !== null && $scope.activeConcept !== undefined)
            {
                $scope.activeColorDarker = d3.rgb($scope.activeConcept.concept.color).darker(.3).toString();
            }
        });

        $scope.understoodClick = function()
        {
            $scope.understood($scope.activeConcept);
        };

        $scope.notUnderstoodClick = function()
        {
            $scope.notUnderstood($scope.activeConcept);
        };

        $scope.hoverConceptPanel = function()
        {
            //$scope.unfold = false;console.log('false');
            //$scope.hoverConcept.apply(this, arguments);

        };
        $scope.leaveConceptPanel = function()
        {
            //$scope.leaveConcept.apply(this, arguments);
            //$scope.unfold = true;console.log('true');
        };

        function updateActive()
        {
            var searchParams = $location.search();

            if(searchParams.mode)
            {
                $scope.activeMode = searchParams.mode;
            }
            else
            {
                $scope.activeMode = 'plan';
            }
        }

        updateActive();
        $scope.$on('$locationChangeSuccess', function()
        {
            updateActive();
        });

        $scope.updatePanelHeight = function()
        {
            $scope.panelContentHeightMax = $scope.windowHeight - $scope.panelOffsetTop;
            $scope.courseScope.panelWidth = $scope.getPanelWidth();
        };

        var w = angular.element($window);
        w.bind('resize', $scope.updatePanelHeight);
        $scope.$watch('panelOffsetTop', $scope.updatePanelHeight);

    });
