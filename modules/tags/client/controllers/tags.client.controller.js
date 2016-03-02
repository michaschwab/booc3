'use strict';

// Courses controller
angular.module('tags').controller('TagsController',
    function($scope, Tag, $state, $stateParams)
    {
        $scope.find = function()
        {
            $scope.tags = Tag.query();
        };

        $scope.editPrep = function()
        {
            if($stateParams.tagId)
            {
                // todo: load from db and fill $scope.tag with it
                $scope.tag = Tag.get({ tagId: $stateParams.tagId });
            }
            else
            {
                $scope.tag = {};
            }
        };

        $scope.create = function()
        {
            var tag = new Tag($scope.tag);

            tag.$save(function(response)
            {
                $state.go('tags.list');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.error(errorResponse);
            });
        };

        $scope.update = function()
        {
            $scope.tag.$update(function()
            {
                $state.go('tags.list');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.error($scope.error);
            });
        };
    });
