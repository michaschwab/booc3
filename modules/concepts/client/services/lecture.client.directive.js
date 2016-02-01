'use strict';

angular.module('concepts').directive('lecture', function() {
    return {
        restrict: "E",
        scope: {
            lecture: '='
        },
        templateUrl: 'modules/concepts/views/panel/lecture.client.view.html',
        replace: true
    };
});
