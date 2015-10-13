angular.module('conceptdependencies').controller('FeedbackModalController',
    function ($scope, Courses, $modalInstance)
    {
        //$scope.dependency = dependency;
        $scope.feedbackMode = 'course';
        $scope.technicalProblemOn = false;
        $scope.course = null;
        $scope.courses = Courses.query();

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });
