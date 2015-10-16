'use strict';

angular.module('actions').controller('UndoMessageController',
    function($scope, $stateParams, $location, Authentication, Actions, $interval, $injector, ModelToServiceMap, Undo)
{
    var setTime = function() { $scope.now = new Date(); };
    setTime();
    $interval(setTime, 1000);

    Actions.query({}, function(actions)
    {
        $scope.actions = actions;

        $scope.$watchCollection('actions.downloadedUpdates', function()
        {
            sortActions();
            setAction();
        });
    });

    $scope.undo = function()
    {
        Undo.undo($scope.action);
    };

    $scope.redo = function()
    {
        Undo.redo($scope.action);
    };

    function sortActions()
    {
        $scope.actions.map(function(action)
        {
            action.date = new Date(action.time);
        });

        $scope.actions = $scope.actions.sort(function(a, b)
        {
            return b.date.getTime() - a.date.getTime();
        });
    }

    function setAction()
    {
        if($scope.actions.length)
        {
            var action = $scope.actions[0];

            $scope.action = action;
            if(typeof action.date != 'object') action.date = new Date(action.time);
        }
    }
});
