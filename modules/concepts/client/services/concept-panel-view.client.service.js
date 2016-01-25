'use strict';

angular.module('concepts').service('ConceptPanelView',
    function($window, $timeout, Logger)
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

            $scope.minimize = function(event)
            {
                $scope.minimized = true;
                Logger.log('PanelMinimizeClick', null, event);

                var newWidth = $scope.getPanelWidth();

                $scope.animatePanelWidth(newWidth, function()
                {
                    $scope.panelWidth = newWidth;
                    $scope.safeApply();
                    $scope.updatePanelHeight();
                });
            };

            $scope.maximize = function(event)
            {
                $scope.minimized = false;
                var newWidth = $scope.getPanelWidth();

                Logger.log('PanelMaximizeClick', null, event);

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
                var conceptData = { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth };
                Logger.log('PanelUnderstoodClick', conceptData, event);

                $scope.seeConcept($scope.activeConcept.concept._id);
                $scope.understood($scope.activeConcept);
            };

            $scope.seenClick = function(event)
            {
                var conceptData = { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth };
                Logger.log('PanelSeenClick', conceptData, event);

                $scope.notUnderstood($scope.activeConcept);
                $scope.seeConcept($scope.activeConcept.concept._id)
            };

            $scope.notSeenClick = function(event)
            {
                var conceptData = { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth };
                Logger.log('PanelNotSeenClick', conceptData, event);

                $scope.notUnderstood($scope.activeConcept);
                $scope.unseeConcept($scope.activeConcept.concept._id)
            };

            $scope.notUnderstoodClick = function()
            {
                $scope.notUnderstood($scope.activeConcept);
            };

            $scope.previousClick = function(event)
            {
                var conceptData = { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth };
                Logger.log('PanelPreviousClick', conceptData, event);
            };

            $scope.nextClick = function(event)
            {
                var conceptData = { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth };
                Logger.log('PanelNextClick', conceptData, event);
            };

            $scope.lectureTabClick = function(event)
            {
                Logger.log('LectureTabClick', null, event);
            };

            $scope.planTabClick = function(event)
            {
                Logger.log('PlanTabClick', null, event);
            };

            $scope.learnButtonClick = function(event)
            {
                var conceptData = $scope.activeConcept ? { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth } : null;
                Logger.log('PanelLearnClick', conceptData, event);
            };

            $scope.mapButtonClick = function(event)
            {
                var conceptData = $scope.activeConcept ? { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth } : null;
                Logger.log('PanelMapClick', conceptData, event);
            };

            $scope.goalButtonClick = function(event)
            {
                var conceptData = $scope.activeConcept ? { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth } : null;
                Logger.log('PanelGoalClick', conceptData, event);
            };

            $scope.unsetGoalButtonClick = function(event)
            {
                var conceptData = $scope.activeConcept ? { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth } : null;
                Logger.log('PanelUnsetGoalClick', conceptData, event);
            };

            $scope.courseClick = function(event)
            {
                var conceptData = $scope.activeConcept ? { conceptId: $scope.activeConcept.concept._id, conceptTitle: $scope.activeConcept.concept.title, conceptDepth: $scope.activeConcept.depth } : null;
                Logger.log('PanelCourseClick', conceptData, event);
            };

            $scope.breadcrumbsCourseClick = function(event)
            {
                Logger.log('PanelCourseClick', null, event);
            };

            $scope.breadcrumbsConceptClick = function(event)
            {
                Logger.log('PanelCourseClick', null, event);
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
                    $scope.panelContentHeight = $scope.panelContentHeightMax-10;
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
