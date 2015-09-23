'use strict';

angular.module('courses').controller('CourseMapController', ['$scope','$stateParams','Courses','Concepts','Conceptdependencies','Authentication','$window','$location', 'ConceptStructure', '$timeout', 'Tip', 'MapArrows', 'MapCircles', 'MapActions', 'MapIcons', '$rootScope', 'MapEvents', 'MapTour',
	function($scope, $stateParams, Courses, Concepts, Conceptdependencies, Authentication, $window, $location, ConceptStructure, $timeout, Tip, MapArrows, MapCircles, MapActions, MapIcons, $rootScope, MapEvents, MapTour)
    {
        $scope.authentication = Authentication;

        var init = false;
        $scope.initTime = 0;

        $scope.initMap = function()
        {
            var n = $scope.concepts;

            if(n.length > 0)
            {
                console.log('initiating map..');
                init = true;
                $scope.initTime = new Date().getTime();
                //console.log('initializing map');

                $scope.createLayout();

                $scope.initDraw();

                $scope.resizeFunction();
                $scope.resetZoom(0);

                $scope.$watch('graphWidth', onGraphResize);
                $scope.$watch('graphHeight', onGraphResize);
            }
        };

        // Find existing Course
        $scope.findOne = function()
        {
            $scope.zoomMode = true;
            $scope.zoomLevel = 0;
            $scope.currentZoomGoal = [0, 0];
            $scope.lastRedraw = 0;
            $scope.lastHoverRedraw = 0;
            $scope.redrawn = 0;
            $scope.zooming = false;
            $scope.creatingDepConcept = null;

            $scope.currentGoal = null;
            Tip.setScope($scope);

            MapArrows.init($scope);

            $scope.vis = null;
            $scope.canvas = null;

            ConceptStructure.init($scope, $stateParams.courseId);
            MapEvents.init($scope, $stateParams.courseId);
            MapTour.init($scope);

            $scope.$watchCollection('concepts.downloadedUpdates',function()
            {
                $scope.initMap();
            });

            $scope.$watchCollection('dependencies', function(n)
            {
                if(n !== undefined && n.length > 0)
                {
                    $scope.redraw();
                }
            });
        };

        /*$scope.$on('conceptAdd', function(event, concept)
        {
            $scope.initMap(); // In case it's the course's very first concept
            MapActions.addConcept(concept);
            $scope.updateTodo();
            $scope.redraw();
        });*/

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

        $scope.$on('conceptTitleChange', function(event, c)
        {
            $scope.active.topLevelConcepts = MapActions.rename($scope.active.topLevelConcepts, c.concept._id, c.concept.title);
            $scope.redraw();
        });

        var redraws = {
            'todoIds': { type: 'normal', redraw: 'hover' },
            'active.learnedConceptIds': { type: 'collection', redraw: 'everything' },
            'goalConcept': { type: 'normal', redraw: 'everything' },
            'zoomMode': { type: 'normal', redraw: 'everything' },
            'active.hierarchyIds': { type: 'normal', redraw: 'everything' },
            //'active.hoveringConceptIds': { type: 'collection', redraw: 'hover' },
            'conceptColorChange': { type: 'event', redraw: 'hover' },
            'seenMapByConcept': { type: 'normal', redraw: 'everything' }
        };

        var timeout;
        var onGraphResize = function()
        {
            $timeout.cancel(timeout);
            timeout = $timeout(function()
            {
                $scope.resizeFunction();
                $scope.redraw();
            }, 10);
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
        MapActions.init($scope);
        MapIcons.init($scope);

        $scope.createLayout = function()
        {
            var tlc = [];

            ConceptStructure.getConceptChildren(tlc, null, null, 1, $scope.configCircle);

            $scope.active.topLevelConcepts = tlc;
            $rootScope.$broadcast('conceptStructureLoaded');

            MapCircles.createLayout($scope.active.topLevelConcepts);
        };

        $scope.resetZoom = function(duration)
        {
            if(duration === undefined)
            {
                duration = 750;
            }
            var svgWidth = $scope.graphWidth;
            var svgHeight = $scope.graphHeight;
            var svg = d3.select('#mainCanvas');
            var translate = [svgWidth/2, svgHeight/2];

            var zoom = d3.behavior.zoom()
                .translate(translate)
                .scale(1)
                .scaleExtent([1, 8])
                .on('zoom', function()
                {
                    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    $scope.zoomLevel = 0;
                    $scope.zooming = false;
                    $scope.$apply();
                });

            $scope.currentZoomGoal = translate;
            //console.log('resetting zoom with duration ', duration);

            svg.transition()
                .duration(duration)
                .call(zoom.translate(translate).scale(1).event)
                .each('start', function()
                {
                    $scope.currentZoomGoal = translate;
                    $scope.zooming = true;
                    //console.log($scope.currentZoomGoal);
                });
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
                    $scope.activateConcept();
                    $scope.safeApply();
                }
            });

            $scope.canvas.append("g").attr("id", "bgLayer");
            $scope.mainLayer = $scope.canvas.append("g").attr("id", "mainLayer");
            $scope.canvas.append("g").attr("id", "depLayer");
            $scope.canvas.append("g").attr("id", "pathLayer");
            $scope.canvas.append("g").attr("id", "eventLayer");

            $scope.visParams = {
                scale:d3.scale.linear(),
                l1:{radiusSelected:1}
            };
        };

        $scope.redraw = function(){

            if ($scope.active.topLevelConcepts.length==0) return;
            //console.log('redraw');

            var time = new Date().getTime();
            if(time - $scope.lastRedraw < 10)
            {
                return;
            }

            $scope.lastRedraw = time;

            var doRedraw = function()
            {
                var vis = $scope.canvas;
                var params = $scope.visParams;

                MapCircles.setRadius();
                var lxCircleEnters = MapCircles.setup();

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

                params.l1.scale.range([0,(size/2)]);

                /*lxCircleEnters.forEach(function(lxCircleEnter)
                {
                    MapIcons.addToCircleEnter(lxCircleEnter);
                });*/

                MapCircles.update();
                MapEvents.update();

                var canvas = $scope.canvas;
                var scale = 1;
                var translate = [w/2, h/2];

                if($scope.zoomMode)
                {
                    if ($scope.active.hierarchy.length > 0)
                    {
                        var trans = $scope.getTranslateAbs($scope.activeConcept, 2);

                        var sortedHierarchy = $scope.active.hierarchy.sort(function (a, b) {
                            return a.depth - b.depth;
                        });

                        var index = sortedHierarchy[sortedHierarchy.length - 1].depth === 3 ? sortedHierarchy.length - 2 : sortedHierarchy.length - 1;
                        var selectedConcept = sortedHierarchy[index];

                        var radius = $scope.visParams.l1.scale(selectedConcept.radius);

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

                // Make sure it's zoomed out, in case zoomMode was on before.

                var zoom = d3.behavior.zoom()
                    .translate([0, 0])
                    //.translate([w/2, h/2])
                    .scale(1)
                    .scaleExtent([1, 8])
                    .on('zoom', function()
                    {
                        canvas.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
                    });

                if(translate[0] != $scope.currentZoomGoal[0] || translate[1] != $scope.currentZoomGoal[1])
                {
                    //console.log(translate, $scope.currentZoomGoal);
                    $scope.zoomLevel = selectedConcept ? selectedConcept.depth : 0;

                    var duration = !$scope.lastGraphResize || Date.now() - $scope.lastGraphResize > 500 ? 750 : 0;

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
                            $scope.redrawHover();
                            $scope.$apply();
                        });
                }

                MapArrows.drawDeps();
                MapArrows.drawPlans();
                MapIcons.redraw();

                $scope.safeApply();
                $scope.redrawn++;

                //$timeout($scope.redrawHover, 50);
            };

            //requestAnimFrame(doRedraw);
            doRedraw();
        };

        var lastRedrawHoverHovers = [];
        var lastRedrawHoverTodos = [];
        var lastGraphWidth = 0;
        var lastGraphHeight = 0;

        $scope.redrawHover = function(force)
        {
            //todo this is a hack (after 3 redraws it is actually ready).
            if($scope.redrawn < 2 || $scope.todoIds.length === 0)
            {
                return;
            }

            if(!force)
            {
                if(angular.equals($scope.active.hoveringConceptIds, lastRedrawHoverHovers) && angular.equals($scope.todoIds, lastRedrawHoverTodos)
                    && $scope.graphWidth === lastGraphWidth && $scope.graphHeight === lastGraphHeight)
                {
                    return;
                }
            }

            lastRedrawHoverHovers = $scope.active.hoveringConceptIds;
            lastRedrawHoverTodos = $scope.todoIds;
            lastGraphWidth = $scope.graphWidth;
            lastGraphHeight = $scope.graphHeight;

            //console.log(cScope.active.hoveringConceptIds);

            var doRedrawHover = function()
            {
                //console.log(lastRedrawHoverHovers, lastRedrawHoverTodos, lastGraphHeight, lastGraphWidth);

                MapCircles.updateActive();

                MapArrows.drawPlans();
            };

            //requestAnimFrame(doRedrawHover);
            doRedrawHover();
        };

        $scope.correctPathPosition = function(concept, start, end)
        {
            return MapArrows.correctPathPosition(concept, start, end, $scope.visParams.l1.scale, $scope.getTranslateAbs);
        };

        $scope.setGraphSize = function()
        {
            $scope.lastGraphResize = Date.now();
            $scope.graphWidth = $scope.activeMode == 'minimap' ? parseInt($scope.contentWidth/3)-30 : parseInt($scope.contentWidth);
            $scope.graphHeight = $scope.activeMode == 'minimap' ? $scope.graphWidth : parseInt($scope.windowHeight)-55;
            $scope.graphMinDim = $scope.graphWidth < $scope.graphHeight ? $scope.graphWidth : $scope.graphHeight;
        };

        $scope.$watch('activeMode', $scope.setGraphSize);

        $scope.courseViewScope = $scope.$parent.$parent;
        $scope.courseViewScope.$watch('contentWidth', function()
        {
            $scope.contentWidth = $scope.courseViewScope.contentWidth;
            $scope.setGraphSize();
        });

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
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

        $scope.$watch('zoomMode', function()
        {
            $timeout($scope.redraw, 500);
        });

        for(var key in redraws)
        {
            if(redraws.hasOwnProperty(key))
            {
                var props = redraws[key];
                var cb = props.redraw === 'everything' ? function() { $scope.redraw(); } : function() { $scope.redrawHover(true); };

                if(props.type === 'event')
                    $scope.$on(key, cb);
                else if(props.type === 'normal')
                    $scope.$watch(key, cb);
                else if(props.type === 'collection')
                    $scope.$watchCollection(key, cb);
            }
        }
	}
])/*.directive('ngRightClick', function($parse) {
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
