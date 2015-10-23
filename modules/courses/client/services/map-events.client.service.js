angular.module('courses').service('MapEvents', function(Tip, $location, Courseevents)
{
    var me = this;
    var $scope;

    var eventLayer;
    var dataReady = false;
    var lineLinear = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    this.init = function(scope, courseId)
    {
        $scope = scope;
        $scope.$on('dataReady', function() { dataReady = true; });
        eventLayer = null;
        //reset dom selection every time this is initiated so its not accessing old dom elements

        $scope.courseevents = Courseevents.query({course: courseId }, function()
        {
            var updateCount = 0;
            $scope.$watchCollection('courseevents.downloadedUpdates', function()
            {
                if($scope.courseevents.downloadedUpdates.length > updateCount)
                {
                    updateCount = $scope.courseevents.downloadedUpdates.length;
                    me.update.call(me);
                }
            });
        });
    };

    this.getData = function()
    {
        var list = [];

        $scope.courseevents.forEach(function(event)
        {
            var before, after;

            var conceptGroupId = 'concept-' + event.concept;
            var conceptGroup = d3.select('#' + conceptGroupId);

            conceptGroup.each(function(d)
            {
                var neighbours = d.parentData ? d.parentData.children : $scope.active.topLevelConcepts;
                var index = neighbours.map(function(c) { return c.concept._id; }).indexOf(d.concept._id);

                if(index !== -1)
                {
                    if(event.when == 'before')
                    {
                        if(index == 0)
                        {
                            index = neighbours.length;
                        }
                        before = neighbours[index - 1];
                        after = d;
                    }
                    else if(event.when == 'after')
                    {
                        if(index == neighbours.length - 1)
                        {
                            index = -1;
                        }
                        before = d;
                        after = neighbours[index + 1];
                    }
                    //console.log(neighbours);

                    var e = {
                        event: event,
                        before: before,
                        after: after
                    };

                    list.push(e);
                }
            });
        });

        return list.length !== $scope.courseevents.length ? false : list;
    };

    this.draw = function(list)
    {
        // Options
        var startLength = 50;
        var endLength = 300;
        var horizontalLength = 350;
        var strokeWidth = 7;

        var event = eventLayer.selectAll('.event').data(list, function(e) { return e.event._id; });
        event.exit().remove();
        var eventEnter = event.enter().append('g').attr({
            'class': 'event',
            'data-event-id': function(d) { return d.event._id; },
            'id': function(d) { return 'event-' + d.event._id; }
        });

        eventEnter.append('path')
            .attr('stroke-width', function() { return strokeWidth; })
            //.attr('marker-end', 'url(#depEnd-active)')
            .attr('fill', 'none');

        event.select('path')
            .attr('d', function(d)
            {
                // Positions of the concepts before and after the event
                var beforePos = $scope.getTranslateAbs(d.before);
                var afterPos = $scope.getTranslateAbs(d.after);

                var startLengthRel = startLength * d.before.radius;
                var endLengthRel = endLength * d.before.radius;
                var horizontalLengthRel = horizontalLength * d.before.radius;

                var middle = {x: (beforePos.x + afterPos.x) / 2, y: (beforePos.y + afterPos.y) / 2 };

                // Connecting vector from concept before to concept after
                var diff = {x: afterPos.x - beforePos.x, y: afterPos.y - beforePos.y };
                var diffLength = Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));

                // Connecting vector, normalized (length 1)
                var diffNormal = {x: diff.x / diffLength, y: diff.y / diffLength };

                // Perpendicular vector to diffNormal, therefore perpendicular to the vector
                // from concept before to after.
                var diffNormalOpp = {x: 1 * diffNormal.y, y: -1 * diffNormal.x };

                //console.log(d.before.depth, d.before.radius);

                // Line is supposed to go through the middle between concept before and after,
                // and be perpendicular to that connection.
                var start = {x: middle.x - diffNormalOpp.x * startLengthRel, y: middle.y - diffNormalOpp.y * startLengthRel };
                var end = {x: middle.x + diffNormalOpp.x * endLengthRel, y: middle.y + diffNormalOpp.y * endLengthRel };

                var horizontalDirection = start.x > end.x ? -1 : 1;
                var endHorizontal = {x: end.x + horizontalDirection * horizontalLengthRel, y: end.y };

                d.textPos = horizontalDirection < 0 ? angular.copy(endHorizontal) : angular.copy(end);
                d.textPos.x += 10;
                d.textPos.y -= 10;

                return lineLinear([start, end, endHorizontal]);
            });

        //<text class="concept-title" fill-opacity="1" style="font-size: 20.8010393581216px;"><tspan dy="6.539294434868166" x="0">Number 3</tspan></text>
        eventEnter.append('text')
            .classed('event-title', true);

        event.select('text.event-title')
            .html(function(d) { return d.event.name; })
            .attr('dy', function(d) { return d.textPos.y; })
            .attr('x', function(d) { return d.textPos.x; });

        Tip.forEvent(eventEnter);
    };

    this.update = function()
    {
        if(!dataReady) return;
        if(!eventLayer)
        {
            eventLayer = d3.select('#eventLayer');
        }

        var list = this.getData();

        if(list !== false)
            this.draw(list);
    };

});
