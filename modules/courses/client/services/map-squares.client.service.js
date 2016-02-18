angular.module('courses').service('MapSquares', function(Tip, $location, $timeout, Logger, FontAwesome)
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
            });

        squareEnter.append('rect');

        squareEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '5px')
            .text(function(s)
            {
                return FontAwesome.getCharacter(s.icon);
            });

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
