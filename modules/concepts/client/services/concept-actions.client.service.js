'use strict';

angular.module('concepts').service('ConceptActions',
    function(SeenConcepts, Authentication, LearnedConcepts, ConceptStructure, SeenDataManager)
    {
        var $scope;

        this.init = function(scope)
        {
            $scope = scope;

            $scope.seeConcept = function(conceptId)
            {
                if(!conceptId) conceptId = $scope.activeConcept.concept._id;
                var concept = $scope.directories.concepts[conceptId];

                if(concept.children && concept.children.length)
                {
                    concept.children.forEach(function(child)
                    {
                        $scope.seeConcept(child.concept._id);
                    });
                }
                else
                {
                    if (!$scope.seenMapByConcept[conceptId])
                    {
                        var data = {};
                        data.concept = conceptId ? conceptId : $scope.activeConcept.concept._id;
                        data.course = $scope.course._id;

                        var seen = new SeenConcepts(data);
                        seen.$save();
                    }
                }
                SeenDataManager.updateSeenMap();
            };

            $scope.unseeConcept = function(conceptId)
            {
                SeenDataManager.updateSeenMap();

                if(!conceptId) conceptId = $scope.activeConcept.concept._id;
                var concept = $scope.directories.concepts[conceptId];

                if(concept.children && concept.children.length)
                {
                    concept.children.forEach(function(child)
                    {
                        $scope.unseeConcept(child.concept._id);
                    });
                }
                else
                {
                    if ($scope.seenMapByConcept[conceptId])
                    {
                        var seen = $scope.seenMapByConcept[conceptId];
                        seen.$remove();
                    }
                    else {
                        console.log('cant unsee concept ' + conceptId + ' because it doesnt seem to be marked as seen.');
                    }
                }
                SeenDataManager.updateSeenMap();
            };

            $scope.understood = function(concept)
            {
                if(concept.children && concept.children.length)
                {
                    concept.children.forEach(function(child)
                    {
                        $scope.understood(child);
                    });
                }
                else
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
                }
            };

            $scope.notUnderstood = function(concept)
            {
                var conceptIds = ConceptStructure.getConceptChildrenFlat(concept)
                    .map(function(d) { return d.concept._id; });

                $scope.learned.filter(function(l)
                {
                    return conceptIds.indexOf(l.concept) !== -1;
                }).forEach(function(learned, i)
                {
                    learned.$remove(function()
                    {
                        $scope.learned.splice($scope.learned.indexOf(learned), 1);
                    });

                });
            };
        };

        return (this);
    });
