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
            connectWith: ".alternative-segments",
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

                var classNames = listEl.className.split(' ');
                var conceptId, segmentGroupId;

                classNames.forEach(function(className)
                {
                    if(className.substr(0, 'concept-segments-'.length) == 'concept-segments-')
                    {
                        conceptId = className.substr('concept-segments-'.length);
                    }
                    if(className.substr(0, 'segment-group-segments-'.length) == 'segment-group-segments-')
                    {
                        segmentGroupId = className.substr('segment-group-segments-'.length);
                    }
                });

                if(segmentGroupId)
                {
                    $scope.saveSegmentGroupSublist(segmentGroupId);
                }
                else if(conceptId)
                {
                    $scope.saveConceptSegmentOrder(conceptId);
                }
                else
                {
                    console.error('couldnt find the concept id or segment group id of list ', listEl);
                }
            }
        };

        $scope.saveConceptSegmentOrder = function(conceptId)
        {
            var index = 0;
            //console.log($scope.segmentPerConceptMap[conceptId].map(function(seg) { var obj = {}; obj[seg.order[conceptId]]=seg.title; return obj;}));
            $scope.segmentAndGroupPerConceptMap[conceptId].forEach(function(segment)
            {
                var newOrder = index * 100;

                if(!segment.isGroup)
                {
                    if(!segment.order) segment.order = {};
                    segment.order[conceptId] = newOrder;

                    segment.$update();
                }
                else
                {
                    // its a segment group
                    var group = segment;

                    group.order = newOrder;
                    group.$update();

                    $scope.saveSegmentGroupSublist(group._id);
                }

                index++;
            });
        };

        $scope.deleteSegmentgroup = function(group)
        {
            group.$remove();
        };

        $scope.showRenameSegmentgroup = function(group)
        {
            group.oldTitle = group.title;
            group.editing = true;
        };
        $scope.cancelRenameSegmentgroup = function(group)
        {
            group.editing = false;

            group.title = group.oldTitle;
            delete group.oldTitle;
        };
        $scope.saveRenameSegmentgroup = function(group)
        {
            group.editing = false;

            delete group.oldTitle;
            group.$update();
        };

        $scope.saveSegmentGroupSublist = function(groupId)
        {
            // Organize the nested segments: make sure the order is correct, and that they have the correct segment group.

            var subOrder = 0;
            var conceptId = $scope.segmentgroupMap[groupId].concept;

            $scope.segmentPerGroupMap[groupId].forEach(function(subseg)
            {
                subseg.order[conceptId] = subOrder;

                if(subseg.segmentgroups.indexOf(groupId) === -1)
                    subseg.segmentgroups.push(groupId);

                subseg.$update();

                subOrder += 100;
            });

            // Check if any segments need to be removed from this group
            var removeSegs = $scope.segmentPerConceptMap[conceptId].filter(function(segment)
            {
                return segment.segmentgroups.indexOf(groupId) !== -1 && $scope.segmentPerGroupMap[groupId].indexOf(segment) === -1;
            });

            if(removeSegs.length)
            {
                removeSegs.forEach(function(seg)
                {
                    seg.segmentgroups.splice(seg.segmentgroups.indexOf(groupId), 1);
                    seg.$update();
                });

                // If a segment was moved out of the folder to the general list of concept segments,
                // then their order needs to be recalculated.
                $scope.saveConceptSegmentOrder(conceptId);
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
