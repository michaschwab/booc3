angular.module('courses').service('MapSquares', function(Tip, $location, $timeout, Logger, FontAwesome, $state)
{
    var me = this;
    var $scope;
    var layer, mainLayer, subLayer, squareMap;
    var activeGroupId, topLevelSquaresData, groupSquaresData, squaresPerConcept, squaresPerGroup;

    this.init = function(scope)
    {
        $scope = scope;

        layer = mainLayer = subLayer = squareMap = null;

        activeGroupId = null;

        topLevelSquaresData = [];
        groupSquaresData = [];

        squaresPerConcept = {};
        squaresPerGroup = {};
    };

    this.createLayout = function()
    {
        layer = d3.select('#squareLayer');

        if(!subLayer)
        {
            subLayer = layer.append('g').attr("id", "subLayer");
            mainLayer = layer.append('g').attr("id", "mainSquareLayer");
        }
    };

    this.setup = function()
    {

    };

    var setSegmentSquareProps = function(square, segment)
    {
        var source = $scope.sourceMap[segment.source];
        if(!source)
        {
            console.error('could not find the source of the following segment: ', segment, 'the map of sources is ', $scope.sourceMap);
            return;
        }
        var sourcetype = $scope.sourcetypeMap[source.type];
        square.icon = sourcetype.icon;

        square.source = source;
        square.sourcetype = sourcetype;
    };

    this.generateSquares = function()
    {
        //console.count('generating squares');
        var conceptsWithContent = $scope.concepts.filter(function(concept)
        {
            return $scope.segmentAndGroupPerConceptMap[concept._id] && $scope.segmentAndGroupPerConceptMap[concept._id].length;
        });

        conceptsWithContent.forEach(function(concept)
        {
            var conceptId = concept._id;

            var segments = $scope.segmentAndGroupPerConceptMap[conceptId];

            segments.forEach(function(segment)
            {
                var square = {};

                square.concept = $scope.directories.concepts[conceptId];
                square.conceptId = conceptId;
                square.title = segment.title;
                square.segment = segment;

                if(!segment.isGroup)
                {
                    setSegmentSquareProps(square, segment);
                    square.isSegment = true;
                }
                else
                {
                    square.icon = 'fa fa-folder';
                    square.isGroup = true;
                }

                topLevelSquaresData.push(square);
            });

            /*var commentsSquare = {};
             commentsSquare.concept = $scope.directories.concepts[conceptId];
             commentsSquare.conceptId = conceptId;
             commentsSquare.title = 'Comments';
             commentsSquare.icon = 'fa fa-comments';

             data.push(commentsSquare);*/
        });

        for(var groupId in $scope.segmentPerGroupMap)
        {
            if($scope.segmentPerGroupMap.hasOwnProperty(groupId))
            {
                $scope.segmentPerGroupMap[groupId].forEach(function(segment)
                {
                    var square = {};

                    square.isGroupChild = true;
                    square.groupId = groupId;
                    square.group = $scope.segmentgroupMap[groupId];
                    square.conceptId = square.group.concept;
                    square.concept = $scope.directories.concepts[square.conceptId];

                    square.title = segment.title;
                    square.segment = segment;

                    setSegmentSquareProps(square, segment);

                    groupSquaresData.push(square);
                });
            }
        }

        squaresPerConcept = {};
        squareMap = {};
        squaresPerGroup = {};

        topLevelSquaresData.forEach(function(square)
        {
            if(!squaresPerConcept[square.conceptId])
            {
                squaresPerConcept[square.conceptId] = [];
            }
            squaresPerConcept[square.conceptId].push(square);
            if(square.segment && square.segment._id) squareMap[square.segment._id] = square;
        });

        groupSquaresData.forEach(function(square)
        {
            if(!squaresPerGroup[square.groupId])
            {
                squaresPerGroup[square.groupId] = [];
            }
            squaresPerGroup[square.groupId].push(square);
            if(square.segment && square.segment._id) squareMap[square.segment._id] = square;
        });
    };

    this.squaresEnter = function(squares)
    {
        var squareEnter = squares.enter()
            .append('g')
            .classed('square', true)
            .attr({
                'transform': function(s)
                {
                    var conceptTrans = $scope.getTranslateAbs(s.concept);
                    return 'translate(' + conceptTrans.x + ',' + conceptTrans.y + ')';
                }
            })
            .on('click', function(s)
            {
                var params;

                if(s.title == 'Comments')
                {
                    params = {
                        courseId: $scope.courseId,
                        conceptId: s.conceptId
                    };

                    $state.go('conceptComments', params);
                }
                else if(s.isGroup)
                {
                    activeGroupId = activeGroupId == s.segment._id ? null : s.segment._id;
                    s.segment.collapsed = activeGroupId != s.segment._id;

                    me.update();
                }
                else
                {
                    params = {
                        courseId: $scope.courseId,
                        learn: 'yes',
                        active: s.conceptId,
                        segment: s.segment._id
                    };

                    $state.go('courses.view', params);
                }


            })
            .on('mouseover', function(s)
            {
                $scope.hoverSegment(s.segment);
                $scope.hoverConcept(s.concept);
            })
            .on('mouseleave', function()
            {
                $scope.hoverSegment();
            });

        squareEnter.append('rect').classed('background', true);

        squareEnter.each(function(square)
        {
            var el = d3.select(this);

            //var width = $scope.visParams.scale(square.concept.radius * 1.5);
            var size = $scope.visParams.scale(square.concept.radius);

            var manualIcons = {
                'lecture-icon': '/modules/learning/img/lecture.svg',
                'customicon icon-extensionschool': '/modules/contents/img/harvardextensionschool.svg',
                'customicon icon-lti': '/modules/contents/img/lti.png'
            };

            if(Object.keys(manualIcons).indexOf(square.icon) !== -1)
            {
                var path = manualIcons[square.icon];

                el.append('image')
                    .classed('icon-image', true)
                    .attr('xlink:href', path);
            }
            else if(square.icon.substr(0,'fa fa-'.length) == 'fa fa-')
            {
                el.append('text')
                    .classed('icon-fa-text', true)
                    .classed('icon-fa', true)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-family', 'FontAwesome')

                    .text(FontAwesome.getCharacter(square.icon));
            }
            else
            {
                console.log('dont know how to embed this icon in svg:' + square.icon);
            }
        });

        return squareEnter;
    };

    this.squaresUpdate = function(squares)
    {
        subLayer.classed('has-active-group', activeGroupId);
        subLayer.classed('has-no-active-group', !activeGroupId);

        squares.each(function(s)
        {
            var el = d3.select(this);
            var activeConcept = $scope.activeConcept && $scope.activeConcept.concept._id == s.conceptId;
            var isActiveGroup = s.group ? activeGroupId == s.group._id : false;
            var selected = $scope.active.hoverSegment ? $scope.active.hoverSegment == s.segment : s.segment == $scope.active.segment;

            var size = $scope.visParams.scale(s.concept.radius);

            el.classed('active', activeConcept);
            el.classed('selected', selected);

            var width = $scope.visParams.scale(s.concept.radius * 1.1);
            var neighbourSquares;

            if(s.isGroupChild)
            {
                neighbourSquares = squaresPerGroup[s.groupId];
            }
            else
            {
                neighbourSquares = squaresPerConcept[s.conceptId];
            }

            var index = neighbourSquares.indexOf(s);
            var percentIndex = index / (neighbourSquares.length);
            var angleCoverage = !s.isGroupChild ? 0.5 : 0.2;

            var x = 0, y = 0;

            if(activeConcept && (!s.isGroupChild || isActiveGroup))
            {
                // Only move out of center if this square is either directly assigned to a concept and the concept is
                // active, or if this is a material group square and the material group was activated before.

                var conceptIndex = -1 * s.concept.parentData.children.indexOf(s.concept) / s.concept.parentData.children.length;
                var startAngle = Math.PI * 0.4 + 1.8 * Math.PI * conceptIndex;
                //var startAngle = Math.PI;

                var distanceFromCenter = 1.8;

                /*if(s.isGroup && s.segment._id == activeGroupId)
                {
                    distanceFromCenter = 3;
                }
                else */
                if(s.isGroupChild)
                {
                    startAngle -= Math.PI * 0.2;
                    distanceFromCenter = 3;
                }

                var distanceFromCenterAbs = $scope.visParams.scale(distanceFromCenter * s.concept.radius);
                var angle = startAngle - percentIndex * 2 * Math.PI * angleCoverage; // they should go around most of concept (90% of 360 degrees).

                x = Math.sin(angle) * distanceFromCenterAbs;
                y = Math.cos(angle) * distanceFromCenterAbs;
            }
            s.lastX = s.x;
            s.lastY = s.y;
            s.x = x;
            s.y = y;

            var conceptTrans = $scope.getTranslateAbs(s.concept);
            var center;

            if(s.isGroup)
            {
                var newIcon = activeGroupId == s.segment._id ? 'fa fa-folder-open' : 'fa fa-folder';
                //square.icon = 'fa fa-folder';
                if(s.icon !== newIcon)
                {
                    s.icon = newIcon;
                    el.select('.icon-fa').text(FontAwesome.getCharacter(s.icon));
                }
            }

            if(s.isGroupChild)
            {
                // Arrange around material group
                center = conceptTrans;

                //console.log(squareMap[s.groupId]);
                /*center.x += squareMap[s.groupId].x;
                center.y += squareMap[s.groupId].y;*/
            }
            else
            {
                // Arrange around concept
                center = conceptTrans;
            }
            //center.x += .095;
            //center.y += .009;

            var squareRect = el.select('rect.background')
                .attr('height', width)
                .attr('width', width)
                .attr('x', width / -2)
                .attr('y', width / -2)
                .attr('rx', width/4)
                .attr('ry', width/4)
                .attr('fill', $scope.depthColorModification(s.concept));

            var delay = 0;

            if(x != 0 || y != 0)
            {
                var animationIndex = neighbourSquares.filter(function(s)
                {
                    return s.lastX !== s.x || s.lastY !== s.y;
                }).indexOf(s);
                delay = animationIndex * 150;

                el.transition().attr({
                    'transform': 'translate(' + Math.round(center.x) + ',' + Math.round(center.y) + ')'
                });
            }

            el.transition().delay(delay).attr({
                'transform': 'translate(' + Math.round(center.x + x) + ',' + Math.round(center.y + y) + ')'
            });


            //var delay = x == 0 && y == 0 ? 0 : index * 500;
            //todo this index should only be the index within the elements that are actually moving.
            /*if(delay)
            {
                el.transition().attr({
                    'transform': 'translate(' + Math.round(center.x) + ',' + Math.round(center.y) + ')'
                });
            }*/

            el.transition().delay(delay).attr({
                'transform': 'translate(' + Math.round(center.x + x) + ',' + Math.round(center.y + y) + ')'
            });

            var iconSize = size * 0.7;

            el.select('.icon-fa-text')
                .attr('font-size', iconSize + 'px');

            el.select('.icon-image')
                .attr('width', iconSize)
                .attr('height', iconSize)
                .attr('x', iconSize / -2)
                .attr('y', iconSize / -2);
        });
    };

    this.update = function()
    {
        if(!topLevelSquaresData.length)
        {
            this.generateSquares();
        }
        //console.count('updating');

        if(topLevelSquaresData.length)
        {
            var squares = mainLayer.selectAll('.square').data(topLevelSquaresData);
            this.squaresEnter(squares);
            this.squaresUpdate(squares);
        }

        if(groupSquaresData.length)
        {
            var groupSquares = subLayer.selectAll('.square').data(groupSquaresData);
            this.squaresEnter(groupSquares);
            this.squaresUpdate(groupSquares);
        }
    };

    this.setFontSize = function(d, el, lastUpdate)
    {

    };

    this.redraw = function()
    {
        this.setup();
        this.update();
    };




    this.updateActive = function()
    {

    };

});
