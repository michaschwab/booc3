'use strict';

angular.module('comments').controller('CommentsController',
    function($scope, Comment)
    {
        $scope.find = function()
        {
            $scope.comments = Comment.query();
        };
    });
