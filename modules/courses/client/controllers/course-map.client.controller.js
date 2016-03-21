'use strict';

angular.module('courses').controller('CourseMapController', function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, $timeout, Tip, MapArrows, MapCircles, MapSquares, MapActions, MapIcons, $rootScope, MapEvents, MapTour, Logger)
    {
        $scope.authentication = Authentication;

        var me = this;
        var init = false;
        var dataReady = false;

        $scope.initTime = 0;
        $scope.options = {};
        var REDRAW_MINTIME = 80;
        var REDRAW_WAITTIME = 20;
        var redraw_timeout = null;

        $scope.$on('$locationChangeSuccess', function()
        {
            $scope.redraw();
        });
        $scope.$on('redrawHover', function()
        {
            $scope.redrawHover();
        });
        $scope.$on('dataReady', function() {
            dataReady = true;
            $scope.redraw();
        });

        $scope.$on('dataUpdated', function()
        {
            $scope.initMap();
            $scope.createLayout();
            $scope.redraw();
        });

        $scope.initMap = function()
        {
            var n = $scope.concepts;

            if(!init && n.length > 0 && $scope.active.topLevelConcepts.length)
            {
                console.log('initiating map..');
                init = true;
                $scope.initTime = new Date().getTime();
                //console.log('initializing map');

                $scope.initDraw();
                $scope.createLayout();


                $scope.resizeFunction();
            }
        };

        // Find existing Course
        $scope.findOne = function()
        {
            $scope.zoomMode = true;
            $scope.zoomLevel = 0;
            $scope.currentZoomGoal = [0, 0];
            $scope.lastHoverRedraw = 0;
            $scope.redrawn = 0;
            $scope.zooming = false;
            $scope.creatingDepConcept = null;

            $scope.currentGoal = null;
            Tip.setScope($scope);

            MapArrows.init($scope);

            $scope.vis = null;
            $scope.canvas = null;

            //ConceptStructure.init($scope, $stateParams.courseId);
            MapEvents.init($scope, $stateParams.courseId);
            MapTour.init($scope);
        };

        $scope.$on('conceptsReordered', function(event, concepts)
        {
            for(var i = 0; i < concepts.length; i++)
            {
                $scope.configCircle(concepts, concepts[i].depth, concepts[i], i);
            }

            $scope.redraw();
        });

        $scope.$on('conceptRemove', function(event, conceptId, hierarchyConcepts)
        {
            MapActions.removeConcept(conceptId, hierarchyConcepts);
        });

        var timeout;
        var onGraphResize = function()
        {
            $scope.resizeFunction();
            $scope.redraw();
        };

        var onBackgroundClick = function(e)
        {
            $scope.activateConcept(undefined, e);
            //Tip.closeOpenTips();
        };

        $scope.resizeFunction = function()
        {
            var svgWidth = $scope.graphWidth;
            var svgHeight = $scope.graphHeight;

            $scope.vis.attr({
                width:svgWidth,
                height:svgHeight
            });

            //TODO find a way to fix the flickering
            /*$scope.canvas.attr({
                "transform":function() {
                    return "translate("
                    +(svgWidth/2)+","
                    +(svgHeight/2)+")";
                }
            });*/
        };

        MapCircles.init($scope);
        MapSquares.init($scope);
        MapActions.init($scope);
        MapIcons.init($scope);

        $scope.createLayout = function()
        {
            /*var tlc = [];

            ConceptStructure.getConceptChildren(tlc, null, null, 1, $scope.configCircle);

            $scope.active.topLevelConcepts = tlc;
            $rootScope.$broadcast('conceptStructureLoaded');*/
            MapCircles.createLayout($scope.active.topLevelConcepts);
            MapSquares.createLayout();
        };

        var initDrawn = false;

        $scope.initDraw = function()
        {
            if(initDrawn) return;
            initDrawn = true;
            //console.log('doing initdraw!');
            $scope.vis = d3.select('#vis');
            //$scope.vis.selectAll('*').remove();
            //console.log('init draw');

            $scope.canvas = $scope.vis.append("g")
                //.call(zoom)
            .append("g").attr({
                id:"mainCanvas"
            });

            var vis = document.getElementById('vis');
            vis.addEventListener('mousemove', function(e)
            {
                if(e.target.id == 'vis')
                {
                    $scope.leaveConcept();
                    $scope.safeApply();
                }
            });
            vis.addEventListener('click', function(e)
            {
                if(e.target.id == 'vis')
                {
                    onBackgroundClick(e);
                    $scope.safeApply();
                }
            });

            $scope.canvas.append("g").attr("id", "bgLayer");
            $scope.mainLayer = $scope.canvas.append("g").attr("id", "mainLayer");
            $scope.canvas.append("g").attr("id", "depLayer");
            $scope.canvas.append("g").attr("id", "pathLayer");
            $scope.canvas.append("g").attr("id", "eventLayer");
            $scope.canvas.append("g").attr("id", "squareLayer");

            $scope.visParams = {
                scale:d3.scale.linear(),
                l1:{radiusSelected:1}
            };
        };

        var firstZoomDone = false;

        $scope.redraw = function()
        {
            if(!dataReady) return;
            if(!init) $scope.initMap();

            $scope.absUrl = $location.absUrl(); // Sometimes this is not updated in time.

            var doRedraw = function()
            {
                var vis = $scope.canvas;
                var params = $scope.visParams;

                MapCircles.setRadius();
                MapCircles.setup();
                MapSquares.setup();

                // For first run the radius won't be set yet, or a new concept has been added
                var concepts = Object.keys($scope.directories.concepts).map(function (key) {
                    return $scope.directories.concepts[key];
                });

                if(concepts.filter(function(d) {return d.radius === undefined || d.radius === null;}).length)
                {
                    //console.log('setting radius');
                    MapCircles.setRadius();
                }

                var w = $scope.graphWidth;
                var h = $scope.graphHeight;
                var smallerDim = w > h ? h : w;
                //var l1Scale = Math.min(Math.PI/($scope.active.topLevelConcepts.length),1);
                var l1Radius = $scope.active.topLevelConcepts[0].radius;
                var size = ((w>h)?h:w)/(1+l1Radius)-10;

                params.scale.range([0,(size/2)]);

                /*lxCircleEnters.forEach(function(lxCircleEnter)
                {
                    MapIcons.addToCircleEnter(lxCircleEnter);
                });*/

                MapCircles.update();
                MapSquares.update();
                MapEvents.update();

                var canvas = $scope.canvas;
                var scale = 1;
                var translate = [w/2, h/2];

                if($scope.zoomMode)
                {
                    if ($scope.active.hierarchy.length > 0)
                    {
                        var trans = $scope.getTranslateAbs($scope.activeConcept, true);

                        var sortedHierarchy = $scope.active.hierarchy.sort(function (a, b) {
                            return a.depth - b.depth;
                        });

                        // The following line makes it so it does not zoom in further if a concept has no children.
                        var index = !sortedHierarchy[sortedHierarchy.length - 1].children.length ? sortedHierarchy.length - 2 : sortedHierarchy.length - 1;
                        var selectedConcept = sortedHierarchy[index];

                        if(selectedConcept)
                        {
                            var radius = $scope.visParams.scale(selectedConcept.radius);

                            var scaleRelative = 0.75; // If 1, then the element fills out the full screen.
                            scale = smallerDim / radius / 2 * scaleRelative;
                            var topLeft = {x: trans.x - radius, y: trans.y - radius};


                            var relativeMove = radius * (1 - scaleRelative) * scale;
                            // Dunno why 25, but seems to work well
                            var fixingAmount = 25 * $scope.graphMinDim / 800;

                            var proportionsFix = w > h ? (w - h) / 2 : 0;

                            translate = [topLeft.x * scale * -1 + relativeMove + fixingAmount + proportionsFix, topLeft.y * scale * -1 + relativeMove + fixingAmount];
                        }
                    }
                }

                // Make sure it's zoomed out, in case zoomMode was on before.

                var zoom = d3.behavior.zoom()
                    .translate([0, 0])
                    //.translate([w/2, h/2])
                    .scale(1)
                    //.scaleExtent([1, 8])
                    .on('zoom', function()
                    {
                        canvas.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
                    });

                if(translate[0] != $scope.currentZoomGoal[0] || translate[1] != $scope.currentZoomGoal[1])
                {
                    //console.log(translate, $scope.currentZoomGoal);
                    $scope.zoomLevel = selectedConcept ? selectedConcept.depth : 0;

                    var duration = firstZoomDone && (!$scope.lastGraphResize || Date.now() - $scope.lastGraphResize > 500) ? 750 : 0;
                    firstZoomDone = true;

                    if(!duration)
                    {
                        $scope.currentZoomGoal = translate;

                        canvas
                            .call(zoom.translate(translate).scale(scale).event);
                    }
                    else
                    {
                        canvas.transition()
                            .duration(duration)
                            .call(zoom.translate(translate).scale(scale).event)
                            .each('start', function()
                            {
                                //console.log('zooming with duration 750');
                                $scope.zoomLevel = selectedConcept ? selectedConcept.depth : 0;
                                //console.log($scope.zoomLevel);
                                $scope.currentZoomGoal = translate;
                                $scope.zooming = true;
                                $scope.$apply();
                            }).each('end', function()
                            {
                                $scope.currentZoomGoal = translate;
                                $scope.zooming = false;
                                //$scope.redrawHover();
                                $scope.$apply();
                            });
                    }

                }

                MapArrows.drawDeps();
                MapArrows.drawPlans();
                MapIcons.redraw();

                $scope.safeApply();
                $scope.redrawn++;

                //$timeout($scope.redrawHover, 50);
            };

            $timeout.cancel(redraw_timeout);
            redraw_timeout = $timeout(function()
            {
                requestAnimFrame(doRedraw);
            }, REDRAW_WAITTIME);

            //doRedraw();
        };

        var lastRedrawHoverHovers = [];
        var lastRedrawHoverTodos = [];
        var lastGraphWidth = 0;
        var lastGraphHeight = 0;
        var lastHoverSegment;

        $scope.redrawHover = function(force)
        {
            if(!force)
            {
                if(angular.equals($scope.active.hoveringConceptIds, lastRedrawHoverHovers)
                    && angular.equals($scope.todoIds, lastRedrawHoverTodos)
                    && $scope.graphWidth === lastGraphWidth && $scope.graphHeight === lastGraphHeight
                    && $scope.active.hoverSegment === lastHoverSegment)
                {
                    return;
                }
            }

            lastRedrawHoverHovers = $scope.active.hoveringConceptIds;
            lastRedrawHoverTodos = $scope.todoIds;
            lastGraphWidth = $scope.graphWidth;
            lastGraphHeight = $scope.graphHeight;
            lastHoverSegment = $scope.active.hoverSegment;

            //console.log(cScope.active.hoveringConceptIds);

            var doRedrawHover = function()
            {
                //console.log(lastRedrawHoverHovers, lastRedrawHoverTodos, lastGraphHeight, lastGraphWidth);

                MapCircles.updateActive();
                MapSquares.update();

                MapArrows.drawPlans();
            };

            //requestAnimFrame(doRedrawHover);
            if($scope.visParams)
                doRedrawHover();
        };

        $scope.correctPathPosition = function(concept, start, end)
        {
            return MapArrows.correctPathPosition(concept, start, end, $scope.visParams.scale, $scope.getTranslateAbs);
        };

        var lastSize = '';
        $scope.setGraphSize = function()
        {
            $scope.lastGraphResize = Date.now();
            $scope.graphWidth = $scope.activeMode == 'minimap' ? parseInt($scope.contentWidth/3)-30 : parseInt($scope.contentWidth);
            $scope.graphHeight = $scope.activeMode == 'minimap' ? $scope.graphWidth : parseInt($scope.windowHeight)-55;
            $scope.graphMinDim = $scope.graphWidth < $scope.graphHeight ? $scope.graphWidth : $scope.graphHeight;
            var newSize = $scope.graphWidth + '-' + $scope.graphHeight;
            if(lastSize !== newSize)
            {
                lastSize = newSize;

                if(init)
                {
                    onGraphResize();
                }
            }
        };

        //$scope.$watch('activeMode', $scope.setGraphSize);

        $scope.courseViewScope = $scope.$parent.$parent;
        /*$scope.courseViewScope.$watch('contentWidth', function()
        {
            $scope.contentWidth = $scope.courseViewScope.contentWidth;
            $scope.setGraphSize();
        });*/

        $scope.safeApply = function(fn) {
            $timeout(fn);
        };

        var w = angular.element($window);
        $scope.windowHeight = $window.innerHeight;
        $scope.windowWidth = $window.innerWidth;
        $scope.setGraphSize();

        w.bind('resize', function ()
        {
            $scope.$apply();

            $scope.windowHeight = $window.innerHeight;
            $scope.windowWidth = $window.innerWidth;

            $scope.setGraphSize();
        });
        $scope.$watch('panelWidth', $scope.setGraphSize);

        $scope.$on("$destroy", function() {
            w.unbind('resize');
        });
	}
)/*.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})*/;

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();
