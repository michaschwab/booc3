'use strict';

angular.module('logs').controller('LogsController',
    function($scope, $stateParams, $location, Authentication, Log, $interval, Users, $state)
    {
        var setTime = function() { $scope.now = new Date(); };
        setTime();
        $interval(setTime, 1000);

        Log.query({}, function(logs)
        {
            $scope.logs = logs;
            $scope.$watchCollection('logs.downloadedUpdates', function()
            {
                sortLogs();
            });

            Users.query(function (users)
            {
                $scope.users = users;
                $scope.userMap = {};
                $scope.users.forEach(function(user) { $scope.userMap[user._id] = user; });
            });
        });

        // Find position of last undo

        function sortLogs()
        {
            $scope.logs.map(function(log)
            {
                log.date = new Date(log.time);
            });

            $scope.logs = $scope.logs.sort(function(a, b)
            {
                return b.date.getTime() - a.date.getTime();
            });
        }
    });
