angular.module('courses').service('MapCircles', function(Tip, $location, $timeout, Logger)
{
    var me = this;
    var lxCircle;
    var lxCircles = [];
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;
        $scope.options.grayInactiveConcepts = true;

        $scope.$on('dataUpdated', function(event, concept)
        {
            // If a concept has been changed in the db, forget the cache and re-set all attributes.
            lastUpdateData = {};
        });

        $scope.splitTitle = function(title, depth)
        {
            var titleSnippets = title.split(/\s+/);

            var splitTexts = [];
            var currentSnippet = [];
            var currentLength =0;
            var threshold = $scope.characterMax[depth];

            titleSnippets.forEach(function(snippet){
                if (snippet.length> threshold){
                    // for terms longer than threshold
                    if (currentLength>0){
                        splitTexts.push(currentSnippet.join(' '));
                    }
                    splitTexts.push(snippet);
                    currentLength=0;
                    currentSnippet=[];
                }else if ((snippet.length+currentLength)>threshold){
                    // if term would lead to overflow
                    splitTexts.push(currentSnippet.join(' '));
                    currentLength=snippet.length;
                    currentSnippet=[snippet];

                }else{
                    // if term fits in threshold
                    currentLength+=snippet.length;
                    currentSnippet.push(snippet);
                }
            });

            if (currentLength>0){
                splitTexts.push(currentSnippet.join(' '));
            }

            return splitTexts;
        };

        // maximal characters per level
        $scope.characterMax={
            1:12,
            2:13,
            3:13
        };

        $scope.configCircle = function(array, depth, concept, i)
        {
            var aLength = +array.length;
            var angleDistance = 1.87 * Math.PI/aLength;

            var angle = i * angleDistance;
            concept.angle = angle;
            concept.x =   Math.sin(angle);
            concept.y = - Math.cos(angle);

            concept.splitTexts = $scope.splitTitle(concept.concept.title, depth);
        };

        $scope.getTranslate = function(d, config)
        {
            var translate;
            var parentRadius = d.parentData === undefined ? 1 : d.parentData.radius;
            if(!config)
            {
                config = $scope.getConfig(d);
            }

            var positionFct = config.position === undefined ? function(x) { return x; } : config.position;

            if($scope.active.hierarchy.indexOf(d) > -1)
            {
                positionFct = config.positionSelected;
            }
            else if($scope.active.hierarchy.indexOf(d.parentData) > -1 && $scope.active.hierarchy.indexOf(d.parentData) != $scope.active.hierarchy.length - 1)
            {
                positionFct = config.positionParentInSelection;
            }

            translate = {
                x: $scope.visParams.scale(parentRadius * positionFct(d.x, d)),
                y: $scope.visParams.scale(parentRadius * positionFct(d.y, d)),
                radius: $scope.visParams.scale(parentRadius)
            };

            if(!isNaN(translate.x))
            {
                return translate;
            }
            else
            {
                console.error('getting the position didnt work out. parentRadius:', parentRadius, 'd.x:', d.x, 'rel x: ', positionFct(d.x, d));
                return {x: 0, y: 0, radius: 0};
            }
        };

        $scope.getTranslateAbs = function(d, lastDepth)
        {
            var trans = {x: 0, y: 0};
            var chain = d.parentChain ? d.parentChain.concat(d) : [d];
            if(lastDepth === undefined)
            {
                lastDepth = 100;
            }

            chain.forEach(function(selectedConcept)
            {
                if(selectedConcept.depth <= lastDepth)
                {
                    var relativeTrans = $scope.getTranslate(selectedConcept, $scope.getConfig(selectedConcept));
                    trans = {
                        x: trans.x + relativeTrans.x,
                        y: trans.y + relativeTrans.y
                    };
                }
            });

            return trans;
        };

        $scope.getConfig = function(concept)
        {
            return $scope.visParams['l'+concept.depth];
        };
    };

    var getConfig = function(concept)
    {
        return $scope.visParams['l'+concept.depth];
    };

    this.createLayout = function(tlc)
    {
        //var scale = 300;
        var l1MaxRadius = Math.min(Math.PI/(tlc.length),1);

        var l2maxRadius = Math.PI/10; // maximum 9 blobbs along the circle
        var l3maxRadius = Math.PI/10; // maximum 9 blobbs along the circle

        var setupParams = function()
        {
            var l1, l2, l3;

            if($scope.zoomMode)
            {
                l1 = {
                    scale:d3.scale.linear().domain([0,1]),
                    radiusSelected: .7,
                    radius: .7,
                    radiusNonSelected: .7,
                    positionSelected:function(pos, d){return pos;},
                    textYOffset: 0.02,
                    textColor:'#000'
                };
                l2 = {
                    scale:d3.scale.linear().domain([0,1]),

                    radiusSelected: l2maxRadius *.7,
                    radius: l2maxRadius *.7,
                    radiusNonSelected:l2maxRadius *.7,
                    radiusNonSelectedButParent:l2maxRadius *.7,
                    radiusParentSelected:l2maxRadius *.7,

                    positionSelected:function(pos){return pos*.75;},
                    position:function(pos){return pos *.75;},
                    positionParentInSelection: function(pos) { return pos * .75; },

                    textYOffset: 0.012,
                    textPos:function(d){
                        if (d.splitTexts.length>0) return -((d.splitTexts.length-1)*3); // depends on textYOffset
                        else return 0;
                    },
                    textColor:'#000'
                };
                l3 = {
                    scale:d3.scale.linear().domain([0,1]),
                    radiusSelected: l3maxRadius*.8,
                    radius: l3maxRadius *.8,
                    radiusNonSelected:l3maxRadius *.8,
                    radiusNonSelectedButParent:l3maxRadius *.8,
                    radiusParentSelected:l3maxRadius *.8,
                    positionSelected:function(pos){return pos*1;},
                    position:function(pos){return pos *1;},
                    positionParentInSelection: function(pos) { return pos * 1; },
                    textYOffset: 0.004,
                    textPos:function(d){
                        if (d.splitTexts.length>0) return -((d.splitTexts.length-1)*3/2); // depends on textYOffset
                        else return 0;
                    },
                    textColor:'#ccc'

                };
                //console.log(l3.textYOffset);
            }
            else
            {
                l1 = {
                    scale:d3.scale.linear().domain([0,1]),
                    radiusSelected:1.6,
                    radius: .8,
                    radiusNonSelected: .4,
                    positionSelected:function() { return 0; },
                    textYOffset: 0.02,
                    textColor:'#000'
                };
                l2 = {
                    scale:d3.scale.linear().domain([0,1]),
                    radiusSelected: l2maxRadius *1.83,
                    radius: l2maxRadius *.7,
                    radiusNonSelected:l2maxRadius *.6,
                    radiusNonSelectedButParent:l2maxRadius *.5,
                    radiusParentSelected:l2maxRadius *.8,
                    positionSelected:function() { return 0; },
                    position:function(d){ return d *.75;},
                    positionParentInSelection: function(pos) { return pos * .85; },
                    textYOffset: 0.018,
                    textPos:function(d, scale){
                        //console.log(d.radius, scale(d.radius));
                        if (d.radius)return (scale(d.radius)+10);
                        else return 0;
                    },
                    textColor:'#000'
                };
                l3 = {
                    scale:d3.scale.linear().domain([0,1]),
                    radiusSelected: l3maxRadius*1.8,
                    radius: l3maxRadius *.8,
                    radiusNonSelected:l3maxRadius *.5,
                    radiusNonSelectedButParent:l3maxRadius *.5,
                    radiusParentSelected:l3maxRadius *0.8,
                    positionSelected:function() { return 0; },
                    position: function(d) { return d *.78; },
                    positionParentInSelection: function(pos) { return pos * .85; },
                    textYOffset: 0.012,
                    textPos:function(d){
                        if (d.splitTexts.length>0) return -((d.splitTexts.length-1)*10/2); // depends on textYOffset
                        else return 0;
                    },
                    textColor:'#ccc'

                }
            }

            $scope.visParams.l1=l1;
            $scope.visParams.l2=l2;
            $scope.visParams.l3=l3;
        };
        $scope.$watch('zoomMode', setupParams);


        var setupCircles = function(array, depth)
        {
            for(var i = 0; i < array.length; i++)
            {
                var concept = array[i];
                $scope.configCircle(array, depth, concept, i);

                if(concept.children)
                {
                    setupCircles(concept.children, depth + 1);
                }
            }

        };

        setupParams();
        this.setupCircles();
    };

    this.setupCircles = function(array, depth)
    {
        if(!array)
        {
            array = $scope.active.topLevelConcepts;
            depth = 1;
        }

        for(var i = 0; i < array.length; i++)
        {
            var concept = array[i];
            $scope.configCircle(array, depth, concept, i);

            if(concept.children)
            {
                me.setupCircles(concept.children, depth + 1);
            }
        }
    };

    this.setup = function()
    {
        // this function takes about 2ms, including 1ms from setupL.

        var vis = $scope.canvas;

        var l1Circle, l1CircleEnter;

        var setupL1 = function()
        {
            var tlcReverse = $scope.active.topLevelConcepts.slice(0).sort(function(a,b) { return b.concept.order - a.concept.order; });
            l1Circle = $scope.mainLayer.selectAll('.l1Circle').data(tlcReverse, function(d) { return d.concept._id; });
            lxCircles[1] = l1Circle;
            l1Circle.exit().remove();

            l1CircleEnter = l1Circle.enter().append('g').attr({
                'class': 'l1Circle lxCircle',
                'data-concept-id': function(d) { return d.concept._id; },
                'id': function(d) { return 'concept-' + d.concept._id; }
            });
            lxUpdate(l1CircleEnter, l1Circle);

            return l1CircleEnter;
        };

        var setupL = function(level)
        {
            var className = 'l' + level + 'Circle';
            var parentClassName = 'l' + (level - 1) + 'Circle';
            var parentCircle = vis.selectAll('.' + parentClassName);

            var lxCircle = parentCircle.selectAll('.' + className)
                .data(function(d)
                {
                    return d.children.slice(0).sort(function(a,b)
                    {
                        return b.concept.order - a.concept.order;
                    }).map(function(dd){

                        dd.parentData = d;
                        dd.parentChain = [];
                        dd.conceptDepth = level;

                        var currentD = d;
                        for (var i = 1; i< level; i++){
                            dd.parentChain.push(currentD);
                            currentD = currentD.parentData;
                        }

                        return dd;
                    });
                }, function(d) { return d.concept._id; });
            lxCircles[level] = lxCircle;

            var lxCircleEnter = lxCircle.enter().append('g').attr({
                'class': className + ' lxCircle l23Circle',
                'data-concept-id': function(d) { return d.concept._id; },
                'id': function(d) { return 'concept-' + d.concept._id; }
            });

            lxUpdate(lxCircleEnter, lxCircle);
            lxCircle.exit().remove();

            return lxCircleEnter;
        };
        var mouseDownTime = 0;

        var lxUpdate = function(lxCircleEnter, lxCircle)
        {
            lxCircleEnter.append('circle').attr({
                r: 5,//function(d) { return d.depth == 1 ? 50 : params.scale(getConfig(d).radius); }
                id: function(d) { return 'concept-circle-' + d.concept._id; }
            }).on({
                'click': function (d)
                {
                    var now = Date.now();


                    if(mouseDownTime && now - mouseDownTime > 800)
                    {
                        // dragging?
                        //console.log('dragging');
                    }
                    else
                    {
                        var segments = $scope.segmentPerConceptMap[d.concept._id];

                        // Disable the current hover, as things might be moving around and the currently hovered concept
                        // might not be hovered after that any more.
                        $scope.leaveConcept(d, true);

                        // If it's already selected and it has viewable contents, show them.
                        if($scope.activeConcept !== null && $scope.activeConcept.concept._id === d.concept._id && segments && segments.length > 0)
                        {
                            var conceptData = { conceptId: d.concept._id, conceptTitle: d.concept.title, conceptDepth: d.depth };
                            Logger.log('MapConceptPlay', conceptData, d3.event);
                            $location.search('learn', 'yes');
                            $scope.safeApply();
                        }
                        else
                        {
                            $scope.activateConcept(d, d3.event);
                        }

                    }

                    mouseDownTime = 0;
                    // Close tooltips that would otherwise be overlapping with possible animations following this.
                    Tip.closeOpenTips();

                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                },
                // Need to catch touchstart event for touch devices because the mousemove and mouseover events are
                // triggered for them (for some reason) and is done so before the click event, causing wrong hover effects.
                // Calling stopPropagation here causes the mousemove event to not trigger.
                'touchstart': function(d)
                {
                    $scope.activateConcept(d);

                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                },
                'mousedown': function(d)
                {
                    mouseDownTime = Date.now();
                },
                'mouseover': function(d) { $scope.safeApply(function() { $scope.hoverConcept(d);}); }//,
                //'mouseleave': function(d) { $scope.safeApply(function() { $scope.leaveConcept(d); }); }
            });

            lxCircleEnter.each(function(d){
                //console.log('enter:',d, this, d3.select(this));
                var el = d3.select(this);

                el.append('g').attr('class', 'icons');

                d.titleEl = el.append('text').attr({
                    class: 'concept-title'
                });

                d.splitTexts = $scope.splitTitle(d.concept.title, d.depth);

                me.makeTitle(d, el);
            });

            Tip.forConcept(lxCircleEnter);
        };

        var enters = [];
        enters.push(setupL1());
        enters.push(setupL(2));
        enters.push(setupL(3));

        return enters;
    };

    var mainCanvas;
    this.makeStartCircle = function()
    {
        //if(!mainCanvas) // this needs to have some kind of course-specific caching.
        {
            mainCanvas = d3.select('#mainCanvas');
        }
        mainCanvas.selectAll('.startIconGroup').remove();
        var start = mainCanvas.append('g').classed('startIconGroup', true);

        var firstBig = $scope.active.topLevelConcepts.slice(0).sort(function(a,b) { return a.concept.order - b.concept.order; })[0];
        var scale = ((firstBig.radius / 0.7) / 2 + 0.5) * $scope.graphMinDim / 700;

        var firstBigPos = $scope.getTranslateAbs(firstBig);
        //var arrowStart = { x: firstBigPos.x - scale * 180 , y: firstBigPos.y - scale * 100  };
        var startPos = { x: firstBigPos.x - scale * 169 , y: firstBigPos.y - scale * 72  };

        //start.attr('transform', 'translate(' + arrowStart.x +', ' + arrowStart.y + ') rotate(17)');
        start.attr('transform', 'translate(' + startPos.x +', ' + startPos.y + ')');

        function makeCircle()
        {
            var circleStart = {};
            circleStart.x = scale * 11;
            circleStart.y = scale * 22;

            return start.append('circle')
                .attr('class', 'startCircle')
                .attr('id', 'mapStartCircle')
                .attr('r', 30 * scale);
                //.attr('transform', 'translate(' + circleStart.x +', ' + circleStart.y + ')');
        }

        function makeTriangle()
        {
            var lineData = [ { "x": 0,   "y": 0},  { "x": 0,  "y": 40 * scale},
                { "x": 34.64 * scale,  "y": 20 * scale}, { "x": 0,   "y": 0}];

            var lineFunction = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate("linear");

            start.append("path")
                .attr("d", lineFunction(lineData));
        }

        var startCircle = makeCircle();
        //makeTriangle();

        start.append('text').attr({
            class: 'concept-title start-title'
        }).attr({
            /*x: 15 * scale,
            y: 15 * scale*/
            /*'fill': '#ffffff',*/

        }).style({'font-size': 16 * scale}).html('Start');

        startCircle.on('click', function()
        {
            Logger.log('MapStartClick');
            if($scope.active.watchableConcept)
            {
                $location.search('active', $scope.active.watchableConcept.concept._id);
                $location.search('learn', 'yes');
            }
        });

    };

    var titlesDone = {};

    this.makeTitle = function(d, el)
    {
        var index = d.radius + '-' + d.concept.title + '-' + $scope.graphMinDim;

        if(titlesDone[d.concept._id] !== index)
        {
            titlesDone[d.concept._id] = index;

            if(!d.titleEl || d.titleEl.empty())
            {
                d.titleEl = el.select('.concept-title');
            }

            var titleData = d.splitTexts.map(function(splitText) { return { text: splitText } });
            var titleSpans = d.titleEl.selectAll('tspan').data(titleData);

            titleSpans.enter().append('tspan').attr('x',0);
            titleSpans.text(function(dd) { return dd.text; });

            var radiusFactor = d.radius ? 0.5 + d.radius * 4 : 1;
            var offset = getConfig(d).textYOffset * $scope.graphHeight * radiusFactor;

            titleSpans.attr({
                'dy': function(dd, index)
                {
                    if(index === 0)
                    {
                        return - (-0.18 + (d.splitTexts.length - 1) / 2) * offset;
                    }
                    return offset;
                }
            });
        }
    };

    var lastUpdateData = {};

    this.setTranslate = function(d, el, config)
    {
        if(!config)
            config = getConfig(d);

        var trans = $scope.getTranslate(d, config);
        var conceptId = d.concept._id;
        var transCache = lastUpdateData[conceptId] ? lastUpdateData[conceptId]['translate'] : null;

        // Only ever need to do this once in zoomMode.
        if(!transCache || trans.x !== transCache.x ||  trans.y !== transCache.y)
        {
            if(!lastUpdateData[conceptId]) lastUpdateData[conceptId] = {};
            lastUpdateData[conceptId]['translate'] = trans;
            //console.count(conceptId);

            el.attr({
                'transform': 'translate(' + trans.x + ',' + trans.y + ')'
            });
        }
    };

    this.setFontSize = function(d, el, lastUpdate)
    {
        var fontSize = $scope.graphHeight * d.radius / 17 + 0.3;

        if(lastUpdate['fontSize'] !== fontSize)
        {
            lastUpdate['fontSize'] = fontSize;
            //console.count(d.concept._id);

            if(!d.titleEl)
            {
                d.titleEl = el.select('.concept-title');
            }

            d.titleEl.style({
                'font-size': fontSize + 'px'
            });
        }
    };

    this.update = function()
    {
        //console.log('updating graph circles');
        var params = $scope.visParams;
        var vis = $scope.canvas;
        if(lastUpdateData['initTime'] !== $scope.initTime)
        {
            lastUpdateData = { initTime: $scope.initTime };
        }

        lxCircle = vis.selectAll('.lxCircle');

        // this takes about 4ms on my computer when nothing is really happening here.
        lxCircle.each(function(d, index)
        {
            var el = d3.select(this);
            var conceptId = d.concept._id;
            var config = getConfig(d);
            if(!lastUpdateData[conceptId]) lastUpdateData[conceptId] = {};
            var lastUpdate = lastUpdateData[conceptId];
            var isPlayable = Boolean($scope.segmentPerConceptMap && $scope.segmentPerConceptMap[conceptId] && $scope.segmentPerConceptMap[conceptId].length);

            // The titles need to be remade because the radius of the circles change in non-zoomMode, or because of renaming.
            me.makeTitle(d, el);
            me.setTranslate(d, el, config);
            me.setFontSize(d, el, lastUpdate);

            var color = $scope.depthColorModification(d, $scope.options.grayInactiveConcepts);

            //if(d.concept.title == 'New Concept') console.log(lastUpdate['radius'], d.radius);
            if(lastUpdate['radius'] !== d.radius || lastUpdate['color'] !== color || lastUpdate['graphWidth'] !== $scope.graphWidth || lastUpdate['graphHeight'] !== $scope.graphHeight)
            {
                if(!d.circleEl)
                {
                    d.circleEl = el.select('circle');
                }
                var circle = d.circleEl;

                if(lastUpdate['radius'] !== d.radius || lastUpdate['graphWidth'] !== $scope.graphWidth || lastUpdate['graphHeight'] !== $scope.graphHeight)
                {
                    //console.count(conceptId);
                    lastUpdate['radius'] = d.radius;
                    lastUpdate['graphWidth'] = $scope.graphWidth;
                    lastUpdate['graphHeight'] = $scope.graphHeight;

                    circle.attr(
                    //circle.transition().attr(
                    {
                        r:  params.scale(d.radius)
                    });
                }
                if(lastUpdate['color'] !== color)
                {
                    //todo for some reason this does not work with transition().
                    circle.style('fill', d3.rgb(color));
                    lastUpdate['color'] = color;
                }
            }
            if(!lastUpdate['playable'] || lastUpdate['playable'] !== isPlayable)
            {
                lastUpdate['playable'] = isPlayable;
                el.classed('playable', isPlayable);
            }
        });

        this.makeStartCircle();
    };

    this.redraw = function()
    {
        this.setup();
        this.update();
    };

    this.reSelect = function()
    {
        for(var level = 1; level < 4; level++)
        {
            var className = 'l' + level + 'Circle';
            lxCircles[level] = $scope.canvas.selectAll('.' + className);
        }
    };

    //var times = [];
    this.setRadius = function()
    {
        // This takes an average of 0.3 ms.
        //var start = window.performance.now();

        var resizeFct = function(d)
        {

            var config = getConfig(d);
            var parentRadius = d.parentData ? d.parentData.radius : 1;
            var scale = d.depth == 1 ? Math.min(Math.PI/($scope.active.topLevelConcepts.length),1) : 1;

            if ($scope.active.hierarchy.indexOf(d) > -1) { // I am selected
                d.radius = parentRadius * scale * config.radiusSelected;
            }
            else if (d.parentData && $scope.active.hierarchy.indexOf(d.parentData) > -1 && $scope.active.hierarchy.indexOf(d.parentData) == $scope.active.hierarchy.length - 1) {
                d.radius = parentRadius * scale  * config.radiusParentSelected;
            }
            else if (d.parentData && $scope.active.hierarchy.indexOf(d.parentData) > -1) {
                d.radius = parentRadius * scale  * config.radiusNonSelectedButParent;
            }
            else if ($scope.active.hierarchy.length > 0) { // someone else is selected
                d.radius = parentRadius * scale  * config.radiusNonSelected;
            }
            else { // no one is selected
                d.radius = parentRadius * scale  * config.radius;
            }
        };

        for(var i = 0; i < lxCircles.length; i++)
        {
            if(lxCircles[i])
            {
                lxCircles[i].each(resizeFct);
            }
        }

        //var time = window.performance.now() - start;
        //times.push(time);
        //console.log(times.reduce(function(a, b) { return a + b; }) / times.length, times[times.length-1]);
        //console.trace();
    };

    var colorCache = {};

    this.updateActive = function()
    {
        if(!lxCircle) return;

        lxCircle.each(function(d)
        {
            var color = $scope.depthColorModification(d, $scope.options.grayInactiveConcepts);
            var lastColor = colorCache[d.concept._id];

            if(!lastColor || lastColor !== color)
            {
                colorCache[d.concept._id] = color;

                if(!d.circleEl)
                {
                    d.circleEl = d3.select(this).select('circle');
                }
                d.circleEl.transition().style('fill', color);
            }
        });
    };

});
