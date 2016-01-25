angular.module('conceptdependencies').controller('FeedbackModalController',
    function ($scope, Courses, $modalInstance, $http, Authentication, $stateParams, $location, Logger)
    {
        //$scope.dependency = dependency;
        $scope.feedbackMode = 'course';
        $scope.technicalProblemOn = false;
        $scope.anonymousOn = true;
        $scope.course = null;
        $scope.courses = Courses.query({}, function()
        {
            var courseId = $stateParams.courseId;
            if(courseId)
            {
                $scope.course = $scope.courses.filter(function(c) { return c._id == courseId; })[0];
            }
        });
        $scope.courseContent = '';
        $scope.websiteContent = '';
        $scope.authentication = Authentication;

        function getFeedbackData()
        {
            var feedback = { type: $scope.feedbackMode, anonymous: $scope.anonymousOn };

            if($scope.feedbackMode == 'course')
            {
                feedback.course = $scope.course;
                feedback.content = $scope.courseContent;
            }
            else if($scope.feedbackMode == 'website')
            {
                feedback.technical = $scope.technicalProblemOn;
                feedback.content = $scope.websiteContent;
            }
            feedback.locationPath = $location.path();
            feedback.locationSearch = JSON.stringify($location.search());

            return feedback;
        }

        $scope.ok = function(event)
        {
            var feedback = getFeedbackData();

            Logger.log('FeedbackModalCancel', feedback, event);
            $http.post('/api/feedback/send', feedback).success(function (response) {
                /*$scope.credentials = null;
                $scope.success = response.message;*/

            }).error(function (response) {
                /*$scope.credentials = null;
                $scope.error = response.message;*/
            });

            $modalInstance.close();
        };

        $scope.cancel = function(event)
        {
            var feedback = getFeedbackData();

            Logger.log('FeedbackModalCancel', feedback, event);
            $modalInstance.dismiss();
        };
    });
