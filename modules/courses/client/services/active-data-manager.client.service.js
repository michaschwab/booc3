angular.module('courses').service('ActiveDataManager', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure, $interval, $stateParams, SeenDataManager)
{
    var me = this;
    var $scope;
    var tour;
    var user = Authentication.user;
    var dataReady = false;

    this.init = function(scope)
    {
        $scope = scope;

        $scope.$on('$locationChangeSuccess', me.updateData);
        $scope.$on('dataReady', function()
        {
            dataReady = true;
            me.updateData();
        });
        $scope.$on('dataUpdated', me.updateData);

        SeenDataManager.addSeenListener(me.updateAttributes);
    };

    this.updateData = function()
    {
        if(!dataReady) return;

        me.updateActive();
        me.updateLearnedConceptIds();
        me.setGoalHierarchy();
        me.updateHierarchy();
        me.updateTodo();
        me.updatePlan();
        me.setActiveSegments();
        me.updateLectures();

        me.updateWatchable();
        SeenDataManager.checkSeen();
    };

    this.updateTodo = function()
    {
        var concept = $scope.activeConcept;

        //todo: use $scope.currentGoal

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

        this.updateTodoIds();
        //if(!$scope.todo.length) $timeout($scope.updateTodo, 20);
        //console.log($scope.goalConcept, $scope.active.hoveringConceptIds, concept, $scope.todo);
    };


    //$interval(this.updateActive, 200);

    this.updateCurrentGoal = function()
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
    };

    this.updateTodoIds = function()
    {
        //console.log('updating to do ids');
        $scope.todoIds = $scope.todo.map(function(t) { return t.concept._id; });
    };

    this.setGoalHierarchy = function()
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

        $scope.active.goalHierarchyIds = $scope.active.goalHierarchy.map(function(concept)
        {
            return concept.concept._id;
        });
    };

    this.setActiveHierarchy = function()
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
    };

    this.updateLearnedConceptIds = function()
    {
        $scope.active.learnedConceptIds = $scope.learned.map(function(l) { return l.concept; });
    };

    this.updateActive = function()
    {
        var searchParams = $location.search();

        //console.log(searchParams);
        //console.log($scope.directories.concepts);z

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
        if($stateParams.addTo && $scope.directories.concepts[$stateParams.addTo])
        {
            $scope.addToConcept = $scope.directories.concepts[$stateParams.addTo];
        }
        else
        {
            $scope.addToConcept = null;
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

        if(searchParams.mode)
        {
            $scope.activeMode = searchParams.mode;
        }
        else
        {
            $scope.activeMode = 'plan';
        }

        this.updateCurrentGoal();
    };

    this.setActiveSegments = function()
    {
        if($scope.activeConcept)
        {
            $location.search('active', $scope.activeConcept.concept._id);

            $scope.active.segments = $scope.segments.filter(function(segment)
            {
                return segment.concepts.indexOf($scope.activeConcept.concept._id) !== -1;
            });
            //console.log($scope.active.segments);

            me.setSegment();
        }
        else
        {
            $scope.active.hierarchy = [];
            //$location.search('active', '');
        }
    };

    this.setSegment = function()
    {
        // Default is to take the lecture duo segment.
        //console.log($scope.active.segments.length);

        var newSegments = $scope.active.segments.filter(function(segment)
        {
            return segment._id === $scope.active.segmentId;
        });

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

        if($scope.active.segment !== null)
        {
            $scope.active.sourceId = $scope.active.segment.source;
        }

        this.setSource();
    };

    this.setSource = function()
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
        if($scope.active.source !== null)
        {
            $scope.active.sourcetype = $scope.sourcetypeMap[$scope.active.source.type];
        }
        else
        {
            $scope.active.sourcetype = null;
        }
    };



    this.setActiveLectureConcepts = function()
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
    };

    this.updateDepProviders = function()
    {
        me.updateNext();

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
    };

    this.updateHierarchy = function()
    {
        //console.log('updating hierarchy');

        var hierarchy = [];
        var concept = $scope.activeConcept;
        while(concept !== null && concept !== undefined)
        {
            hierarchy.push(concept);
            concept = concept.parentData;
        }

        $scope.active.hierarchy = hierarchy.reverse();

        if($scope.activeConcept !== undefined && $scope.activeConcept !== null)
        {
            var searchParams = $location.search();

            var adminMode = searchParams.mode && searchParams.mode == 'admin';
            var learnMode = $stateParams.learn && $stateParams.learn === 'yes';

            if(learnMode && adminMode && $scope.activeConcept.parentData)
            {
                // For admins, show the parent's hierarchy in the panel while in learning mode.
                $scope.activeHierarchyChildren = $scope.activeConcept.parentData.children;
                $scope.activeHierarchyConcept = $scope.activeConcept.parentData;
            }
            else
            {
                $scope.activeHierarchyChildren = $scope.activeConcept.children;
                $scope.activeHierarchyConcept = $scope.activeConcept;
            }
        }
        else
        {
            $scope.activeHierarchyChildren = $scope.active.topLevelConcepts;
            $scope.activeHierarchyConcept = { concept: $scope.course };
        }

        $scope.active.hierarchyIds = $scope.active.hierarchy.map(function(concept)
        {
            return concept.concept._id;
        });

        /*if($scope.active.hierarchy.length > 0)
        {
            $scope.activeConcept = $scope.active.hierarchy[$scope.active.hierarchy.length-1];
        }
        else
        {
            $scope.activeConcept = null;
        }*/
    };

    this.isActive = function(d)
    {
        return $scope.active.hierarchyIds.indexOf(d.concept._id) !== -1;
    };
    this.isGoal = function(d)
    {
        return $scope.goalConcept && $scope.goalConcept.concept._id === d.concept._id;
    };
    this.isInGoalHierarchy = function(d)
    {
        return $scope.active.goalHierarchyIds.indexOf(d.concept._id) === -1;
    };
    this.isInHoverHierarchy = function(d)
    {
        return $scope.active.hoverHierarchyIds.indexOf(d.concept._id) === -1;
    };
    this.isHover = function(d)
    {
        return $scope.active.hoveringConceptIds.indexOf(d.concept._id) !== -1;
    };

    this.setAttributes = function(d)
    {
        d.learned = $scope.isLearned(d);
        d.active = this.isActive(d);
        d.goal = this.isGoal(d);
        d.inGoalHierarchy = this.isInGoalHierarchy(d);
        d.inHoverHierarchy = this.isInHoverHierarchy(d);
        d.hover = this.isHover(d);
        d.isSeen = $scope.isSeen(d);
        d.notOnPlan = !this.isOnPlan(d);
    };

    this.isOnPlan = function(d)
    {
        return !$scope.activeDependencyProviderIds ? false : $scope.activeDependencyProviderIds.indexOf(d.concept._id) !== -1;
    };

    this.updateAttributes = function()
    {
        Object.keys($scope.directories.concepts).forEach(function(conceptId)
        {
            var concept = $scope.directories.concepts[conceptId];
            me.setAttributes(concept);
        });
    };

    this.updatePlan = function()
    {
        me.updateDepProviders();

        if(!$scope.activeDependencyProviderIds) return;

        var checkDependencyProvider = function(d)
        {
            return $scope.activeDependencyProviderIds.indexOf(d.concept._id) !== -1;
        };

        $scope.planConcepts = $scope.active.topLevelConcepts.filter(function(d)
        {
            return !$scope.activeDependencyProviderIds || $scope.activeDependencyProviderIds.indexOf(d.concept._id) !== -1;
        });

        $scope.planConcepts.forEach(function(d)
        {
            me.setAttributes(d);

            if(($scope.active.hierarchyIds.indexOf(d.concept._id) !== -1 || $scope.active.goalHierarchyIds.indexOf(d.concept._id) !== -1 || $scope.active.hoverHierarchyIds.indexOf(d.concept._id) !== -1) && d.children)
            {
                d.planChildren = d.children.filter(checkDependencyProvider);

                d.planChildren.forEach(function(e)
                {
                    me.setAttributes(e);

                    if(($scope.active.hierarchyIds.indexOf(e.concept._id) !== -1 || $scope.active.goalHierarchyIds.indexOf(e.concept._id) !== -1 || $scope.active.hoverHierarchyIds.indexOf(e.concept._id) !== -1) && e.children)
                    {
                        e.planChildren = e.children.filter(checkDependencyProvider);

                        e.planChildren.forEach(function(f)
                        {
                            me.setAttributes(f);
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

        me.updateAttributes();

        //console.log($scope.planConcepts);

        //console.log(todo);
    };

    this.updateWatchable = function()
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
                        return $timeout(me.updateWatchable, 5000);
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

        //me.updatePlan();
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

    this.updateLectures = function()
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
    };

    this.updateNext = function()
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

            if($scope.activeConcept)
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

    };
});
