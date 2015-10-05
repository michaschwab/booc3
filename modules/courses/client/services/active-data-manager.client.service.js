angular.module('courses').service('ActiveDataManager', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure, $interval, $stateParams)
{
    var me = this;
    var $scope;
    var tour;
    var user = Authentication.user;

    this.init = function(scope)
    {
        $scope = scope;

        $scope.$on('$locationChangeSuccess', function() { me.updateActive();  });
    };

    $interval(this.updateActive, 200);

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
        this.updateCurrentGoal();
    };

    this.setActiveSegments = function()
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
    };
});
