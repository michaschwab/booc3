angular.module('courses').service('MapArrows', function(Tip, ConceptStructure, MapArrowShaping, $location)
{
    var me = this;
    var $scope;

    var lineBasis = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('basis');

    var lineLinear = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    var OPTIONS_PLANS = {
        zoomMode: true,
        showAllDeps: false,
        showCurrentDeps: false,
        showCurrentProvidings: false,
        showCurrentProvidingsImplicit: false,
        showAllProvidingsImplicit: false,
        showCurrentPath: false,
        showCurrentPathHierarchy: true,
        showCurrentPathFutureHierarchy: true,
        showAllShortestPathsHierarchy: true,
        showPathWhenInactive: false,
        grayInactiveConcepts: true,
        grayInactiveDependencies: false,
        hideInactiveDependencies: false,
        depsColorOfConcept: true
    };

    var OPTIONS_PREREQS = {
        zoomMode: true,
        showAllDeps: true,
        showCurrentDeps: true,
        showCurrentProvidings: true,
        showCurrentProvidingsImplicit: false,
        showAllProvidingsImplicit: false,
        showCurrentPath: false,
        showCurrentPathHierarchy: false,
        showCurrentPathFutureHierarchy: false,
        showAllShortestPathsHierarchy: false,
        showPathWhenInactive: false,
        grayInactiveConcepts: true,
        grayInactiveDependencies: true,
        hideInactiveDependencies: true,
        depsColorOfConcept: true
    };

    this.init = function(scope)
    {
        $scope = scope;
        $scope.learningPlansOn = true;
        this.setUpWatch();
        MapArrowShaping.init($scope);
    };

    this.addLines = function(lines, layer, groupClassName, pathClassName, markerNormal, markerColored, each)
    {
        var provLine = layer.selectAll('.'+groupClassName).data(lines);
        //var provLine = layer.selectAll('.groupClassName').data(lines);
        var provLineEnter = provLine.enter().append('g').attr({
            'class': groupClassName
        });

        provLineEnter.append('path')
            .attr('d', function(d) { return lineBasis([d.start, d.curvePoint, d.end]); })
            .classed(pathClassName, true)
            //.classed('alldep', true)
            .classed('end', true)
            //.attr('stroke', '#228822')
            .attr('stroke-width', function(d) { return d.width/2; })
            //.attr('marker-end', 'url(#depEnd-active)')
            .attr('marker-end', function(d) { return $scope.options.depsColorOfConcept ?
            //'url(#'+markerColored+'-' + $scope.depthColorModification(d.from, false) + ')' : 'url(#'+markerNormal+')'; })
            'url(' + $scope.absUrl + '#' + markerColored+'-' + $scope.depthColorModification(d.from, false) + ')' : 'url(#'+markerNormal+')'; })

            //.attr('data-dependant-title', dependant.concept.title)
            .attr('fill', 'none');

        var path = provLineEnter.append('path')
            .attr('d', function(d) { return lineBasis([d.start, d.curvePoint, d.end]); })
            .classed(pathClassName, true)
            //.attr('stroke', '#228822')
            //.style('stroke', function() { return $scope.options.depsColorOfConcept ? $scope.depthColorModification(prettyLine.from, false) : '#228822'; })
            .style('stroke', function(d) { return $scope.options.depsColorOfConcept ? $scope.depthColorModification(d.from, false) : ''; })
            .attr('stroke-width', function(d) { return d.width; })
            .attr('fill', 'none');

        //console.log(path);
        if(each) each(path);
    };

    this.drawDeps = function()
    {
        var depLayer = d3.select('#depLayer');
        depLayer.selectAll('*').remove();

        var provs = [];

        if($scope.options.showAllProvidingsImplicit)
        {
            for(var conceptId in $scope.directories.concepts)
            {
                if($scope.directories.concepts.hasOwnProperty(conceptId))
                {
                    var goalConcept = $scope.directories.concepts[conceptId];
                    var parent = goalConcept, concepts = [], index = -1, tries = 0, maxTries = 1;

                    while(parent !== undefined && index === concepts.length - 1 && tries < maxTries)
                    {
                        tries++;

                        if(parent !== undefined && parent.parentData)
                        {
                            //console.log(parent.parentData.concept.title);
                            concepts = parent.parentData.children;
                            index = concepts.indexOf(parent);
                        }
                        else if(parent)
                        {
                            concepts = $scope.active.topLevelConcepts;
                            index = concepts.indexOf(parent);
                        }

                        parent = parent.parentData;
                    }

                    if(index !== -1 && index < concepts.length - 1)
                    {
                        provs.push({provider: goalConcept.concept._id, dependant: concepts[index+1].concept._id});
                    }
                    else
                    {
                        //console.log('couldnt find next concept?');
                    }
                }
            }

            this.findAddPaths(provs, depLayer, 'provLine','allimplicit', 'provEndAll', 'depEndActive', function(path)
            {
                Tip.forImplicitPath(path);
            });
        }

        if($scope.dependencies !== undefined && $scope.options.showAllDeps)
        {
            me.findAddPaths($scope.dependencies, depLayer, 'depLine', 'alldep', 'depEnd', 'depEnd', function(path)
            {
                Tip.forDependency(path);
            });
        }
    };

    this.showCurrentPath = function()
    {
        var pos = [];
        var depLayer = d3.select('#pathLayer');

        if($scope.goalConcept !== null || $scope.active.hoveringConceptIds.length !== 0 || $scope.options.showPathWhenInactive)
        {
            $scope.todoIds.forEach(function(todoId)
            {
                var concept = $scope.directories.concepts[todoId];

                if(concept.children.length === 0)
                {
                    var translate = $scope.getTranslateAbs(concept);
                    pos.push(translate);
                }
            });

            depLayer.append('path')
                .attr('d', lineLinear(pos))
                .attr('class', 'currentPath')
                .attr('stroke', '#444466')
                .attr('stroke-width', 5)
                //.attr('marker-end', function() { return 'url(#depEndActive-' + $scope.depthColorModification(from, false) + ')'; })
                //.attr('marker-end', 'url(#provEnd-active)')
                .attr('fill', 'none');
        }
    };

    this.getCurrentProvidingsImplicit = function(goalConcept, provs)
    {
        //var children = ConceptStructure.getConceptChildrenFlat(goalConcept).concat(goalConcept);
        var children = goalConcept.children.length > 0 ? goalConcept.children.concat(goalConcept) : [goalConcept];

        for(var i in children)
        {
            if(children.hasOwnProperty(i))
            {
                var goal = children[i];
                var parent = goal, concepts = [], tries = 0, maxTries = 5;
                var index = -1;

                while(parent !== undefined && parent !== null && index === concepts.length - 1 && tries < maxTries)
                {
                    tries++;

                    if(parent !== undefined && parent !== null && parent.parentData)
                    {
                        //console.log(parent.parentData.concept.title);
                        concepts = parent.parentData.children;
                        index = concepts.indexOf(parent);
                    }
                    else if(parent)
                    {
                        concepts = $scope.active.topLevelConcepts;
                        index = concepts.indexOf(parent);
                    }

                    parent = parent.parentData;
                }

                if(index !== -1 && index < concepts.length - 1)
                {
                    provs.push({provider: goal.concept._id, dependant: concepts[index+1].concept._id});
                }
                else
                {
                    //console.log('couldnt find next concept?');
                }
            }
        }
    };

    //this.addLines = function(lines, layer, groupClassName, pathClassName, markerNormal, markerColored, each)
    this.findAddPaths = function(provs, layer, groupClassName, pathClassName, markerNormal, markerColored, each)
    {
        provs.forEach(function(dep, i)
        {
            var from = $scope.directories.concepts[dep.provider];
            var to = $scope.directories.concepts[dep.dependant];

            // to make sure no broken deps ended up here for some reason.
            if(from && to)
            {
                var pos = [ $scope.getTranslateAbs(from),  $scope.getTranslateAbs(to)];

                var path = layer.append('path')
                    .attr('d', lineBasis(pos));
                var pathNode = path.node();

                var lines = MapArrowShaping.curvePath(pathNode, pos, [from, to], $scope.visParams.l1.scale, $scope.getTranslateAbs, 0, 3, undefined, undefined, dep);

                me.addLines(lines, layer, groupClassName + '-' + i, pathClassName, markerNormal, markerColored, each);

                path.remove();
            }
        });
    };

    this.drawPlans = function()
    {
        var depLayer = d3.select('#pathLayer');

        depLayer.selectAll('.currentPath').remove();
        if($scope.options.showCurrentPath)
        {
            this.showCurrentPath();
        }

        var courseScope = $scope.$parent.$parent;
        var goalConcept = courseScope.currentGoal;

        depLayer.selectAll('.currentDeps').remove();

        if($scope.options.showCurrentProvidings || $scope.options.showCurrentProvidingsImplicit)
        {
            if(goalConcept !== null)
            {
                var provs = [];

                if($scope.options.showCurrentProvidings)
                {
                    provs = ConceptStructure.getConceptProvidings(goalConcept, true).map(function(dep)
                    {
                        return dep.dependency;
                    }).filter(function(dep)
                    {
                        return dep !== null;
                    });
                }

                if($scope.options.showCurrentProvidingsImplicit)
                {
                    this.getCurrentProvidingsImplicit(goalConcept, provs);
                }

                me.findAddPaths(provs, depLayer, 'currentDepsImplicit', 'currentDeps', 'provEnd-active', 'depEndActive');
            }
        }

        if($scope.options.showCurrentDeps)
        {
            if(goalConcept !== undefined)
            {
                var deps = ConceptStructure.getConceptDependencies(goalConcept, true).map(function(dep)
                {
                    return dep.dependency;
                }).filter(function(dep)
                {
                    return dep !== null;
                });

                me.findAddPaths(deps, depLayer, 'currentDeps', 'currentDeps', 'depEnd-active', 'depEndActive');
            }
        }

        me.drawPaths();

        d3.select('#pathLayer').selectAll('.currentPathFutureHierarchy').remove();
        if($scope.options.showCurrentPathFutureHierarchy && goalConcept !== null)
        {
            //TODO: Find the TLCs that need 'goalConcept' and show the learning plans to them
            //var currentHierarchyIds =
            var pChain = goalConcept.parentChain ? goalConcept.parentChain.concat(goalConcept) : [goalConcept];
            var pChainIds = pChain.map(function(d) { return d.concept._id; });

            $scope.active.topLevelConcepts.forEach(function(tlc)
            {
                if(pChainIds.indexOf(tlc.concept._id)  === -1)
                {
                    var todoIds = ConceptStructure.getTodoListSorted(tlc).map(function(todo)
                    {
                        return todo.concept._id;
                    });

                    if(todoIds.indexOf(goalConcept.concept._id) !== -1)
                    {
                        var offsetWidth = 10 / Math.pow(4, $scope.zoomLevel) * $scope.graphMinDim / 600;
                        offset = offsetWidth / $scope.active.topLevelConcepts.length;
                        me.drawPathHierarchy(tlc, $scope, false, 'currentPathFutureHierarchy', offset);
                    }
                }
            });
        }

        if($scope.options.showCurrentPathHierarchy)
        {
            var offsetWidth = 1.5 * 10 / Math.pow(4, $scope.zoomLevel) * $scope.graphMinDim / 600;
            var offset = offsetWidth / $scope.active.topLevelConcepts.length;

            me.drawPathHierarchy(goalConcept, $scope, true, 'currentPathHierarchy', offset, function()
            {
                depLayer.selectAll('.currentPathHierarchy').remove();
            }, 1.5);
        }
        else
        {
            depLayer.selectAll('.currentPathHierarchy').remove();
        }
    };

    this.drawPaths = function()
    {
        d3.select('#pathLayer').selectAll('.allPathHierarchy').remove();

        var courseScope = $scope.$parent.$parent;

        MapArrowShaping.clearOffsets();
        if($scope.options.showAllShortestPathsHierarchy && courseScope.currentGoal === null)
        {
            var offset, count = 0;
            //console.log($scope.zoomLevel);
            $scope.active.topLevelConcepts.forEach(function(tlc)
            {
                var offsetWidth = 10 / Math.pow(4, $scope.zoomLevel) * $scope.graphMinDim / 600;
                offset = offsetWidth / $scope.active.topLevelConcepts.length;
                me.drawPathHierarchy(tlc, $scope, false, 'allPathHierarchy', offset);
                count++;
            });
        }
        else
        {

        }
    };

    var last = {};
    var lastHoverConceptId = '-';
    var lastGraphDimSum = 0;
    var lastTodoLength = 0;

    this.drawPathHierarchy = function(goalConcept, $scope, goalInDetail, className, offsetEach, onDifferent, width)
    {
        var pos = [];
        var depLayer = d3.select('#pathLayer');
        if(!last[className]) last[className] = {};
        if(!width) width = 1;

        goalInDetail = goalInDetail ? true : false;
        var goalConceptId = goalConcept ? goalConcept.concept._id : '';
        var goalTlc = goalConcept;
        while(goalTlc && goalTlc.parentData)
            goalTlc = goalTlc.parentData;
        //var goalTlcChildren = ConceptStructure.getConceptChildrenFlat(goalTlc);
        //var goalTlcChildrenIds = goalTlcChildren.map(function(d) { return d.concept._id; });
        var activeConcept = $scope.activeConcept;
        var hoverConcept = $scope.active.hoveringConceptIds.length !== 0 ? $scope.directories.concepts[$scope.active.hoveringConceptIds[0]] : null;
        var hoverConceptId = hoverConcept === null ? '' : hoverConcept.concept._id;

        var newActiveId = activeConcept === null ? '' : activeConcept.concept._id;
        var graphDimSum = $scope.graphWidth + $scope.graphHeight;

        if(!last[className]['goalConceptId'] || last[className]['goalConceptId'] !== goalConceptId
            || !last[className]['activeConceptId'] || last[className]['activeConceptId'] !== newActiveId
            || !last[className]['hoverConceptId'] || last[className]['hoverConceptId'] !== hoverConceptId
            || graphDimSum !== lastGraphDimSum || lastTodoLength !== $scope.todoIds.length)
        {
            last[className]['goalConceptId'] = goalConceptId;
            last[className]['activeConceptId'] = newActiveId;
            lastGraphDimSum = graphDimSum;
            lastHoverConceptId = hoverConceptId;

            var todo = ConceptStructure.getTodoListSorted(goalConcept);
            var todoIds = todo.map(function(d) { return d.concept._id; });
            lastTodoLength = todoIds.length;

            //depLayer.selectAll('.currentPathHierarchy').remove();
            if(onDifferent) onDifferent();

            var color = goalConcept ? $scope.getPathColor(goalConcept.concept.color) : $scope.getPathColor('#444466');
            $scope.addColor(color);


            var parentChain, hoverChain;
            if(goalConcept && goalInDetail)
            {
                parentChain = goalConcept.parentChain ? goalConcept.parentChain : [];
                hoverChain = parentChain.concat(goalConcept);
            }
            else
            {
                hoverChain = $scope.directories.concepts;
            }

            var hoverChainIds = hoverChain.map(function(concept) { return concept.concept._id; });
            if(activeConcept !== null)
            {
                var activeParentChain = activeConcept.parentChain ? activeConcept.parentChain : [];
                hoverChainIds = hoverChainIds.concat(activeParentChain.map(function(c) { return c.concept._id; }), newActiveId);
            }
            if(hoverConcept !== null)
            {
                var hoverParentChain = hoverConcept.parentChain ? hoverConcept.parentChain : [];
                hoverParentChain = hoverParentChain.concat(hoverConcept);
                hoverParentChain = hoverParentChain.filter(function(c)
                {
                    return $scope.zoomLevel + 1 >= c.depth;
                });
                hoverChainIds = hoverChainIds.concat(hoverParentChain.map(function(c) { return c.concept._id; }));
            }

            var coveredConcepts = [];

            // Adding start before first concept.
            var firstBig = $scope.active.topLevelConcepts[0];
            var scale = ((firstBig.radius / 0.7) / 2 + 0.5) * $scope.graphMinDim / 700;
            var firstBigPos = $scope.getTranslateAbs(firstBig);
            var arrowStart = { x: firstBigPos.x - scale * 180 , y: firstBigPos.y - scale * 60  };

            pos.push(arrowStart);
            coveredConcepts.push({radius: 0.01, concept: { _id: 'randomIdHere123456789', color: '#000000'}});

            // Now adding the actual concepts.

            todoIds.forEach(function(todoId)
            {
                var concept = $scope.directories.concepts[todoId];
                if(!concept) return;

                if((concept.depth > 1 && hoverChainIds.indexOf(concept.parentData.concept._id) !== -1 && (hoverChainIds.indexOf(concept.concept._id) === -1 || concept.children.length === 0))
                    || (concept.depth === 1 &&  hoverChainIds.indexOf(concept.concept._id) === -1))
                {
                    var translate = $scope.getTranslateAbs(concept);
                    pos.push(translate);
                    coveredConcepts.push(concept);
                }
            });

            var path = depLayer.append('path')
                .attr('d', lineLinear(pos))
                .attr('fill','none');
            //.attr('stroke','#ff0000');
            //.attr('class', 'currentPathHierarchy');

            var pathNode = path.node();
            var lines = MapArrowShaping.curvePath(pathNode, pos, coveredConcepts, $scope.visParams.l1.scale, $scope.getTranslateAbs, 0, 0, offsetEach, color);



            if(lines.length > 0)
            {
                var pathLine = depLayer.selectAll('.' + className + ' concept-' + goalConceptId).data(lines);
                var seg = pathLine.enter().append('path')
                    .attr('d', function(d) { return d.curvePoint ? lineBasis([d.start, d.curvePoint, d.end]) : lineLinear([d.start, d.end]); })
                    //.attr('marker-end', function() { return i === lines.length - 1 ? 'url(#currentPathEnd)' : '' })
                    .attr('class', className + ' main concept-' + goalConceptId)
                    .attr('stroke', color)
                    .attr('fill', 'none');

                Tip.forDependency(seg);

                var i = lines.length - 1;

                depLayer.append('path')
                    .attr('d', lineBasis([lines[i].start, lines[i].curvePoint, lines[i].end]))
                    //.attr('marker-end', function() { return i === lines.length - 1 ? 'url(#currentPathEnd)' : '' })
                    .attr('marker-end', function() { return i === lines.length - 1 ? 'url(' + $scope.absUrl + '#' + className+'End-' + color + ')' : '' })
                    .attr('class', className + ' end concept-' + goalConceptId)
                    .attr('fill', 'none');
            }

            path.remove();
        }

        var strokeWidthMax = $scope.graphMinDim / 200;
        var strokeWidth = strokeWidthMax / Math.pow(3, $scope.zoomLevel) * width;
        //console.log($scope.zoomLevel, strokeWidth);
        d3.selectAll('.'+className).attr({
            'stroke-width': strokeWidth
        });
        d3.selectAll('.'+className+'.end').attr({
            'stroke-width': strokeWidth/3
        });
    };

    this.drawStraightLine = function(pos, color, className)
    {
        var depLayer = d3.select('#pathLayer');

        color = $scope.getPathColor(color);
        //var colorWithoutHash = color.substr(1);
        $scope.addColor(color);

        var strokeWidthMax = $scope.graphMinDim / 150;
        var strokeWidth = strokeWidthMax / Math.pow(3, $scope.zoomLevel);
        var d = lineBasis(pos);

        depLayer.append('path')
            .attr('d', d)
            //.attr('marker-end', function() { return i === lines.length - 1 ? 'url(#currentPathEnd)' : '' })
            .attr('marker-end', 'url(' + $scope.absUrl + '#' + className+'End-' + color + ')')
            //.attr('marker-end', 'url(#'+className+'End-'+color+')')
            .attr('class', className + ' end')
            .attr('stroke-width', strokeWidth / 2.5)
            .attr('stroke', color)
            .attr('fill', 'none');

        depLayer.append('path')
            .attr('d', d)
            //.attr('marker-end', function() { return i === lines.length - 1 ? 'url(#currentPathEnd)' : '' })
            .attr('class', className + ' end')
            .attr('stroke-width', strokeWidth)
            .attr('stroke', color)
            .attr('fill', 'none');
    };

    this.setUpWatch = function()
    {
        $scope.$watch('options.showAllDeps', function()
        {
            $scope.redraw();
        });
        $scope.$watch('options.showAllProvidingsImplicit', function()
        {
            $scope.redraw();
        });
        $scope.$watch('options.depsColorOfConcept', function()
        {
            $scope.redraw();
        });
        $scope.$watch('options.showAllShortestPathsHierarchy', function()
        {
            $scope.redraw();
        });

        $scope.$watch('options', function()
        {
            $scope.redrawHover();
        });

        var search = $location.search();
        var adminMode = search && search.mode && search.mode == 'admin';

        $scope.$on('$locationChangeSuccess', function()
        {
            search = $location.search();
            adminMode = search && search.mode && search.mode == 'admin';

            if(adminMode)
            {
                setToPrerequisites();
            }
        });

        var setToPrerequisites = function()
        {
            $scope.learningPlansOn = false;
        };

        $scope.setLearningPlans = function(onOff)
        {
            $scope.learningPlansOn = onOff;
        };

        $scope.$watch('learningPlansOn', function()
        {
            $scope.options = $scope.learningPlansOn ? OPTIONS_PLANS : OPTIONS_PREREQS;
        });

        //$scope.preReqButtonClick();
    };
});
