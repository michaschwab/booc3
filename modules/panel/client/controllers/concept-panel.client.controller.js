'use strict';

angular.module('concepts').controller('ConceptPanelController',
    function($scope, $rootScope, $stateParams, $location, Authentication, Concepts, Conceptdependencies, Courses, Sourcetypes, Segments, Sources, ConceptStructure, $timeout, LearnedConcepts, SeenConcepts, $window, PanelAdmin, ConceptPanelView, ConceptActions, $interval, ActiveDataManager)
    {
        $scope.courseScope = angular.element('.course-view').scope();
        $scope = $scope.courseScope;

        $scope.unfold = true;
        $scope.minimized = false;

        $scope.planConcepts = [];

        PanelAdmin.init($scope);
        ConceptPanelView.init($scope);
        ConceptActions.init($scope);

        $scope.search = {};

        var planUpdateTimeout;
        var lastPlanUpdate = 0;

        $scope.clearSearch = function()
        {
            $scope.search.active = false;
            resetSearch();
            ActiveDataManager.updatePlan();
            $scope.$broadcast('redrawHover');
        };

        $scope.onSearchChange = function()
        {
            $scope.search.active = true;

            var executeUpdate = function()
            {
                lastPlanUpdate = Date.now();
                //console.log('executing plan update with search term ', $scope.search.text);
                ActiveDataManager.updatePlan();
                $scope.$broadcast('redrawHover');
            };

            var issueUpdate = function()
            {
                $timeout.cancel(planUpdateTimeout);

                var now = Date.now();
                if(now - lastPlanUpdate > 200)
                {
                    executeUpdate();
                }
                else
                {
                    planUpdateTimeout = $timeout(issueUpdate, 200);
                }
            };

            planUpdateTimeout = $timeout(issueUpdate, 200);
        };

        var resetSearch = function()
        {
            if(!$scope.search.active)
            {
                $scope.search.text = $scope.course.short;

                if($scope.currentGoal)
                {
                    $scope.search.text = $scope.currentGoal.concept.title;
                }
            }
        };

        $scope.$watch('currentGoal', resetSearch);
        $scope.$watch('activeConcept', function()
        {
            $scope.search.active = false;
            //ActiveDataManager.updatePlan();
        });

        $scope.$watch('activeConcept.concept.color', function()
        {
            if($scope.activeConcept !== null && $scope.activeConcept !== undefined)
            {
                $scope.activeColorDarker = d3.rgb($scope.activeConcept.concept.color).darker(.3).toString();
            }
        });
    });
