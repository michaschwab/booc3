'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').service('Tip',
function($timeout, ConceptStructure)
{
    var me = this;
    var vis = d3.select("#vis");
    var $scope = null;
    var hideTimeout = null;
    var hidden = true;
    var openTip = null;

    var conceptTip = d3.tip()
        .attr('class', 'd3-tip')
        //.offset([-6, 0])
        .direction(function(d)
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

    this.forEvent = function(eventGroup)
    {
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
                fixHover(d3.event);
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

    this.closeOpenTips = function()
    {
        hidden = true;
        shown = '';
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

    this.forDependency = function(segment)
    {
        var node = segment.node();

        if(node)
        {
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                //.attr('id', function(d) { return 'd3-tip-' + d.from.concept._id + '-' + d.to.concept._id; })
                .offset([-6, 0])
                .html(function(d) {
                    return 'Learn <i>' + d.from.concept.title + '</i><br /> before <i>' + d.to.concept.title + '</i>';
                });
            //.attr('top', function() { return d3.mouse()[1]; })
            //.attr('left', function() { return d3.mouse()[0]; });

            $scope.vis.call(tip);

            segment
                .on('mouseover', function(d)
                {
                    $timeout.cancel(hideTimeout);
                    if(hidden)
                    {
                        me.show(tip, d);
                    }
                    tip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' })
                    tip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' })
                    fixHover(d3.event);
                })
                .on('mousemove', function(d)
                {
                    $timeout.cancel(hideTimeout);
                    tip.style('left', function() { return (d3.event.pageX - this.getBoundingClientRect().width/2) + 'px' })
                    tip.style('top', function() { return (d3.event.pageY - this.getBoundingClientRect().height - 8) + 'px' })
                })
                .on('mouseleave', function()
                {
                    $timeout.cancel(hideTimeout);
                    hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 50);
                })
                .on('click', function(d)
                {
                    //todo figure out what i was thinking here, and then hopefully remove this.
                    /*function isActive(concept)
                    {
                        return currentChildrenIds.indexOf(concept.concept._id) !== -1;
                    }

                    if($scope.currentGoal !== null)
                    {
                        var currentChildren = ConceptStructure.getConceptChildrenFlat($scope.currentGoal);
                        var currentChildrenIds = currentChildren.map(function(d) { return d.concept._id; });

                        var isFrom = isActive(d.from);
                        var isTo = isActive(d.to);

                        if((isFrom && !isTo) || (!isFrom && isTo))
                        {
                            var target = isFrom ? d.to : d.from;

                            $scope.activateConcept(target);
                        }
                        else
                        {
                            console.log('zoom out or do nothing');
                        }
                    }
                     */
                    $timeout.cancel(hideTimeout);
                    hideTimeout = $timeout(function(d) { hidden = true; me.closeOpenTips(); }, 50);
                    //d3.event.stopPropagation();
                    fixClick(d3.event);
                });
        }

    };

    function fixHover(evt)
    {
        var list = getEventElements(evt, $scope.mainLayer.node());

        for(var i = 0; i < list.length; i++)
        {
            var conceptId = list[i].parentNode.getAttribute('data-concept-id');
            var concept = $scope.directories.concepts[conceptId];

            $scope.hoverConcept(concept);
        }
    }

    function fixClick(evt)
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
