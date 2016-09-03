angular.module('map').service('MapRearranger', function()
{
    var me = this;
    var $scope;

    var mouseDownTime = 0;
    var mouseDownConcept = null;

    this.init = function(scope)
    {
        $scope = scope;
    };

    this.setup = function()
    {
        me.setupEventListeners();
    };

    this.onConceptMouseDown = function(d)
    {
        mouseDownTime = Date.now();
        mouseDownConcept = d;

        setupDrag();

        //console.log('mouse over', d);
    };

    function setupDrag()
    {
        var dragLayer = $scope.vis.select('#dragLayer');

        dragLayer.append('g')
            .attr('class', 'dragConcept')
            .append('circle')
            .attr('r', 10);
    }

    this.onConceptMouseOver = function(d)
    {
        if(mouseDownConcept && d.concept._id !== mouseDownConcept.concept._id)
        {
            showDragConcept();
            showDropOption(d.children, this, [d.concept._id]);
        }
    };

    this.onVisMouseOver = function()
    {
        if(d3.event.target.id == 'vis' && mouseDownConcept)
        {
            showDragConcept();
            showDropOption($scope.active.topLevelConcepts, this, []);
        }
    };

    function getCursor(evt)
    {
        var svg = document.getElementById('vis');
        var vis = document.getElementById('mainCanvas');
        var pt=svg.createSVGPoint();

        pt.x = evt.clientX;
        pt.y = evt.clientY;
        return pt.matrixTransform(vis.getScreenCTM().inverse());
    }

    function showDragConcept()
    {
        var cursor = getCursor(d3.event);
        $scope.vis.select('.dragConcept')
            .attr('transform', 'translate(' + cursor.x + ',' + cursor.y + ')');
    }

    function showDropOption(children, element, newParents)
    {
        var now = Date.now();

        if(mouseDownConcept && mouseDownTime && now - mouseDownTime > 500)
        {
            var translateAbs = element.getBoundingClientRect();

            var center = {};
            center.x = translateAbs.left + translateAbs.width/2;
            center.y = translateAbs.top + translateAbs.height/2;

            var rel = { x: d3.event.pageX - center.x, y: d3.event.pageY - center.y};
            var phi = Math.atan2(rel.y, rel.x);
            phi += Math.PI / 2;
            phi = phi % (2 * Math.PI);
            phi = phi < 0 ? Math.PI * 2 + phi : phi;
            if(phi > 5.8) phi = 0;

            var order = 100;
            var added = false;

            children.forEach(function(child)
            {
                if(child.concept._id == mouseDownConcept.concept._id) {
                    child = mouseDownConcept;
                    return;
                }

                if(!added && child.angle >= phi)
                {
                    // Add the concept at this spot.
                    mouseDownConcept.concept.order = order;
                    $scope.concepts.filter(function(concept)
                    {
                        return concept._id == mouseDownConcept.concept._id;
                    })[0].order = order;

                    order += 100;
                    added = true;

                }
                child.concept.order = order;
                order += 100;
            });
            if(!added)
            {
                mouseDownConcept.concept.order = order;
                $scope.concepts.filter(function(concept)
                {
                    return concept._id == mouseDownConcept.concept._id;
                })[0].order = order;
            }

            mouseDownConcept.concept.parents = newParents;
            $scope.concepts.downloadedUpdates.push({});
        }
    }

    this.onConceptMouseUp = function(d)
    {
        mouseDownTime = 0;
        mouseDownConcept = null;
    };

    this.onVisMouseUp = function(d)
    {

    };

    this.onDocumentMouseUp = function(d)
    {
        mouseDownTime = 0;
        mouseDownConcept = null;
    };


    this.setupEventListeners = function()
    {
        var circles = $scope.vis.selectAll('.lxCircle circle');
        /*circles.call(d3.drag().on('start', function()
        {
            console.log('started');
        }));*/
        circles.on('mousedown.rearranger', this.onConceptMouseDown);
        circles.on('mouseover.rearranger', this.onConceptMouseOver);
        circles.on('mousemove.rearranger', this.onConceptMouseOver);
        circles.on('mouseup.rearranger', this.onConceptMouseUp);

        $scope.vis.on('mouseup.rearranger', this.onVisMouseUp);
        $scope.vis.on('mousemove.rearranger', this.onVisMouseOver);

        document.addEventListener('mouseup', this.onDocumentMouseUp);
    };
});
