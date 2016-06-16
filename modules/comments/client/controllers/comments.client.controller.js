'use strict';

angular.module('comments').controller('CommentsController',
    function($scope, Comment, Concepts, $stateParams, Authentication, Courses)
    {
        $scope.authentication = Authentication;

        $scope.find = function()
        {
            var conceptId = $stateParams.conceptId;
            var courseId = $stateParams.courseId;
            var userId = Authentication.user._id;

            $scope.concept = Concepts.get({conceptId: conceptId});
            $scope.comments = Comment.query();
            $scope.course = Courses.get({courseId: courseId});

            var newComment = {};
            newComment.course = courseId;
            newComment.concept = conceptId;
            newComment.user = userId;

            $scope.newComment = newComment;
        };
        
        $scope.submitComment = function()
        {
            var comment = new Comment($scope.newComment);
            comment.$save();
            $scope.newComment.content = '';
        };

        $scope.remove = function(comment)
        {
            comment.$remove();
        };
    });
