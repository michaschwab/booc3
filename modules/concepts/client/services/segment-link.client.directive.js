'use strict';

angular.module('concepts').directive('segmentLink', function(SourceIcon) {
    return {
        restrict: "E",
        scope: {
            concept: '=',
            segment: '='
        },
        transclude: true,
        templateUrl: 'modules/concepts/views/panel/segment-link.client.view.html',
        replace: true,
        link: function(scope)
        {
            scope.courseScope = angular.element('.course-view').scope();
            SourceIcon.init(scope.courseScope);
            scope.source = scope.courseScope.sourceMap[scope.segment.source];

            if(scope.source)
            {
                scope.sourcetype = scope.courseScope.sourcetypeMap[scope.source.type];
            }

            scope.icon = SourceIcon.get(scope.source);
            // Define your normal link function here.
            // Alternative: instead of passing a function,
            // you can also pass an object with
            // a 'pre'- and 'post'-link function.
        }
    };
});
