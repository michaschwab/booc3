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

    this.update = function()
    {
        var data = [];

        var conceptsWithContent = $scope.concepts.filter(function(concept)
        {
            return $scope.segmentPerConceptMap[concept._id] && $scope.segmentPerConceptMap[concept._id].length;
        });

        conceptsWithContent.forEach(function(concept)
        {
            var conceptId = concept._id;

            var segments = $scope.segmentPerConceptMap[conceptId];

            segments.forEach(function(segment)
            {
                var square = {};

                var source = $scope.sourceMap[segment.source];
                var sourcetype = $scope.sourcetypeMap[source.type];
                square.icon = sourcetype.icon;

                square.title = segment.title;
                square.concept = $scope.directories.concepts[conceptId];
                square.conceptId = conceptId;
                square.segment = segment;
                square.source = source;
                square.sourcetype = sourcetype;

                data.push(square);
            });
        });

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
                /*
                 courses.view', {
                 url: '/:courseId?learn&goal&active&mode&source&segment',
                 */

                var params = {
                    courseId: $scope.courseId,
                    learn: 'yes',
                    active: s.conceptId,
                    segment: s.segment._id
                };

                $state.go('courses.view', params);
            });

        squareEnter.append('rect');

        squareEnter.each(function(square)
        {
            var el = d3.select(this);

            //var width = $scope.visParams.scale(square.concept.radius * 1.5);
            var size = 300  * square.concept.radius;

            var manualIcons = {
                'lecture-icon': '/modules/learning/img/lecture.svg',
                'customicon icon-extensionschool': '/modules/contents/img/harvardextensionschool.svg',
                'customicon icon-lti': '/modules/contents/img/lti.png'
            };

            if(Object.keys(manualIcons).indexOf(square.icon) !== -1)
            {
                var path = manualIcons[square.icon];

                el.append('image')
                    .attr('width', size)
                    .attr('height', size)
                    .attr('x', size / -2)
                    .attr('y', size / -2)
                    .attr('xlink:href', path);
            }
            else if(square.icon.substr(0,'fa fa-'.length) == 'fa fa-')
            {
                el.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-family', 'FontAwesome')
                    .attr('font-size', size + 'px')
                    .text(FontAwesome.getCharacter(square.icon));
            }
            else
            {
                console.log('dont know how to embed this icon in svg:' + square.icon);
            }
        });


        //http://localhost:3000/modules/contents/img/harvardextensionschool.svg
        //<image x="10" y="20" width="80" height="80" xlink:href="recursion.svg" />

        squares.each(function(s)
        {
            var el = d3.select(this);
            var active = $scope.activeConcept && $scope.activeConcept.concept._id == s.conceptId;

            el.classed('active', active);

            var width = $scope.visParams.scale(s.concept.radius * 1.5);
            var perConcept = squaresPerConcept[s.conceptId];
            var index = perConcept.indexOf(s);
            var percentIndex = index / (perConcept.length);
            var angle = Math.PI + percentIndex * 2 * Math.PI; // they should go around most of concept (90% of 360 degrees).

            var distanceFromCenter = $scope.visParams.scale(2 * s.concept.radius);

            var x = 0, y = 0;

            if(active)
            {
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
