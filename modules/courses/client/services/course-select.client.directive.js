angular.module('courses')
    .directive('courseSelect', function() {

        function link($scope, element, attrs)
        {
            //console.log(attrs, $scope);

            $scope.onChange = function(course)
            {
                if(attrs.ngChange)
                {
                    $scope[attrs.ngChange](course);
                }
            }
        }

        return {
            restrict: 'E',
            templateUrl: 'modules/courses/views/course-select.client.view.html',
            link: link
        };
    });
