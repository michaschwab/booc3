'use strict';

angular.module('concepts').directive('concept', function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {
            concept: '='
        },
        templateUrl: 'modules/panel/views/concept.client.view.html',
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
