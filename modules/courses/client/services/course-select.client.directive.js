angular.module('courses')
    .directive('courseSelect', function() {
        return {
            restrict: 'E',
            templateUrl: 'modules/courses/views/course-select.client.view.html'
        };
    });
