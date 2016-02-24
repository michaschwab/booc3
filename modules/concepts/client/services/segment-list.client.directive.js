'use strict';

angular.module('concepts').directive('segmentList', function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            segments: '=',
            parent: '=',
            concept: '='
        },
        templateUrl: 'modules/concepts/views/panel/segment-list.client.view.html',
        replace: true,
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
                scope.courseScope = angular.element('.course-view').scope();
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        }
    };
});
