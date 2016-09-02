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

        //console.log('mouse over', d);
    };

    this.onConceptMouseOver = function(d)
    {
        //console.log(d, arguments);
        var now = Date.now();
        if(mouseDownConcept && mouseDownTime && now - mouseDownTime > 500 && d.concept._id !== mouseDownConcept.concept._id)
        {
            //console.log('dragging ', mouseDownConcept.concept.title, ' over ', d.concept.title);
            //console.log(d.children);

            var translateAbs = this.getBoundingClientRect();
            var center = {};
            center.x = translateAbs.left + translateAbs.width/2;
            center.y = translateAbs.top + translateAbs.height/2;

            var rel = { x: d3.event.pageX - center.x, y: d3.event.pageY - center.y};
            var phi = Math.atan2(rel.y, rel.x);
            phi += Math.PI / 2;
            phi = phi % (2 * Math.PI);
            phi = phi < 0 ? Math.PI * 2 + phi : phi;
            if(phi > 5.8) phi = 0; // In order to be able to drag to the first one, you can drag before the first one.
            //console.log(phi);
            var order = 100;
            var added = false;

            d.children.forEach(function(child)
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

            /*console.log(d.children.map(function(child)
            {
                return child.concept.order + ',' + child.angle + ',' + child.concept.title;
            }), phi);*/

            mouseDownConcept.concept.parents = [d.concept._id];
            $scope.concepts.downloadedUpdates.push({});
            //$scope.$broadcast('dataUpdated');
        }
        //console.log('dragging ', mouseDownConcept.concept.title, ' over ', d.concept.title);
    };

    this.onConceptMouseUp = function(d)
    {
        mouseDownTime = 0;
        mouseDownConcept = null;
    };

    this.onDocumentMouseUp = function(d)
    {

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

        document.addEventListener('mouseup', this.onDocumentMouseUp);
    };
});
