angular.module('courses').service('MapIcons', function(Tip, ConceptStructure, $location, Authentication)
{
    var me = this;
    var $scope;
    var lastData = {};

    var OPACITY = 0.3;

    this.init = function(scope)
    {
        $scope = scope;

        $scope.$on('dataUpdated', function() {
            lastData = {};
        });
    };

    this.add = function(el, d)
    {
        /*var iconColor = $scope.darker($scope.depthColorModification(d));
        el.attr('fill', iconColor);*/

        d.playText = el.append('text').attr({
            //y: -(d.splitTexts.length*params.l1.textYOffset/2)
            'fill-opacity': 0,
            class: 'play icon',
            id: 'play-'+ d.concept._id,
            //fill:(config.textColor),
            dy: 3.5 / 1000 * $scope.graphHeight
        }).on('click', function(d)
        {
            //console.log(d);
            $location.search('learn', 'yes');
            d3.event.stopPropagation();
        });

        d.playText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE072");

        d.seenText = el.append('text').attr({
            'fill-opacity': 0,
            class: 'seen icon',
            id: 'seen-'+ d.concept._id,
            //fill:(config.textColor),
            dy: 3.5 / 1000 * $scope.graphHeight
        }).on('click', function(d)
        {
            //console.log(d);
            //$location.search('learn', 'yes');
            //d3.event.stopPropagation();
        });

        d.seenText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE105");


        d.learnedText = el.append('text').attr({
            'fill-opacity': 0,
            class: 'learned icon',
            id: 'learned-'+ d.concept._id,
            //fill:(config.textColor),
            dy: function(d) { return d.depth > 2 ? 150 * d.radius : 150 * d.radius; }
        });
        d.learnedText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE013");

        d.goalText = el.append('text').attr({
            'fill-opacity': 0,
            class: 'goal icon',
            id: 'goal-'+ d.concept._id
            //fill:(config.textColor)
        });
        d.goalText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE034");

        this.addDependencyCreator(el, d);
    };

    this.updateDependencyCreator = function(el, d)
    {
        if(!Authentication.isCourseTeachingAssistant($scope.course._id))
            return;

        el.selectAll('.depCreate').remove();

        this.addDependencyCreator(el, d);
    };

    var creatingPathClassName = 'creatingDep';
    this.addDependencyCreator = function(el, d)
    {
        var search = $location.search();
        var adminMode = search && search.mode && search.mode == 'admin';
        if(!Authentication.isCourseTeachingAssistant($scope.course._id) || !adminMode)
            return;

        var scaleFactor = d.radius * 150;
        var scale = $scope.getConfig(d).scale;
        lastData[d.concept._id]['showDepCreate'] = false;

        d.depCreator = el.append('g').attr({
            //y: -(d.splitTexts.length*params.l1.textYOffset/2)
            'fill-opacity': 0.3,
            class: 'depCreate',
            id: 'depCreate-'+ d.concept._id
            //'transform':'translate(70 -70)'
            //fill:(config.textColor)//,
            //dy: 3
        });
        //console.log($scope.visParams.scale(1), $scope.visParams.scale, d.radius, d);
        d.depCreator.append('circle')
            .attr('r', scaleFactor * 0.9)
            .style('fill', d3.rgb('#ffffff'));

        var label = d.depCreator.append('text')
            .classed('dep-create-label', true)
            .style('font-size', scaleFactor * 0.15 + 'px');

        /*d.depCreator.append('path')
            .attr('d', 'm 400,300 -110,-100 0,65 -280,0 0,70 280,0 0,65 z')
            .attr('transform','translate(' + -0.4 * scaleFactor + ' ' + -0.65 * scaleFactor + ') scale(' + 0.00215 * scaleFactor + ')')
            .style('fill', d3.rgb('#ffffff'));*/

        var iconText = "\uF061";
        var firstLine = label
            .append('tspan').attr('x',0).attr('dy', -0.5 * scaleFactor);
        var secondLine = label
            .append('tspan').attr('x',0).attr('dy',  0.2 * scaleFactor).text('Dependency');

        if($scope.creatingDepConcept)
        {
            if(d == $scope.creatingDepConcept)
            {
                // cancel dep
                iconText = "\uF00d";
                firstLine.text('Cancel');
            }
            else
            {
                // end dep here
                iconText = "\uF051";
                firstLine.text('End');
            }
        }
        else
        {
            firstLine.text('Start');
        }

        d.depCreator.append('text').classed('arrow-icon', true)
            .append('tspan').attr({
            //'font-family': 'Glyphicons Halflings'
            'font-family': 'FontAwesome',
            'x': 0,
            'dy': scaleFactor * 0.17
            //'font': 'normal normal normal 14px/1 FontAwesome'
        }).text(iconText).style('font-size', scaleFactor * 0.5 + 'px');

        d.depCreator.on('click', function(d)
        {
            if($scope.creatingDepConcept === null)
            {
                $scope.creatingDepConcept = d;
            }
            else
            {
                if($scope.creatingDepConcept == d)
                {
                    $scope.creatingDepConcept = null;

                    d3.selectAll('.' + creatingPathClassName).remove();
                }
                else if(!ConceptStructure.depExists($scope.creatingDepConcept, d) && ConceptStructure.depIsPossible($scope.creatingDepConcept, d))
                {
                    d3.selectAll('.' + creatingPathClassName).remove();

                    $scope.addDependency($scope.creatingDepConcept.concept._id, d.concept._id, function()
                    {
                        $scope.redrawHover();
                    });
                    $scope.creatingDepConcept = null;
                }
            }

            d3.event.stopPropagation();
        }).on('mouseover', function(d)
        {
            Tip.mouseOverConcept(d);
        });
    };

    this.addToCircleEnter = function(lxCircleEnter)
    {
        lxCircleEnter.each(function(d)
        {
            me.add(d3.select(this), d);
        });
    };

    this.redraw = function()
    {
        var vis = $scope.canvas;
        var lxCircle = vis.selectAll('.lxCircle');
        var l23Circle = vis.selectAll('.l23Circle');

        if(lastData['initTime'] !== $scope.initTime)
        {
            lastData = { initTime: $scope.initTime };
        }
        //console.log('updating icons');

        var search = $location.search();
        var adminMode = search && search.mode && search.mode == 'admin';

        lxCircle.each(function(d)
        {
            // This function takes about 22ms when activateConcept is run.
            // 1ms = classed(), 3ms = attr(),  1ms = isLearned,
            var el = d3.select(this);
            var iconEl = el.select('.icons');
            var conceptId = d.concept._id;
            if(!lastData[conceptId]) lastData[conceptId] = {};

            // If icons are not set up for some reason (eg after creating new concept), set them up now.
            if(!d.goalText)
            {
                me.add(iconEl, d);
            }
            me.updateDependencyCreator(el, d);

            var size = $scope.graphHeight + '-' + d.radius;

            if(!lastData[conceptId] || lastData[conceptId]['size'] !== size)
            {
                lastData[conceptId]['size'] = size;

                iconEl.selectAll('.icon').attr(
                {
                    'dy': 2 * $scope.graphHeight * d.radius / 10
                }).style(
                {
                    'font-size': 4 * $scope.graphHeight * d.radius / 10 + 'px'
                });
            }

            var active = $scope.activeConcept && $scope.activeConcept.concept._id === d.concept._id;
            if(!lastData[conceptId] || lastData[conceptId]['active'] !== active)
            {
                lastData[conceptId]['active'] = active;

                el.classed({ 'active': active });
            }

            var within2Levels = $scope.activeConcept ? Math.abs(d.depth - $scope.activeConcept.depth) < 3 : d.depth < 3;
            var depFontSize = d.depth > 2 ? 8.2 * $scope.graphHeight * d.radius / 10 : 3 * $scope.graphHeight * d.radius / 10;
            var depDy = d.depth > 2 ? 3.8 * $scope.graphHeight * d.radius / 10 : 1.5 * $scope.graphHeight * d.radius / 10;
            var canMakeDepToThis = $scope.creatingDepConcept
                ? $scope.creatingDepConcept == d || (ConceptStructure.depIsPossible($scope.creatingDepConcept, d) && !ConceptStructure.depExists($scope.creatingDepConcept, d))
                : true;
            var showDepCreate = within2Levels && adminMode && canMakeDepToThis;

            //console.log(showDepCreate);

            if(!lastData[conceptId]['showDepCreate'] || lastData[conceptId]['showDepCreate'] !== showDepCreate)
            {
                lastData[conceptId]['showDepCreate'] = showDepCreate;
                //todo switch 'el' to 'iconEl' once $scope.addDependencyCreator has been moved to this file.

                el.select('.depCreate').classed('active', showDepCreate).classed('inactive', !showDepCreate)
                    .transition().attr(
                    {
                        'fill-opacity': showDepCreate ? OPACITY : 0,
                        'dy': depDy
                    }).style({
                        'font-size': depFontSize + 'px'
                    });
            }

            /**
             * This hides concept titles for lower level concepts.
             */
            var opacity = $scope.active.hierarchy.length + 1 >= d.depth
                && (d.parentData && $scope.active.hierarchyIds.indexOf(d.parentData.concept._id) > -1
                || $scope.active.hierarchy.length >= d.depth
                || !$scope.active.hierarchy.length) ? 1 : 0;
            //if(conceptId == '5511e6ff9b4d61b66929eef3') console.log(opacity, $scope.active.hierarchy, $scope.active.hierarchyIds, d.depth);
            if(!lastData[conceptId] || lastData[conceptId]['opacity'] !== opacity)
            {
                lastData[conceptId]['opacity'] = opacity;

                el.select('.concept-title').attr({ 'fill-opacity': function()
                {
                    return opacity;
                } });
            }

            // Icon Priority: Play > Goal > Learned > Seen
            var icons = ['play', 'goal', 'learned', 'seen'];

            if(!adminMode)
            {
                for(var i = 0; i < icons.length; i++)
                {
                    var showThis = me.hasIcon(d, icons[i]);

                    // This takes 10ms.
                    if(showThis)
                    {
                        iconEl.classed('icon-' + icons[i], true);
                        break;
                    }
                    else
                        iconEl.classed('icon-' + icons[i], false);
                }

                var currentIcon = icons[i];

                // 5ms.
                if(!lastData[conceptId]['icon'] || lastData[conceptId]['icon'] !== currentIcon)
                {
                    lastData[conceptId]['icon'] = currentIcon;

                    icons.forEach(function(icon)
                    {
                        if(icon == currentIcon)
                        {
                            d[icon + 'Text'].classed('active', true)
                                .transition().attr({'fill-opacity': OPACITY});
                        }
                        else
                        {
                            d[icon + 'Text'].classed('active', false)
                                .transition().attr({'fill-opacity': 0});
                        }
                    });
                }
            }
            else
            {
                for(var i = 0; i < icons.length; i++)
                {
                    iconEl.classed('icon-' + icons[i], false);
                    d[icons[i] + 'Text'].classed('active', false)
                        .transition().attr({'fill-opacity': 0});
                }
            }

        });
    };

    this.hasIcon = function(d, iconName)
    {
        if(iconName === 'play')
            return this.isActive(d) && this.isPlayable(d);

        if(iconName === 'goal')
            return this.isGoal(d);

        if(iconName === 'learned')
            return $scope.isLearned(d) && (!d.parentData || !$scope.isLearned(d.parentData));

        if(iconName === 'seen')
            return $scope.isSeen(d) && (!d.parentData || !$scope.isSeen(d.parentData));
    };

    this.isActive = function(d)
    {
        return $scope.activeConcept !== null && $scope.activeConcept !== undefined && d.concept._id == $scope.activeConcept.concept._id;
    };

    this.isGoal = function(d)
    {
        return $scope.goalConcept !== null && $scope.goalConcept !== undefined && $scope.goalConcept.concept._id === d.concept._id;
    };

    this.isPlayable = function(d)
    {
        return $scope.segmentPerConceptMap[d.concept._id] && $scope.segmentPerConceptMap[d.concept._id].length;
    };

});
