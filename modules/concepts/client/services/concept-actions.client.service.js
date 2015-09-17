'use strict';

angular.module('concepts').service('ConceptActions',
    function(SeenConcepts)
    {
        var $scope;

        this.init = function(scope)
        {
            $scope = scope;

            $scope.seeConcept = function(conceptId)
            {
                if(!$scope.seenMapByConcept[conceptId])
                {
                    var data = {};
                    data.concept = conceptId ? conceptId : $scope.activeConcept.concept._id;
                    data.course = $scope.course._id;

                    var seen = new SeenConcepts(data);
                    seen.$save();
                }
            };

            $scope.unseeConcept = function(conceptId)
            {
                if($scope.seenMapByConcept[conceptId])
                {
                    var seen = $scope.seenMapByConcept[conceptId];
                    seen.$remove();
                }
                else
                {
                    console.log('cant unsee concept ' + conceptId + ' because it doesnt seem to be marked as seen.');
                }
            };
        };

        return (this);
    });
