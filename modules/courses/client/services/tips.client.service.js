'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').service('Tip',
function($timeout, ConceptStructure, Authentication)
{
    var me = this;
    var vis = d3.select("#vis");
    var $scope = null;
    var hideTimeout = null;
    var hidden = true;
    var openTip = null;

    var squareTip = d3.tip()
        .attr('class', 'd3-tip')
        //.attr('id', function(s) { return 'd3-tip-' + s.conceptId + '-' + s.segmentId })
        .html(function(s)
        {
            return s.title;
        });


    var conceptTip = d3.tip()
        .attr('class', 'd3-tip')
        //.offset([-6, 0])
        .direction(function(d)
        {
            var parentChildren = d.parentData ? d.parentData.children : $scope.active.topLevelConcepts;
            var parentChildrenIds = parentChildren.map(function(child) { return child.concept._id; });
            var index = parentChildrenIds.indexOf(d.concept._id);
            var portion = index / parentChildren.length;

            // Now, check if all the way at top or bottom of map

            var x = d.x, y = d.y;
            var parent = d.parentData;
            while(parent) { x *= parent.x; y *= parent.y; parent = parent.parentData;}

            if(Math.abs(y) > 0.8)
                return y > 0 ? 'n' : 's';

            // Otherwise, do it naturally.

            if(portion <= 0.13 || portion >= 0.88)
            {
                return 'n';
            }
            if(portion > 0.13 && portion <= 0.38)
            {
                return 'e';
            }
            if(portion > 0.38 && portion <= 0.63)
            {
                return 's';
            }
            return 'w';
        })
        .html(function(d) {
            //return d.tip;
            return d.depth >= $scope.zoomLevel + 2 ? d.concept.title : '';
        });

    var eventTip = d3.tip()
        .attr('class', 'd3-tip')
        //.offset([-6, 0])
        /*.direction(function(d)
        {
            var parentChildren = d.parentData ? d.parentData.children : $scope.active.topLevelConcepts;
            var parentChildrenIds = parentChildren.map(function(child) { return child.concept._id; });
            var index = parentChildrenIds.indexOf(d.concept._id);
            var portion = index / parentChildren.length;

            if(portion <= 0.13 || portion >= 0.88)
            {
                return 'n';
            }
            if(portion > 0.13 && portion <= 0.38)
            {
                return 'e';
            }
            if(portion > 0.38 && portion <= 0.63)
            {
                return 's';
            }
            return 'w';
        })*/
        .html(function(d) {
            //return d.tip;
            return '<h4>' + d.event.name + '</h4><p>' + d.event.description + '</p>';
            //return d.depth >= $scope.zoomLevel + 2 ? d.concept.title : '';
        });

    this.setScope = function(scope)
    {
        $scope = scope;
    };

    this.mouseOverConcept = function(d)
    {
        if(d.depth >= $scope.zoomLevel + 2)
        {
            me.show(conceptTip, d);
        }
        $scope.hoverConcept(d);
        $scope.safeApply();
    };

    this.forSquare = function(square)
    {
        if(!$scope.vis) return;
        $scope.vis.call(squareTip);

        square.on('mouseover', function(d)
        {
            me.showSquare(squareTip, d);
            //fixHoverSquare(d3.event);
            $scope.hoverSquare(d);
        }).on('mousemove', function(d)
        {
            me.showSquare(squareTip, d);
            /*eventTip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
            eventTip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });*/
        }).on('mouseout', function()
        {
            me.closeOpenTips();
        }).on('click', function(d)
        {
            me.closeOpenTips();
            squareTip.hide(d);
            //d3.event.stopPropagation();
            //fixClickSquare(d3.event);
            $scope.clickSquare(d);
            $scope.safeApply();
        });
    };

    this.forEvent = function(eventGroup)
    {
        if(!$scope.vis) return;
        $scope.vis.call(eventTip);

        eventGroup.on('mouseover', function(d)
        {
            me.show(eventTip, d);
            eventTip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
            eventTip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });
        }).on('mousemove', function(d)
        {
            me.show(eventTip, d);
            eventTip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
            eventTip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });
        }).on('mouseout', function()
        {
            me.closeOpenTips();
        }).on('click', function(d)
        {
            me.closeOpenTips();
            eventTip.hide(d);
            d3.event.stopPropagation();
            $scope.safeApply();
        });
    };

    this.forConcept = function(l2Circle)
    {
        $scope.vis.call(conceptTip);

        l2Circle.select('circle').on('mouseover', function(d)
        {
            me.mouseOverConcept(d);
        }).on('mousemove', function(d)
        {
            if(d.depth >= $scope.zoomLevel + 2)
            {
                me.show(conceptTip, d);
            }
            $scope.safeApply();
        }).on('mouseout', function()
        {
            me.closeOpenTips();
        })
        /*.on('click', function(d)
        {
            console.log('zz');
            me.closeOpenTips();
            conceptTip.hide(d);
            $scope.activateConcept(d);
            d3.event.stopPropagation();
            $scope.safeApply();
        })*/;

        return conceptTip;
    };

    this.forImplicitPath = function(seg)
    {
        var node = seg.node();

        if(node)
        {
            var tip2 = d3.tip()
                .attr('class', 'd3-tip')
                //.attr('class', function(d) { console.log(d); return 'd3-tip d3-tip-' + d.from.concept._id + '-' + d.to.concept._id;})
                //.attr('id', function(d) { return 'd3-tip-' + d.from.concept._id + '-' + d.to.concept._id; })
                .offset([-6, 0])
                .html(function(d) {
                    return 'In the course, <i>' + d.from.concept.title + '</i><br /> is taught before <i>' + d.to.concept.title + '</i>';
                });

            $scope.vis.call(tip2);

            seg.on('mouseover', function(d)
            {
                $timeout.cancel(hideTimeout);
                if(hidden)
                {
                    me.show(tip2, d);
                }
                tip2.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
                tip2.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });
                fixHoverConcept(d3.event);
            }).on('mousemove', function(d)
            {
                $timeout.cancel(hideTimeout);
                tip2.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
                tip2.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });
            })
                .on('mouseleave', function()
                {
                    $timeout.cancel(hideTimeout);
                    hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 50);
                });

            return tip2;
        }
    };

    this.removeDependencies = function()
    {
        d3.selectAll('.d3-tip').remove();
        lastClicked = null;
        hidden = true;
        shown = '';
        openTip = null;
    };

    this.closeOpenTips = function()
    {
        hidden = true;
        shown = '';
        lastClicked = null;

        if(openTip !== null)
        {
            openTip.hide();
            openTip = null;
        }
        d3.selectAll('.d3-tip').style(
        {
            opacity: 0,
            visibility: 0,
            display: 'none'
        });
    };

    this.show = function(tip, d)
    {
        if(d.concept)
        {
            this.showConcept(tip, d);
        }
        else if(d.event)
        {
            this.showEvent(tip, d);
        }
        else if(d.from)
        {
            this.showDependency(tip, d);
        }
    };

    this.showSquare = function(tip, d)
    {
        var id = 'd3-tip-' + d.conceptId + '-' + d.segmentId;
        this.showById(tip, d, id);
    };

    this.showDependency = function(tip, d)
    {
        var id = 'd3-tip-' + d.from.concept._id + '-' + d.to.concept._id;
        this.showById(tip, d, id);
    };

    this.showEvent = function(tip, d)
    {
        if(d !== undefined && d.event)
        {
            var id = 'd3-tip-' + d.event._id;
            this.showById(tip, d, id);
        }
    };

    this.showConcept = function(tip, d)
    {
        if(d !== undefined && d.from || d.concept)
        {
            var id = d.from ? 'd3-tip-' + d.from.concept._id + '-' + d.to.concept._id : 'd3-tip-' + d.concept._id;
            this.showById(tip, d, id);
        }
    };

    var shown = '';
    var showTimeout = null;

    this.showById = function(tip, d, id)
    {
        if(d && shown !== id)
        {
            //$timeout.cancel(hideTimeout);
            me.closeOpenTips();
            shown = id;

            tip.attr('id', id);

            var el = d3.select('#'+id);

            // Need this so d3-tip can calculate the offsetWidth of the tip.
            el.style('display', 'block');

            openTip = tip;
            tip.show(d);
            hidden = false;
            //hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 1000);

            el.style('opacity', 0); // start out invisible

            $timeout.cancel(showTimeout);
            // After short delay, show the tip.
            showTimeout = $timeout(function()
            {
                el
                    .transition()
                    .duration(400)
                    .style("opacity", 1);

            }, 300);
        }
    };

    var lastClicked = null;

    this.forDependency = function(segment)
    {
        var node = segment.node();

        if(node)
        {
            //console.trace();
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                //.attr('id', function(d) { return 'd3-tip-' + d.from.concept._id + '-' + d.to.concept._id; })
                .offset([-6, 0])
                .html(function(d)
                {
                    var content;

                    if(!d.from.concept.title)
                        content = 'You can go straight to ' + d.to.concept.title + '</i>';
                    else
                        content = 'Learn <i>' + d.from.concept.title + '</i><br /> before <i>' + d.to.concept.title + '</i>';

                    if(Authentication.isCourseTeachingAssistant($scope.course._id) && d.dep)
                    {
                        content += '<a class="remove-dep-link" id="remove-dep-link-'+ d.dep._id +'" href><span class="glyphicon glyphicon-trash"></span></a>';

                        $timeout(function()
                        {
                            $('#remove-dep-link-' + d.dep._id).click(function(e)
                            {
                                $scope.removeDependency(d);

                                e.preventDefault();
                                return false;
                            });
                        },100);
                    }

                    return content;
                    //return 'Learn <i>' + d.from.concept.title + '</i><br /> before <i>' + d.to.concept.title + '</i>';
                });
            //.attr('top', function() { return d3.mouse()[1]; })
            //.attr('left', function() { return d3.mouse()[0]; });

            $scope.vis.call(tip);

            var repositionFct = function(d)
            {
                //console.log(lastClicked);
                if(lastClicked !== d)
                {
                    tip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' });
                    tip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' });
                }
            };

            segment
                .on('mouseover', function(d)
                {
                    $timeout.cancel(hideTimeout);
                    if(hidden)
                    {
                        me.show(tip, d);
                    }
                    repositionFct(d);
                    fixHoverConcept(d3.event);
                })
                .on('mousemove', function(d)
                {
                    $timeout.cancel(hideTimeout);
                    repositionFct(d);
                })
                .on('mouseleave', function()
                {
                    if(!lastClicked)
                    {
                        $timeout.cancel(hideTimeout);
                        hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 50);
                    }
                })
                .on('click', function(d)
                {
                    lastClicked = d;
                    $timeout.cancel(hideTimeout);
                    //hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 50);
                    //d3.event.stopPropagation();
                    //fixClick(d3.event);
                });
        }

    };

    var lastEvt = null;
    function fixHover(evt, layer)
    {
        if(evt === lastEvt) return;
        lastEvt = evt;

        var list = getEventElements(evt, layer.node());

        for(var i = 0; i < list.length; i++)
        {
            /*var conceptId = list[i].parentNode.getAttribute('data-concept-id');
            var concept = $scope.directories.concepts[conceptId];

            $scope.hoverConcept(concept);*/
            console.log(list[i], $(list[i]));
            //$(list[i]).trigger(evt);
            $(list[i]).hover();
        }
    }

    function fixHoverConcept(evt)
    {
        //fixHover(evt, $scope.mainLayer);
        var list = getEventElements(evt, $scope.mainLayer.node());

        for(var i = 0; i < list.length; i++)
        {
            var conceptId = list[i].parentNode.getAttribute('data-concept-id');
            var concept = $scope.directories.concepts[conceptId];

            $scope.hoverConcept(concept);
        }
    }

    function fixHoverSquare(evt)
    {
        //fixHover(evt, $scope.squareLayer);
        var list = getEventElements(evt, $scope.squareLayer.node());

        for(var i = 0; i < list.length; i++)
        {
            var idParts = list[i].parentNode.id.split('-');
            var conceptId = idParts[1];
            var segmentId = idParts[2];

            //$scope.hoverSegment($scope.segmentMap[segmentId]);
            var square = $scope.squaresPerConcept[conceptId].filter(function(s)
            {
                return s.segmentId == segmentId;
            })[0];

            $scope.hoverSquare(square);
        }
    }

    function fixClickSquare(evt)
    {
        //fixHover(evt, $scope.squareLayer);
        var list = getEventElements(evt, $scope.squareLayer.node());

        for(var i = 0; i < list.length; i++)
        {
            var idParts = list[i].parentNode.id.split('-');
            var conceptId = idParts[1];
            var segmentId = idParts[2];

            //$scope.hoverSegment($scope.segmentMap[segmentId]);
            var square = $scope.squaresPerConcept[conceptId].filter(function(s)
            {
                return s.segmentId == segmentId;
            })[0];

            $scope.clickSquare(square);
        }
    }

    function fixClick(evt, layer)
    {
        var list = getEventElements(evt, $scope.mainLayer.node());

        for(var i = 0; i < list.length; i++)
        {
            var conceptId = list[i].parentNode.getAttribute('data-concept-id');
            var concept = $scope.directories.concepts[conceptId];

            $scope.activateConcept(concept);
        }
    }

    function getEventElements(evt, parentNode)
    {
        var root = $scope.vis.node();

        var offset = $(root).offset();

        var rpos = root.createSVGRect();
        rpos.x = evt.clientX - offset.left;
        rpos.y = evt.clientY - offset.top;
        rpos.width = rpos.height = 1;

        return root.getIntersectionList(rpos, parentNode);
    }

    return (this);
});
