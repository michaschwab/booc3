angular.module('courses').service('MapSquares', function(Tip, $location, $timeout, Logger, FontAwesome, $state)
{
    var me = this;
    var $scope;
    var layer;

    this.init = function(scope)
    {
        $scope = scope;

    };

    this.createLayout = function()
    {
        layer = d3.select('#squareLayer');
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

    this.update = function()
    {
        var data = [];

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

                data.push(square);
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

                    setSegmentSquareProps(square, segment);

                    //data.push(square);
                });
            }
        }

        var squaresPerConcept = {};
        data.forEach(function(square)
        {
            if(!squaresPerConcept[square.conceptId])
            {
                squaresPerConcept[square.conceptId] = [];
            }
            squaresPerConcept[square.conceptId].push(square);
        });


        var squares = layer.selectAll('.square').data(data);
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

        squareEnter.append('rect');

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

        squares.each(function(s)
        {
            var el = d3.select(this);
            var active = $scope.activeConcept && $scope.activeConcept.concept._id == s.conceptId;
            var selected = $scope.active.hoverSegment ? $scope.active.hoverSegment == s.segment : s.segment == $scope.active.segment;

            var size = $scope.visParams.scale(s.concept.radius);

            el.classed('active', active);
            el.classed('selected', selected);

            var width = $scope.visParams.scale(s.concept.radius * 1.5);
            var perConcept = squaresPerConcept[s.conceptId];
            var index = perConcept.indexOf(s);
            var percentIndex = index / (perConcept.length);

            var angleCoverage = 1; //80 / 100;

            var x = 0, y = 0;

            if(active)
            {
                //var conceptIndex = -1 * s.concept.parentData.children.indexOf(s.concept) / s.concept.parentData.children.length;
                //var startAngle = Math.PI * 0.55 + 1.8 * Math.PI * conceptIndex;
                var startAngle = Math.PI;

                var distanceFromCenter = $scope.visParams.scale(2 * s.concept.radius);
                var angle = startAngle - percentIndex * 2 * Math.PI * angleCoverage; // they should go around most of concept (90% of 360 degrees).

                x = Math.sin(angle) * distanceFromCenter;
                y = Math.cos(angle) * distanceFromCenter;
            }

            var conceptTrans = $scope.getTranslateAbs(s.concept);

            var squareRect = el.select('rect')
                .attr('height', width)
                .attr('width', width)
                .attr('x', width / -2)
                .attr('y', width / -2)
                .attr('rx', width/4)
                .attr('ry', width/4)
                .attr('fill', $scope.depthColorModification(s.concept));

            el.transition().attr({
                'transform': 'translate(' + Math.round(conceptTrans.x + x) + ',' + Math.round(conceptTrans.y + y) + ')'
            });

            el.select('.icon-fa-text')
                .attr('font-size', size + 'px');

            el.select('.icon-image')
                .attr('width', size)
                .attr('height', size)
                .attr('x', size / -2)
                .attr('y', size / -2);
        });

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
