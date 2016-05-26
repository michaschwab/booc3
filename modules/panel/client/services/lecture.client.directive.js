'use strict';

angular.module('concepts').directive('lecture', function() {
    return {
        restrict: "E",
        scope: {
            lecture: '='
        },
        templateUrl: 'modules/panel/views/lecture.client.view.html',
        replace: true
    };
});
