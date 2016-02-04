'use strict';

angular.module('logs').controller('LogsChartController',
    function($scope, $stateParams, $location, Authentication, Log, $interval, Users, $state)
    {
        var setTime = function() { $scope.now = new Date(); };
        setTime();
        $interval(setTime, 1000);

        Log.query({}, function(logs)
        {
            Users.query(function (users)
            {
                $scope.users = users;
                $scope.userMap = {};
                $scope.users.forEach(function(user)
                {
                    $scope.userMap[user._id] = user;

                    if(user.roles.length > 1)
                    {
                        user.isAffiliated = true;
                    }
                });

                $scope.logs = logs.filter(function(log)
                {
                    return !$scope.userMap[log.user].isAffiliated;
                });

                $scope.$watchCollection('logs.downloadedUpdates', function()
                {
                    sortLogs();
                });

                initVis();
            });
        });

        function initVis()
        {
            $scope.data = {
                logs: []
            };

            var dailyLogs = {};

            $scope.logs.map(function(log)
            {
                var date = Date.parse(log.time);
                var day = moment(date).format('YYYY-MM-DD');

                if(!dailyLogs[day])
                {
                    dailyLogs[day] = 1;
                }
                else
                {
                    dailyLogs[day]++;
                }
            });

            for(var day in dailyLogs)
            {
                $scope.data.logs.push({x: new Date(day), y: dailyLogs[day]});
            }

            $scope.options = {
                series: [
                    {
                        axis: "y",
                        dataset: "logs",
                        key: "y",
                        label: "An area series",
                        color: "#1f77b4",
                        type: ['line', 'dot', 'area'],
                        id: 'mySeries0'
                    }
                ],
                axes: {x: {key: "x", type: "date"}}
            };
        }

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
