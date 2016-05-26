'use strict';

angular.module('concepts').directive('boocSearch', function(SourceIcon, Logger, $location) {
    return {
        restrict: "E",
        scope: {
            concepts: '=',
            segments: '='
        },
        transclude: true,
        templateUrl: 'modules/concepts/views/search.client.view.html',
        replace: true,
        link: function(scope)
        {
            scope.courseScope = angular.element('.course-view').scope();
            SourceIcon.init(scope.courseScope);

            var getIcon = function(segment)
            {
                var source = scope.courseScope.sourceMap[segment.source];

                if(source)
                {
                    //var sourcetype = scope.courseScope.sourcetypeMap[source.type];
                    return SourceIcon.get(source);
                }
                return '';
            };

            var updateData = function()
            {
                var concepts = angular.copy(scope.concepts).map(function(c)
                {
                    c.type = 'concept';

                    return c;
                });
                var segments = angular.copy(scope.segments).map(function(s)
                {
                    s.type = 'segment';
                    s.icon = getIcon(s);

                    return s;
                });
                scope.searchObjects = concepts.concat(segments);
                scope.numberConcepts = concepts.length;
            };

            updateData();
            scope.$watch('concepts', updateData);
            scope.$watch('segments', updateData);

            scope.searchSelect = function(data, event)
            {
                if(data.type == 'concept')
                {
                    var concept = data;
                    var conceptData = { conceptId: concept._id, conceptTitle: concept.title };
                    Logger.log('ConceptSearchSelect', conceptData, event);

                    $location.search('active', concept._id);
                }
                else if(data.type == 'segment')
                {
                    var segment = data;
                    var segmentData = { segmentId: segment._id, segmentTitle: segment.title };
                    Logger.log('SegmentSearchSelect', segmentData, event);

                    $location.search('segment', segment._id);

                    var conceptsInCourse = [];

                    segment.concepts.forEach(function(conceptId)
                    {
                        var concepts = scope.concepts.filter(function(c)
                        {
                            return c._id == conceptId;
                        });
                        if(concepts.length > 0)
                        {
                            conceptsInCourse.push(conceptId);
                        }
                    });

                    if(conceptsInCourse.length>0)
                    {
                        if(conceptsInCourse.length > 1)
                            console.log('this segment is in two concepts. choosing first one.', segment, conceptsInCourse);

                        $location.search('active', conceptsInCourse[0]);
                    }
                }
            };

            scope.searchUnselect = function($scope)
            {
                Logger.log('ConceptSearchUnSelect', null, event);

                $location.search('active', '');
                $scope.$select.selected = null;
            };

            scope.setSearchConcept = function(concept)
            {
                var el = d3.select('.concept-select');
                el = angular.element(el[0]);
                var select = el.scope().$select ? el.scope().$select : {};

                if(concept)
                {
                    //select.selected = scope.courseScope.activeConcept.concept;
                    var conceptId = concept.concept._id;
                    var concepts = scope.searchObjects.filter(function(obj)
                    {
                        return obj._id == conceptId;
                    });
                    if(concepts.length > 0)
                    {
                        select.selected = concepts[0];
                    }
                }
                else
                {
                    select.selected = null;
                }
            };

            scope.courseScope.$watch('activeConcept', function()
            {
                scope.setSearchConcept(scope.courseScope.activeConcept);
            });


            //console.log(concepts);
            //scope.searchObjects = concepts;
        }
    };
});
