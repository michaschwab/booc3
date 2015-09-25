'use strict';

angular.module('concepts').service('ConceptPanelView',
    function($window)
    {
        var $scope;

        this.init = function(scope)
        {
            $scope = scope;

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

            $scope.understoodClick = function()
            {
                $scope.understood($scope.activeConcept);
            };

            $scope.notUnderstoodClick = function()
            {
                $scope.notUnderstood($scope.activeConcept);
            };

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

            $scope.updatePanelHeight = function()
            {
                $scope.panelContentHeightMax = $scope.windowHeight - $scope.panelOffsetTop;
                $scope.courseScope.panelWidth = $scope.getPanelWidth();
            };

            var w = angular.element($window);
            w.bind('resize', $scope.updatePanelHeight);
            $scope.$watch('panelOffsetTop', $scope.updatePanelHeight);
        };

        return (this);
    });
