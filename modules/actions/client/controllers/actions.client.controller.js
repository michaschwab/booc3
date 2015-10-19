'use strict';

angular.module('actions').controller('ActionsController',
    function($scope, $stateParams, $location, Authentication, Actions, $interval, Undo, Users)
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
                setPositionFirstNotUndone();
            });

            Users.query(function (users)
            {
                $scope.users = users;
                $scope.userMap = {};
                $scope.users.forEach(function(user) { $scope.userMap[user._id] = user; });
            });
        });

        // Find position of last undo
        var setPositionFirstNotUndone = function()
        {
            $scope.positionFirstNotUndone = -1;
            var lastUndoneTime = -1;

            for(var i = 0; i < $scope.actions.length; i++)
            {
                var undoneTime = new Date($scope.actions[i].undoneDate).getTime();

                if($scope.actions[i].undone && undoneTime > lastUndoneTime)
                {
                    $scope.positionFirstNotUndone = i;
                    lastUndoneTime = undoneTime;
                }
                else
                    break;
            }
        };

        $scope.undo = function(action)
        {
            Undo.undo(action);
            setPositionFirstNotUndone();
        };

        $scope.redo = function(action)
        {
            Undo.redo(action);
            setPositionFirstNotUndone();
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
    });
