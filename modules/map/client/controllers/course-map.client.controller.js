'use strict';

angular.module('map').controller('CourseMapController', function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, $timeout, Tip, MapArrows, MapCircles, MapSquares, MapActions, MapIcons, $rootScope, MapEvents, MapTour, Logger, MapRearranger)
    {
        $scope.authentication = Authentication;

        var me = this;
        var init = false;
        var dataReady = false;

        $scope.initTime = 0;
        $scope.options = {};

        var REDRAW_WAITTIME = 20;
        var redraw_timeout = null;

        /**
         * This function defines how the map reacts to changes outside of the map.
         */
        var setupWatchers = function()
        {
            // When the URL is changed, eg. the active concept changed, redraw the map.
            $scope.$on('$locationChangeSuccess', $scope.redraw);

            // When some other service or controller requests to redraw the colors and such things, do so.
            $scope.$on('redrawHover', $scope.redrawHover);

            // When the data is ready, save that state, and draw the map.
            $scope.$on('dataReady', function()
            {
                dataReady = true;
                $scope.redraw();
            });

            // When the data is updated, re-initialize the map and redraw the map.
            $scope.$on('dataUpdated', function()
            {
                $scope.initMap();
                $scope.initDrawServices(); // Is this necessary?!
                $scope.redraw();
            });

            // When the concepts are re-ordered, re-configure them.
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
        };

        /**
         * This function is called to initialize the map. It initiates the drawing of essential elements for the vis.
         */
        $scope.initMap = function()
        {
            var n = $scope.concepts;

            if(!init && n.length > 0 && $scope.active.topLevelConcepts.length)
            {
                console.log('initiating map..');
                init = true;
                $scope.initTime = new Date().getTime();

                initDraw();
                $scope.initDrawServices();
                $scope.resizeFunction();
            }
        };

        /**
         * This function initializes this file and is called by the course map template when loaded.
         * It initializes the services necessary for the visualization.
         */
        $scope.initController = function()
        {
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

            MapEvents.init($scope, $stateParams.courseId);
            MapTour.init($scope);
            MapCircles.init($scope);
            MapSquares.init($scope);
            MapActions.init($scope);
            MapIcons.init($scope);
            MapRearranger.init($scope, $scope.vis);

            setupWatchers();
        };

        /**
         * This function defines what happens if the graph is resized.
         * It re-sets the svg element's size, and redraws the map.
         */
        var onGraphResize = function()
        {
            $scope.resizeFunction();
            $scope.redraw();
        };

        /**
         * This function defines what happens when the map's background is clicked.
         * Currently, this means that it de-selects the current concept.
         * @param e The Click event.
         */
        var onBackgroundClick = function(e)
        {
            $scope.activateConcept(undefined, e);
            //Tip.closeOpenTips();
        };

        /**
         * This function sets the svg element's width and height attributes.
         */
        $scope.resizeFunction = function()
        {
            var svgWidth = $scope.graphWidth;
            var svgHeight = $scope.graphHeight;

            $scope.vis.attr({
                width:svgWidth,
                height:svgHeight
            });
        };

        /**
         * This function calls the Map's Circle and Square Services to do their initial drawing.
         */
        $scope.initDrawServices = function()
        {
            MapCircles.createLayout($scope.active.topLevelConcepts);
            MapSquares.createLayout();
        };

        var initDrawn = false;

        /**
         * This function creates the map's layers, sets mousemove and click event listeners,
         * and defines a linear scale for the visualization.
         */
        var initDraw = function()
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

        /**
         * This function figures out which concept to zoom to, and zooms to it.
         */
        var doZooming = function()
        {
            var w = $scope.graphWidth;
            var h = $scope.graphHeight;
            var smallerDim = w > h ? h : w;
            var canvas = $scope.canvas;
            var scale = 1;
            var translate = [w/2, h/2];

            if($scope.options.zoomMode)
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
        };

        /**
         * This function does a full redraw of the visualization, including zooming
         */
        $scope.redraw = function()
        {
            if(!dataReady) return;
            if(!init) $scope.initMap();

            $scope.absUrl = $location.absUrl(); // Sometimes this is not updated in time.

            var doRedraw = function()
            {
                MapCircles.setRadius();
                MapCircles.setup();
                MapSquares.setup();
                MapRearranger.setup();

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
                var l1Radius = $scope.active.topLevelConcepts[0].radius;
                var size = ((w>h)?h:w)/(1+l1Radius)-10;

                $scope.visParams.scale.range([0,(size/2)]);

                MapCircles.update();
                MapSquares.update();
                MapEvents.update();

                doZooming();

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
        };

        var lastRedrawHoverHovers = [];
        var lastRedrawHoverTodos = [];
        var lastGraphWidth = 0;
        var lastGraphHeight = 0;
        var lastHoverSegment;
        var lastSearchText = '';

        /**
         * This function updates the active Concepts on the map, updates the Segments on the Map,
         * and redraws the plans.
         * @param force Force redrawing, in case no significant variable has changed.
         */
        $scope.redrawHover = function(force)
        {
            if(!force)
            {
                // This avoids unnecessary redrawing.

                if(angular.equals($scope.active.hoveringConceptIds, lastRedrawHoverHovers)
                    && angular.equals($scope.todoIds, lastRedrawHoverTodos)
                    && $scope.graphWidth === lastGraphWidth && $scope.graphHeight === lastGraphHeight
                    && $scope.active.hoverSegment === lastHoverSegment
                    && lastSearchText == $scope.search.text)
                {
                    return;
                }
            }

            lastRedrawHoverHovers = $scope.active.hoveringConceptIds;
            lastRedrawHoverTodos = $scope.todoIds;
            lastGraphWidth = $scope.graphWidth;
            lastGraphHeight = $scope.graphHeight;
            lastHoverSegment = $scope.active.hoverSegment;
            lastSearchText = $scope.search ? $scope.search.text : '';

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

        /**
         * Computes the size the visualization should take up. Depends on the content width,
         * whether the map is currently minimized, and other things.
         */
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

        $scope.courseViewScope = $scope.$parent.$parent;

        $scope.safeApply = function(fn) {
            $timeout(fn);
        };

        /**
         * This makes sure the visualization gets updated if the window or panel are resized.
         */
        var setResizeListeners = function()
        {
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

            // Without the following line, closing and re-opening the vis
            // multiple times by navigating to different parts of the website and coming back
            // will cause the resize function to be executed many times too much.
            $scope.$on("$destroy", function() {
                w.unbind('resize');
            });
        };

        setResizeListeners();
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
