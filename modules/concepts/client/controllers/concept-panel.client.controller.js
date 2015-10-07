'use strict';

angular.module('concepts').controller('ConceptPanelController',
    function($scope, $rootScope, $stateParams, $location, Authentication, Concepts, Conceptdependencies, Courses, Sourcetypes, Segments, Sources, ConceptStructure, $timeout, LearnedConcepts, SeenConcepts, $window, PanelAdmin, ConceptPanelView, ConceptActions, $interval)
    {
        $scope.courseScope = angular.element('.course-view').scope();
        $scope = $scope.courseScope;

        $scope.unfold = true;
        $scope.minimized = false;

        $scope.planConcepts = [];

        PanelAdmin.init($scope);
        ConceptPanelView.init($scope);
        ConceptActions.init($scope);




        /*! $scope.$watch('activeConcept', function() { updateLectures(); updateNext(); });
        $scope.$watch('active.segment', updateNext);
        $scope.$watchCollection('segments', updateLectures);
        $scope.$watch('lectureduoType', updateLectures);*/



        /*! $scope.$watch('goalConcept', $scope.updateDepProviders);
        $scope.$watch('todoIds', $scope.updateDepProviders);*/

        //$scope.$watchCollection('learned', $scope.updateDepProviders);
        //$scope.$watchCollection('seenMapByConcept', $scope.updateDepProviders);



        //! $scope.$watch('todo', updateWatchable);



        //$interval(updateHierarchy, 200);
        //! $scope.$watch('activeConcept', updateHierarchy);

        /*$scope.$watchCollection('activeDependencyProviderIds', updateHierarchy);
        $scope.$watchCollection('active.hierarchyIds', updateHierarchy);
        $scope.$watchCollection('active.hoverHierarchyIds', updateHierarchy);

        $rootScope.$on('conceptStructureLoaded', updateHierarchy);
        $scope.$watch('active.topLevelConcepts', updateHierarchy);*/

        /*$scope.$watch('activeSegment', function()
        {
            if($scope.activeSegment !== undefined)
            {
                $scope.sources.filter(function(source) { return source._id === $scope.activeSegment.source }).forEach(function(activeLecture)
                {
                    $scope.activeLecture = activeLecture;
                });
            }
        });*/

        /*$scope.$on('dataReady', function()
        {
            updateHierarchy();
        });*/

        $scope.$watch('activeConcept.concept.color', function()
        {
            if($scope.activeConcept !== null && $scope.activeConcept !== undefined)
            {
                $scope.activeColorDarker = d3.rgb($scope.activeConcept.concept.color).darker(.3).toString();
            }
        });
    });
