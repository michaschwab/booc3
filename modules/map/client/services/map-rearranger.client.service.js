angular.module('map').service('MapRearranger', function($timeout, Authentication, $stateParams)
{
    var me = this;
    var isCourseTa;
    var $scope;

    var mouseDownTime = 0;
    var mouseUpTime = 0;
    var mouseDownConceptColor = '';
    var mouseDownConcept = null;
    var dragConceptSuggestionElement = null;

    this.init = function(scope)
    {
        $scope = scope;
        $scope.authentication = Authentication;
    };

    this.setup = function()
    {
        me.setupEventListeners();
    };

    this.onConceptMouseDown = function(d)
    {
        if(!canRearrange()) return;

        mouseDownTime = Date.now();
        var e = d3.event;

        $timeout(function()
        {
            //console.log(mouseUpTime - mouseDownTime, mouseUpTime);
            if(mouseUpTime < mouseDownTime) // if not stopped holding down for half a sec
            {
                console.log('setting up');
                mouseDownConcept = d;
                mouseDownConceptColor = mouseDownConcept.concept.color;
                mouseDownConcept.concept.color = '#999999';

                setupDrag(e);
            }
        }, 500);

        //console.log('mouse over', d);
    };

    function setupDrag(e)
    {
        var event = e || d3.event;
        var dragLayer = $scope.vis.select('#dragLayer');
        var cursor = getCursor(event);

        dragLayer.append('g')
            .attr('class', 'dragConcept')
            .attr('transform', 'translate(' + cursor.x + ',' + cursor.y + ')')
            .append('circle')
            .attr('r', 10)
            .style('fill', mouseDownConceptColor);
    }

    this.onConceptMouseOver = function(d)
    {
        if(!canRearrange()) return;

        if(mouseDownConcept && d.concept._id !== mouseDownConcept.concept._id)
        {
            showDragConcept();
            showDropOption(d.children, this, [d.concept._id]);
        }
    };

    this.onVisMouseOver = function()
    {
        if(!canRearrange()) return;

        if(d3.event.target.id == 'vis' && mouseDownConcept)
        {
            showDragConcept();
            showDropOption($scope.active.topLevelConcepts, this, []);
        }
    };

    function getCursor(evt)
    {
        return getTransformCoordinates(evt.clientX, evt.clientY);
    }

    function getTransformCoordinates(x, y)
    {
        var svg = document.getElementById('vis');
        var vis = document.getElementById('mainCanvas');
        var pt=svg.createSVGPoint();

        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(vis.getScreenCTM().inverse());
    }

    function showDragConcept()
    {
        var cursor = getCursor(d3.event);
        $scope.vis.select('.dragConcept')
            .attr('transform', 'translate(' + cursor.x + ',' + cursor.y + ')');

        dragConceptSuggestionElement = $scope.vis.select('.lxCircle#concept-' + mouseDownConcept.concept._id + ' > circle');
        dragConceptSuggestionElement
            .attr('stroke', 'orange')
            .attr('stroke-width', 4)
            .attr('stroke-dasharray', '5,5');


    }

    var lastElement, lastElementBoundingRect;

    function showDropOption(children, element, newParents)
    {
        var now = Date.now();

        if(mouseDownConcept && mouseDownTime && now - mouseDownTime > 500)
        {
            var translateAbs;

            if(element == lastElement)
            {
                translateAbs = lastElementBoundingRect;
            }
            else
            {
                lastElement = element;
                translateAbs = element.getBoundingClientRect();
                lastElementBoundingRect = translateAbs;
            }

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
            updateVisIfChanged();
        }
    }

    var lastParent, lastOrder;
    function updateVisIfChanged()
    {
        if(!lastParent || !lastOrder || lastParent !== mouseDownConcept.concept.parents || lastOrder !== mouseDownConcept.concept.order)
        {
            lastParent = mouseDownConcept.concept.parents;
            lastOrder = mouseDownConcept.concept.order;

            $scope.concepts.downloadedUpdates.push({});
        }
    }

    this.onConceptMouseUp = function(d)
    {
        if(!canRearrange()) return;
        mouseUpTime = Date.now();

        me.onDragSuccess();
    };

    this.onDragSuccess = function()
    {
        if(!canRearrange()) return;
        // Animate dragging concept to suggested drop concept


        $timeout(function()
        {
            if(!mouseDownConcept) return;

            dragConceptSuggestionElement = $scope.vis.select('.lxCircle#concept-' + mouseDownConcept.concept._id + ' > circle');
            dragConceptSuggestionElement
                .attr('stroke', 'none');
            var targetTopLeft = dragConceptSuggestionElement.node().getBoundingClientRect();
            var targetPosition = { x: targetTopLeft.left + targetTopLeft.width / 2, y: targetTopLeft.top + targetTopLeft.height / 2};
            var targetRelative = getTransformCoordinates(targetPosition.x, targetPosition.y);
            //console.log()

            //$scope.vis.select('.dragConcept').remove();
            var dragConcept = $scope.vis.select('.dragConcept');

            var transitionDuration = 300;
            dragConcept
                .transition().duration(transitionDuration)
                .attr('transform', 'translate(' + targetRelative.x + ',' + targetRelative.y + ')');

            dragConcept.select('circle')
                .transition().duration(transitionDuration)
                .attr('r', dragConceptSuggestionElement.attr('r'));

            $timeout(function()
            {

                mouseDownConcept.concept.color = mouseDownConceptColor;
                $scope.concepts.downloadedUpdates.push({});


                // Finish Drag Activities
                dragConceptSuggestionElement = null;
                mouseDownTime = 0;
                mouseDownConcept = null;

                $timeout(function()
                {
                    $scope.vis.select('.dragConcept').remove();
                }, 100);

            }, transitionDuration);

        }, 100);
    };

    this.onVisMouseUp = function(d)
    {
        if(!canRearrange()) return;

        me.onDragSuccess();
    };

    this.onDocumentMouseUp = function(d)
    {
        if(!canRearrange()) return;
        // mouseDownTime = 0;
        // mouseDownConcept = null;
    };

    function canRearrange()
    {
        return isCourseTa && $stateParams.mode == 'admin';
    }

    this.setupEventListeners = function()
    {
        var courseId = $scope.courseId;
        isCourseTa = $scope.authentication.isCourseTeachingAssistant(courseId);
        if(!isCourseTa) return;

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
