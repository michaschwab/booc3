angular.module('courses').service('PanelAdmin', function(Concepts, $rootScope, $timeout, Authentication, $stateParams, $location, Segmentgroup)
{
    var $scope;
    var NEW_CONCEPT_TITLE = 'New Concept';
    var defaultConceptColors = ['#CB654F', '#D3B1A7', '#CFCB9C', '#8CBEA3', '#DFBA47', '#bdaed6'];
    var me = this;

    this.init = function(scope)
    {
        $scope = scope;
        $scope.stateParams = $stateParams;

        $scope.titlePattern = 'a-z';

        $scope.hasConceptEditRights = Authentication.isCourseTeachingAssistant($scope.course._id);
        $scope.hasAdminPanelRights = Authentication.isCourseContentEditor($scope.course._id);

        $scope.titleKeyPress = function($event, concept)
        {
            var conceptId = concept.concept._id;

            if($event.which == 13)
            {
                $scope.addConcept();
            }
            if($event.which == 27)
            {
                $('#concept-title-' + conceptId).blur();
            }
        };

        $scope.colorChange = function(concept)
        {
            $rootScope.$broadcast('dataUpdated', concept);

            save(concept);
        };

        $scope.titleChange = function(concept)
        {
            if(concept.concept.title)
            {
                $rootScope.$broadcast('dataUpdated', concept);

                save(concept);
            }
        };

        var saveTimeouts = {};

        var save = function(concept)
        {
            var conceptId = concept.concept._id;
            $timeout.cancel(saveTimeouts[conceptId]);

            saveTimeouts[conceptId] = $timeout(function()
            {
                console.log('saving concept change..');

                Concepts.update({_id: conceptId}, concept.concept,
                    function(v){
                        //console.log("saved:", v);
                        $scope.error = "saved  at " +new Date();
                        //$scope.directories.concepts[concept.concept._id].concept.title = 'aaa';
                        //$scope.directories.concepts[concept.concept._id].concept.title = concept.concept.title;

                    },
                    function(err){
                        console.log("ERROR saving:", err);
                        console.log(err.data);
                        $scope.error = "DID NOT SAVE !! (Error) ";
                    }
                );
            }, 500);
        };

        $scope.titleBlur = function(concept)
        {
            /*if(concept.concept.title == NEW_CONCEPT_TITLE)
            {
                $scope.removeConcept(concept);
            }*/
        };

        $scope.removeConcept = function(concept)
        {
            concept.concept.$remove(function()
            {
                var id = concept.concept._id;
                concept = null;
                console.log('deleted', id);

                $rootScope.$broadcast('conceptRemove', id, $scope.activeHierarchyChildren);
            });
        };

        $scope.sortableOptions = {
            handle: '.handle',
            items: "li.sortableConcept:not(.not-sortable)",
            update: function(e, ui) {
                /*var logEntry = tmpList.map(function(i){
                 return i.value;
                 }).join(', ');
                 $scope.sortingLog.push('Update: ' + logEntry);*/
                console.log('doing stuff');
            },
            stop: function(e, ui) {
                // this callback has the changed model
                /*var logEntry = tmpList.map(function(i){
                 return i.value;
                 }).join(', ');
                 $scope.sortingLog.push('Stop: ' + logEntry);*/

                for(var i = 0; i < $scope.activeHierarchyChildren.length; i++)
                {
                    var active = $scope.activeHierarchyChildren[i];

                    $scope.activeHierarchyChildren[i].concept.order = i * 100;
                    $scope.activeHierarchyChildren[i].order = i * 100;

                    Concepts.update({_id: active.concept._id}, active.concept);
                }
                $rootScope.$broadcast('conceptsReordered', $scope.activeHierarchyChildren);
                $rootScope.$broadcast('dataUpdated', $scope.activeHierarchyChildren);
            }
        };

        $scope.sortableSegmentOptions = {
            handle: '.seg-handle',
            items: "li.sortableSegment:not(.not-sortable)",
            update: function(e, ui) {
                /*var logEntry = tmpList.map(function(i){
                 return i.value;
                 }).join(', ');
                 $scope.sortingLog.push('Update: ' + logEntry);*/
                console.log('doing stuff');
            },
            stop: function(e, ui) {
                // this callback has the changed model
                /*var logEntry = tmpList.map(function(i){
                 return i.value;
                 }).join(', ');
                 $scope.sortingLog.push('Stop: ' + logEntry);*/

                var listEl = e.target;
                var conceptId = listEl.id.substr('concept-segments-'.length);

                if(conceptId)
                {
                    var index = 0;
                    //console.log($scope.segmentPerConceptMap[conceptId].map(function(seg) { var obj = {}; obj[seg.order[conceptId]]=seg.title; return obj;}));
                    $scope.segmentPerConceptMap[conceptId].forEach(function(segment)
                    {
                        if(!segment.order) segment.order = {};
                        segment.order[conceptId] = index * 100;
                        segment.$update();
                        index++;
                    });

                }
                else
                {
                    console.error('couldnt find the concept id of list ', listEl);
                }
            }
        };

        $scope.addSubConcept = function(concept)
        {
            $location.search('active', concept.concept._id);
            $timeout($scope.addConcept, 400);
        };

        $scope.addConcept = function()
        {
            var parents = $scope.activeConcept ? [$scope.activeConcept.concept._id] : [];
            var color = $scope.activeConcept ? $scope.activeConcept.concept.color : defaultConceptColors[$scope.activeHierarchyChildren.length % defaultConceptColors.length];
            var order = $scope.activeHierarchyChildren.length * 100;

            var concept = new Concepts({
                title: NEW_CONCEPT_TITLE,
                color: color,
                parents: parents,
                children: [],
                courses: [$scope.courseId],
                order: order
                //segments: []
            });

            concept.$save(function(c)
            {
                console.log(' saved', c);

                //$scope.concepts.push(c);
                //$rootScope.$broadcast('conceptAdd', c);

                var focus = function()
                {
                    var el = $('#concept-title-' + c._id);

                    el.focus();
                    el.select();
                };

                $timeout(focus, 100);
                $timeout(focus, 200);
            });
        };

        $scope.removeSegmentFromConcept = function(segment, concept)
        {
            segment.concepts.splice(segment.concepts.indexOf(concept.concept._id), 1);
            segment.$update();
            $scope.parseSegments();
        };

        $scope.deleteSegment = function(segment)
        {
            segment.$remove();
        };

        $scope.addSegmentGroup = function(concept)
        {
            var group = new Segmentgroup({
                courses: [$scope.courseId],
                concept: concept.concept._id,
                order: 3
            });

            group.$save();
        };
    };

    return (this);
});
