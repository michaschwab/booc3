'use strict';

angular.module('concepts').service('ConceptPanelView',
    function($window, $timeout)
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
                    $scope.panelWidth = newWidth;
                    $scope.safeApply();
                    $scope.updatePanelHeight();
                });
            };

            $scope.maximize = function()
            {
                $scope.minimized = false;
                var newWidth = $scope.getPanelWidth();

                $scope.panelWidth = newWidth;
                $scope.safeApply();
                $scope.animatePanelWidth(newWidth, function()
                {
                    $scope.updatePanelHeight();
                });
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
                setPanelOffsetTop();

                $scope.panelContentHeightMax = $scope.windowHeight - $scope.panelOffsetTop;
                //console.log()
                $scope.panelWidth = $scope.getPanelWidth();

                if($scope.activeMode=='plan')
                {
                    if($scope.activeConcept && !$scope.minimized)
                    {
                        $scope.panelContentHeight = $scope.panelContentHeightMax-120;
                    } else if($scope.minimized)
                        $scope.panelContentHeight = $scope.panelContentHeightMax-195;
                    else
                        $scope.panelContentHeight = $scope.panelContentHeightMax;
                }
                else if($scope.activeMode == 'admin')
                {
                    $scope.panelContentHeight = $scope.panelContentHeightMax;
                }
                else if($scope.activeMode == 'lecture')
                {
                    $scope.panelContentHeight = $scope.panelContentHeightMax-160;
                }
            };

            function setPanelOffsetTop()
            {
                d3.selectAll('.panel-content-active').forEach(function(el)
                {
                    if(el[0] !== undefined)
                    {
                        $scope.panelOffsetTop = el[0].getBoundingClientRect().top;

                    }
                    else
                    {
                        //console.log('not yet');
                        $timeout(setPanelOffsetTop, 20);
                    }

                });
            }

            var w = angular.element($window);
            w.bind('resize', $scope.updatePanelHeight);
            $scope.$watch('panelOffsetTop', $scope.updatePanelHeight);

            $scope.$on('$locationChangeSuccess', function()
            {
                $scope.updatePanelHeight();
                $timeout($scope.updatePanelHeight, 100);
                $timeout($scope.updatePanelHeight, 500);
            });
        };

        return (this);
    }).filter('secondsToDateTime', function() {
    return function(seconds) {
        var d = new Date(0,0,0,0,0,0,0);
        d.setSeconds(seconds);
        return d;
    };
});;
