angular.module('courses').service('MapIcons', function(Tip, ConceptStructure, $location)
{
    var me = this;
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;
    };

    this.add = function(el, d)
    {
        var config = $scope.getConfig(d);

        d.playText = el.append('text').attr({
            //y: -(d.splitTexts.length*params.l1.textYOffset/2)
            'fill-opacity': 0,
            class: 'play icon',
            id: 'play-'+ d.concept._id,
            fill:(config.textColor),
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
            fill:(config.textColor),
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
            fill:(config.textColor),
            dy: function(d) { return d.depth > 2 ? 150 * d.radius : 150 * d.radius; }
        });
        d.learnedText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE013");

        d.goalText = el.append('text').attr({
            //y: -(d.splitTexts.length*params.l1.textYOffset/2)
            'fill-opacity':function(d){
                //if(d === undefined || !$scope.goalConcept) { console.log(d, $scope.goalConcept); }
                return !$scope.goalConcept || $scope.goalConcept.concept._id !== d.concept._id === -1 ? 0 : 0.7;
            },
            class: 'goal icon',
            id: 'goal-'+ d.concept._id,
            fill:(config.textColor)//,
            //dy: function(d) { return d.depth > 2 ? -1 / 1000 * $scope.graphHeight : 10 * $scope.graphHeight / 1000; }
        });
        d.goalText.append('tspan').attr({
            'font-family': 'Glyphicons Halflings'
        }).text("\uE034");

        /*el.append('g').attr({
         class: 'path'
         });*/
    };

    this.addToCircleEnter = function(lxCircleEnter)
    {
        lxCircleEnter.each(function(d)
        {
            me.add(d3.select(this), d);
        });
    };

    var lastData = {};

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
            var el = d3.select(this);
            var conceptId = d.concept._id;
            if(!lastData[conceptId]) lastData[conceptId] = {};

            // If icons are not set up for some reason (eg after creating new concept), set them up now.
            if(!d.goalText)
            {
                me.add(el, d);
            }

            var size = $scope.graphHeight + '-' + d.radius;

            if(!lastData[conceptId] || lastData[conceptId]['size'] !== size)
            {
                lastData[conceptId]['size'] = size;

                el.selectAll('.icon').attr(
                {
                    'dy': 2 * $scope.graphHeight * d.radius / 10
                }).style(
                {
                    'font-size': 4 * $scope.graphHeight * d.radius / 10 + 'px'
                });
            }

            var active = $scope.activeConcept !== null && $scope.activeConcept.concept._id === d.concept._id;
            if(!lastData[conceptId] || lastData[conceptId]['active'] !== active)
            {
                lastData[conceptId]['active'] = active;

                el.classed({ 'active': active });
            }

            var within2Levels = $scope.activeConcept ? Math.abs(d.depth - $scope.activeConcept.depth) < 3 : d.depth < 3;
            var depFontSize = d.depth > 2 ? 8.2 * $scope.graphHeight * d.radius / 10 : 3 * $scope.graphHeight * d.radius / 10;
            var depDy = d.depth > 2 ? 3.8 * $scope.graphHeight * d.radius / 10 : 1.5 * $scope.graphHeight * d.radius / 10;

            el.select('.depCreate').classed('active', within2Levels && adminMode)
                .transition().attr(
                {
                    'fill-opacity': within2Levels && adminMode ? 0.7 : 0,
                    'dy': depDy
                }).style({
                    'font-size': depFontSize + 'px'
                });

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

            for(var i = 0; i < icons.length; i++)
            {
                var showThis = me.hasIcon(d, icons[i]);
                if(showThis)
                {
                    el.classed('icon-' + icons[i], true);
                    break;
                }
                else
                    el.classed('icon-' + icons[i], false);
            }

            var currentIcon = icons[i];

            if(!lastData[conceptId] || lastData[conceptId]['icon'] !== currentIcon)
            {
                lastData[conceptId]['icon'] = currentIcon;

                icons.forEach(function(icon)
                {
                    if(icon == currentIcon)
                    {
                        d[icon + 'Text'].classed('active', true)
                            .transition().attr({'fill-opacity': 0.7});
                    }
                    else
                    {
                        d[icon + 'Text'].classed('active', false)
                            .transition().attr({'fill-opacity': 0});
                    }
                });
            }
        });
    };

    this.hasIcon = function(d, iconName)
    {
        if(iconName === 'play')
            return this.isPlayable(d);

        if(iconName === 'goal')
            return this.isGoal(d);

        if(iconName === 'learned')
            return $scope.active.learnedConceptIds.indexOf(d.concept._id) !== -1;

        if(iconName === 'seen')
            return ($scope.seenMapByConcept && $scope.seenMapByConcept[d.concept._id]);
    };

    this.isActive = function(d)
    {
        return $scope.activeConcept && d.concept._id == $scope.activeConcept.concept._id;
    };

    this.isGoal = function(d)
    {
        return $scope.goalConcept && $scope.goalConcept.concept._id === d.concept._id;
    };

    this.isPlayable = function(d)
    {
        if(!$scope.segmentPerConceptMap) return false;

        return $scope.activeConcept !== null
            && d.concept._id === $scope.activeConcept.concept._id
            && $scope.segmentPerConceptMap[d.concept._id] && $scope.segmentPerConceptMap[d.concept._id].length
            && ($scope.learnMode === false || $scope.activeConcept.concept._id !== d.concept._id);
    };

});
