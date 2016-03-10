'use strict';

angular.module('concepts').directive('segmentList', function(RecursionHelper, $timeout) {
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
            return RecursionHelper.compile(element, function(scope, el){
                scope.courseScope = angular.element('.course-view').scope();

                /*scope.courseScope.$watch('activeMode', function(mode)
                {
                    var isAdmin = mode == 'admin';

                    if(!isAdmin)
                    {
                        //el.select('ul.alternative-segments')attrs.$set('autoplay', newVal);
                        $timeout(function()
                        {
                            console.log(el);
                            console.log(el.children('ul.alternative-segments'));
                            el.children('ul.alternative-segments').sortable('cancel');
                        }, 1000);

                    }

                });*/
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        }
    };
});
