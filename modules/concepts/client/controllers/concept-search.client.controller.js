'use strict';

angular.module('concepts').controller('ConceptSearchController',
    function($scope, $stateParams, $location, Authentication, Concepts, Logger)
    {
        Concepts.query({courses:$stateParams.courseId}).$promise.then(function(d) {

            $scope.searchConcepts = d;
        });


        $scope.searchSelect = function(concept, event)
        {
            /*var learnScope = angular.element('.learning').scope();
             if(learnScope !== undefined)
             {
             learnScope.expandGraph();
             }*/
            /*
             var appNode = d3.select('.concept-map-full').node();
             appScope = angular.element(appNode).scope();
             return appScope.activateConcept.apply(appScope,arguments);*/
            //$location.search('active', )
            //console.log(arguments);
            var conceptData = { conceptId: concept._id, conceptTitle: concept.title };
            Logger.log('ConceptSearchSelect', conceptData, event);

            $location.search('active', concept._id);
        };

        $scope.searchUnselect = function(scope)
        {
            Logger.log('ConceptSearchUnSelect', null, event);

            $location.search('active', '');
            scope.$select.selected = null;

            /*var learnScope = angular.element('.learning').scope();
             if(learnScope !== undefined)
             {
             learnScope.expandGraph();
             }

             appScope = angular.element('.concept-map-full').scope();
             return appScope.searchUnselect.apply(appScope,arguments);*/
            /*var appNode = d3.select('.concept-map-full').node();
             appScope = angular.element(appNode).scope();
             return appScope.activateConcept();*/
        };

        $scope.$watch('activeConcept', function()
        {
            var el = d3.select('.concept-select');
            el = angular.element(el[0]);
            var select = el.scope().$select ? el.scope().$select : {};

            if($scope.activeConcept !== null)
            {
                select.selected = $scope.activeConcept.concept;
            }
            else
            {
                select.selected = null;
            }
        });
    });
