angular.module('map').service('MapActions', function(Tip, ConceptStructure, $location, MapArrows, $modal, Logger)
{
    var me = this;
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;

        $scope.activateConcept = function (d, event)
        {
            var previousLogData = {};
            var conceptData;

            if(!$scope.activeConcept)
            {
                previousLogData.previousConceptId = '';
            }
            else
            {
                previousLogData.previousConceptId = $scope.activeConcept.concept._id;
                previousLogData.previousConceptTitle = $scope.activeConcept.concept.title;
                previousLogData.previousConceptDepth = $scope.activeConcept.depth;
            }

            $location.search('segment', '');

            if(d === undefined)
            {
                //$scope.active.hierarchy = [];
                Logger.log('MapZoomOut', { prev: previousLogData}, event);
                $scope.active.hierarchy = [];
                $location.search('active', '');
                //$location.search('goal', '');
                $scope.safeApply();
                //$scope.redraw();
            }
            else
            {
                if(d._id !== undefined)
                {
                    // in case an actual concept was passed (eg from search)
                    d = $scope.directories.concepts[d._id];
                }

                var id = d.concept._id;

                if($scope.activeConcept === null || $scope.activeConcept.concept._id !== id)
                {
                    //console.log($scope.activeConcept);
                    $location.search('active', id);

                    conceptData = { conceptId: d.concept._id, conceptTitle: d.concept.title, conceptDepth: d.depth };
                    Logger.log('MapZoomIn', { newConcept: conceptData,  prev: previousLogData}, event);
                    //$location.search('goal', id);
                }
                else
                {
                    //console.log('activating parent..', d.parentData);
                    if(d.parentData !== undefined)
                    {
                        conceptData = { conceptId: d.parentData.concept._id, conceptTitle: d.parentData.concept.title, conceptDepth: d.parentData.depth };
                        Logger.log('MapZoomOut', { newConcept: conceptData,  prev: previousLogData}, event);

                        $location.search('active', d.parentData.concept._id);
                        //$location.search('goal', d.parentData.concept._id);
                    }
                    else
                    {
                        Logger.log('MapZoomOut', { prev: previousLogData}, event);

                        $location.search('active', '');
                        //$location.search('goal', '');
                    }
                }

                $scope.safeApply();
            }

            //$scope.redraw();
        };

        $scope.rightClick = function($event)
        {
            var tagName = $event.toElement.tagName;
            var search = $location.search();
            var isAdmin = search.mode == 'admin';

            if(tagName == 'circle')
            {
                $scope.setGoal($event);
            }
            else if(tagName == 'path' && isAdmin)
            {
                $scope.removeDependencyEvent($event);
            }
        };

        $scope.removeDependency = function(d)
        {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modules/conceptdependencies/views/removeModal.client.view.html',
                controller: 'DependencyRemoveModalController',
                resolve: {
                    dependency: function() { return d.dep; },
                    from: function() { return d.from; },
                    to: function() { return d.to }
                }
            });

            modalInstance.result.then(function ()
            {
                d.dep.$remove(function()
                {
                    console.log('gone?');
                });
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.removeDependencyEvent = function($event)
        {
            var depPath = $event.toElement;

            var d3path = d3.select(depPath);

            d3path.each(function(d)
            {
                //console.log(d);
                if(d.dep)
                {
                    $scope.removeDependency(d);
                }
            });
        };

        $scope.setGoal = function($event)
        {
            var group = $event.target.parentNode;
            var conceptId = group.getAttribute('data-concept-id');

            if(conceptId)
            {
                if($scope.goalConcept !== null && $scope.goalConcept.concept._id === conceptId)
                {
                    $location.search('goal', '');
                }
                else
                {
                    $location.search('goal', conceptId);
                }
            }
            else
            {
                $location.search('goal', '');
            }
        };

        var creatingPathClassName = 'creatingDep';

        $scope.$watch('creatingDepConcept', function()
        {
            $scope.redraw();

            function getCursor(evt)
            {
                var svg = document.getElementById('vis');
                var vis = document.getElementById('mainCanvas');
                var pt=svg.createSVGPoint();

                pt.x = evt.clientX;
                pt.y = evt.clientY;
                return pt.matrixTransform(vis.getScreenCTM().inverse());
            }

            if($scope.creatingDepConcept)
            {
                var visEl = document.getElementById('vis');
                var visElJ = $(visEl);
                //todo make an arrow that follows the mouse
                visEl.addEventListener('mousemove', function(event)
                {
                    if($scope.creatingDepConcept)
                    {
                        d3.selectAll('.' + creatingPathClassName).remove();
                        var to = getCursor(event);
                        //var to = {x: event.pageX - visElJ.offset().left, y: event.clientY };
                        var from = $scope.getTranslateAbs($scope.creatingDepConcept);

                        MapArrows.drawStraightLine([from, to], $scope.creatingDepConcept.concept.color, creatingPathClassName);
                    }
                });
                document.addEventListener('keyup', function(event)
                {
                    // press Escape for cancel
                    if($scope.creatingDepConcept && event.keyCode == 27)
                    {
                        d3.selectAll('.' + creatingPathClassName).remove();
                        $scope.creatingDepConcept = null;
                    }
                });
            }
        });
    };

    this.addConcept = function(concept)
    {
        /*var parentChildren, depth;

        if($scope.concepts.map(function(d) { return d._id; }).indexOf(concept._id) === -1)
        {
            //$scope.concepts.push(concept);
            //$scope.remoteConcepts.push(concept);
        }

        if(concept.parents && concept.parents.length > 0)
        {
            // So far only 1 parent supported.
            var parentId = concept.parents[0];
            var parent = $scope.directories.concepts[parentId];
            parentChildren = parent.children;
            depth = parent.depth + 1;
        }
        else
        {
            parentChildren = $scope.active.topLevelConcepts;
            depth = 1;
        }

        var obj = {
            depth: depth,
            concept: concept,
            angle: 0,
            //radius: 0.3,
            children: [],
            x: 0,
            y: 0
        };

        $scope.directories.concepts[concept._id] = obj;
        parentChildren.push(obj);

        for(var i = 0; i < parentChildren.length; i++)
        {
            $scope.configCircle(parentChildren, parentChildren[i].depth, parentChildren[i], i);
        }*/
    };

    this.rename = function(concepts, conceptId, newTitle)
    {
        if(concepts)
        {
            concepts.forEach(function(concept)
            {
                if(concept.concept._id == conceptId)
                {
                    concept.concept.title = newTitle;
                    concept.splitTexts = $scope.splitTitle(newTitle, concept.depth);
                }
                concept.children = me.rename(concept.children, conceptId, newTitle);
            });
        }
        return concepts;
    };

    this.removeConcept = function(conceptId, hierarchyConcepts)
    {
        var filter = function (d)
        {
            return d.concept._id !== conceptId;
        };

        // This is to reconfigure the active hierarchy concepts

        hierarchyConcepts = hierarchyConcepts.filter(filter);

        for(var i = 0; i < hierarchyConcepts.length; i++)
        {
            $scope.configCircle(hierarchyConcepts, hierarchyConcepts[i].depth, hierarchyConcepts[i], i);
        }

        // And this part is to actually get rid of the object in the $scope.
        // Has to be done seperately because the objects are copied over to d3.data().

        var doFilter = function(concepts)
        {
            if(concepts)
            {
                concepts = concepts.filter(filter);
                //console.log(concepts.map(function(d) { return d.concept.title; }));

                concepts.forEach(function(concept, i)
                {
                    concept.children = doFilter(concept.children);
                });
            }
            return concepts;
        };

        $scope.active.topLevelConcepts = doFilter($scope.active.topLevelConcepts);
        //$scope.concepts = $scope.concepts.filter(function(d) { return d._id !== conceptId; });

        //var pos = $scope.remoteConcepts.map(function(d) { return d._id; }).indexOf(conceptId);
        //$scope.remoteConcepts.slice(pos, 1);
        //$scope.remoteConcepts = $scope.remoteConcepts.filter(function(d) { return d._id !== conceptId; });

        $scope.redraw();
    };

    return (this);
});
