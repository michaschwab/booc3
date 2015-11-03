angular.module('courses').service('MapArrowShaping', function(Tip, ConceptStructure, $cacheFactory)
{
    var me = this;
    var curveCache;
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;

        curveCache = $cacheFactory('curve');
        $scope.$on('dataUpdated', curveCache.removeAll);
    };

    this.curvePath = function(pathNode, pos, coveredConcepts, scale, getTranslateAbs, shortenStart, shortenEnd, offsetEach, color, dep, graphWidth, graphHeight)
    {
        if(!shortenStart) shortenStart = 0;
        if(!shortenEnd) shortenEnd = 0;

        var length = 0;
        var lines = [];
        if(!dep) dep = null;

        if(coveredConcepts)
        {
            var cacheId = graphWidth + '-' + graphHeight + '-' + offsetEach + '-' +
                coveredConcepts.reduce(function(total, coveredConcept)
            {
                var newPart = coveredConcept.concept._id.substr(coveredConcept.concept._id.length - 5);

                return total + newPart;
            }, '');

            var cacheVal = curveCache.get(cacheId);

            if(cacheVal)
            {
                return cacheVal;
            }
        }

        var filterConnectionBetweenSameConceptsFct = function(current, previous)
        {
            return function(c)
            {
                return c.to.concept._id === current.concept._id && c.from.concept._id === previous.concept._id;
            };
        };
        var filterSameColorFct = function(current, previous, color)
        {
            return function(c)
            {
                return c.to.concept._id === current.concept._id && c.from.concept._id === previous.concept._id && c.color === color;
            };
        };

        for(var i = 1; i < pos.length; i++)
        {
            var previousPos = pos[i-1];
            var currentPos = pos[i];
            var addedLength = Math.sqrt(Math.pow(previousPos.x - currentPos.x, 2) + Math.pow(previousPos.y - currentPos.y, 2));

            if(coveredConcepts)
            {
                var previous = coveredConcepts[i-1];
                var current = coveredConcepts[i];

                var sameConnectionsAlready = color ? connections.filter(filterSameColorFct(current, previous, color)) : [];
                var index = 0;

                if(sameConnectionsAlready.length > 0)
                {
                    index = sameConnectionsAlready[0].index;
                }
                else
                {
                    index = connections.filter(filterConnectionBetweenSameConceptsFct(current, previous)).length;
                }

                var width = 22 / Math.pow(2.7, current.depth);
                var length1 = length + scale(previous.radius) + width * shortenStart;
                var length2 = length + addedLength - scale(current.radius) - width * shortenEnd;

                var previousParentIds = previous.parentChain ? previous.parentChain.map(function(c) { return c.concept._id; }) : [];
                var currentParentIds = current.parentChain ? current.parentChain.map(function(c) { return c.concept._id; }) : [];
                var commonParent = null;

                var center = {x: 0, y: 0};

                for(var j = 0; j < previousParentIds.length; j++)
                {
                    if(currentParentIds.indexOf(previousParentIds[j]) !== -1)
                    {
                        commonParent = previous.parentChain[j];
                        break;
                    }
                }
                if(commonParent !== null)
                {
                    center = getTranslateAbs(commonParent);
                }
            }
            else
            {
                center = {x: $scope.graphWidth / 2, y: $scope.graphHeight / 2};
            }

            //var closest = $scope.closestPoint(pathNode, currentPos, length);
            //addedLength = closest.pathLength - length;


            var start = pathNode.getPointAtLength(length1);
            start = {x: start.x, y: start.y};

            var end = pathNode.getPointAtLength(length2);
            end = {x: end.x, y: end.y};

            // Correct start and end position so it does not overlap with any of the child concepts.

            var difference = {x: end.x - start.x, y: end.y - start.y};
            var differenceLength = Math.sqrt(Math.pow(difference.x, 2) + Math.pow(difference.y, 2));

            var middle = {x: start.x + difference.x/2, y: start.y + difference.y / 2};
            var normal = {x: middle.x - center.x, y: middle.y - center.y};

            var normalLength = Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2));
            var normalNormalized = {x: normal.x / normalLength, y: normal.y / normalLength};
            var curvature = differenceLength / 10;

            var middleCurved = {x: middle.x + curvature * normalNormalized.x, y: middle.y + curvature * normalNormalized.y};

            offsetEach = offsetEach ? offsetEach : 0;
            var offsetVal = index * offsetEach;

            this.offsetCirclePoint(start, offsetVal, previous, pos[i-1], scale, pathNode, length);


            this.offsetCirclePoint(end, offsetVal, current, pos[i], scale, pathNode, length + addedLength, true);
            this.offsetPoint(middleCurved, offsetVal, normalNormalized);

            start = this.correctPathPosition(previous, start, end, scale, getTranslateAbs);
            end = this.correctPathPosition(current, end, start, scale, getTranslateAbs);

            var line =
            {
                start: start,
                curvePoint: middleCurved,
                end: end,
                width: width,
                from: previous,
                to: current,
                color: color,
                index: index,
                dep: dep
            };

            lines.push(line);
            connections.push(line);
            length += addedLength;
        }

        if(coveredConcepts)
        {
            curveCache.put(cacheId, lines);
        }
        return lines;
    };

    var connections = [];

    this.clearOffsets = function()
    {
        connections = [];
    };

    this.correctPathPosition = function(concept, start, end, scale, getTranslateAbs)
    {
        start = angular.copy(start);
        end = angular.copy(end);
        var conceptPos = getTranslateAbs(concept);

        if(concept.depth > 1 && concept.children.length > 0 && $scope.getConfig(concept.children[0]).position(1) > 0.9)
        {
            //console.log($scope.getConfig(concept.children[0]).position(1));

            var direction = {
                x: end.x - conceptPos.x,
                y: end.y - conceptPos.y
            };

            var angle = Math.atan2(direction.x, direction.y);

            var badAngles = [];
            concept.children.forEach(function(child)
            {
                //console.log(i, child.x, child.y);
                badAngles.push(Math.atan2(child.x, child.y))
            });
            badAngles.push(-1 * badAngles[0]); // The first one is set to be on both "ends" of the circles

            //console.log(badAngles);
            badAngles = badAngles.sort(function(a, b)
            {
                return Math.abs(a - angle) - Math.abs(b - angle);
            });

            if(Math.abs(badAngles[0] - angle) < 0.1)
            {
                /*newAngle = badAngles[0];
                 var transAbs = $scope.getTranslateAbs(concept);
                 var radius = $scope.visParams.l1.scale(concept.radius) + $scope.visParams.l1.scale(concept.children[0].radius);
                 start.x = transAbs.x + Math.sin(newAngle) * radius;
                 start.y = transAbs.y + Math.cos(newAngle) * radius;*/

                // start outside the child so it doesnt overlap
                //var transAbs = getTranslateAbs(concept);
                //var radius = $scope.visParams.l1.scale(concept.radius) + $scope.visParams.l1.scale(concept.children[0].radius);
                var radius = scale(concept.children[0].radius);
                /*start.x = transAbs.x + Math.sin(angle) * radius;
                 start.y = transAbs.y + Math.cos(angle) * radius;*/
                start.x = start.x + Math.sin(angle) * radius;
                start.y = start.y + Math.cos(angle) * radius;
            }
        }

        return start;
    };

    this.offsetCirclePoint = function(point, offset, concept, circleCenter, scale, pathNode, lengthStart, subtract)
    {
        var r = scale(concept.radius);
        subtract = subtract ? true : false;
        var sign = subtract ? -1 : 1;

        var rProjected = offset < r ? Math.sqrt(Math.pow(r, 2) - Math.pow(offset, 2)) : r / 10;
        var pathPos = lengthStart + sign * rProjected;// + width * shortenStart;
        //console.log(pathPos, r, offset, rProjected);
        var pointProjected = new Point(pathNode.getPointAtLength(pathPos));
        var point2 = new Point(pathNode.getPointAtLength(pathPos+0.01));

        var diff = pointProjected.subtract(point2);
        var normalNormalized = new Point(-1 * diff.y, diff.x).getNormalized();

        point.x = pointProjected.x + normalNormalized.x * offset;
        point.y = pointProjected.y + normalNormalized.y * offset;

    };

    this.offsetPoint = function(point, offset, normalNormalized)
    {
        point.x += normalNormalized.x * offset;
        point.y += normalNormalized.y * offset;

        return point;
    };
});

function Point(x, y)
{
    if(typeof x == 'object' && y === undefined)
    {
        this.x = x.x;
        this.y = x.y;
        y = this.y;
        x = this.x;
    }
    else
    {
        this.x = x;
        this.y = y;
    }

    this.add = function(point)
    {
        return new Point(x + point.x, y + point.y);
    };
    this.subtract = function(point)
    {
        return new Point(x - point.x, y - point.y);
    };
    this.getLength = function()
    {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    };
    this.getNormalized = function()
    {
        var length = this.getLength();
        return new Point(x / length, y / length);
    };
}
