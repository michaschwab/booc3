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
                    return ($scope.userMap[log.user]) && (!$scope.userMap[log.user].isAffiliated);
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
            $scope.data = {};

            function getAccumulative(data)
            {
                var dailyData = {};

                data.map(function(log)
                {
                    var date = Date.parse(log.time);
                    var day = moment(date).format('YYYY-MM-DD');

                    if(!dailyData[day])
                    {
                        dailyData[day] = 1;
                    }
                    else
                    {
                        dailyData[day]++;
                    }
                });

                var list = [];
                for(var day in dailyData)
                {
                    list.push({x: new Date(day), y: dailyData[day]});
                }

                return list;
            }

            $scope.data.totalLogs = getAccumulative($scope.logs);
            $scope.data.tourYes = getAccumulative($scope.logs.filter(function(log) { return log.action == 'TourYes'}));
            $scope.data.tourNo = getAccumulative($scope.logs.filter(function(log) { return log.action == 'TourNo'}));
            $scope.data.tourFinish = getAccumulative($scope.logs.filter(function(log) { return log.action == 'TourFinish'}));

            $scope.options = {
                series: [
                    {
                        axis: "y",
                        dataset: "totalLogs",
                        key: "y",
                        label: "Total Logs",
                        color: "#1f77b4",
                        type: ['line', 'dot'],
                        id: 'mySeries0'
                    },
                    {
                        axis: "y",
                        dataset: "tourYes",
                        key: "y",
                        label: "Tour Accepted",
                        color: "#333366",
                        type: ['line', 'dot'],
                        id: 'touryes'
                    },
                    {
                        axis: "y",
                        dataset: "tourNo",
                        key: "y",
                        label: "Tour Declined",
                        color: "#663333",
                        type: ['line', 'dot'],
                        id: 'tourno'
                    },
                    {
                        axis: "y",
                        dataset: "tourFinish",
                        key: "y",
                        label: "Tour Finish",
                        color: "#336633",
                        type: ['line', 'dot'],
                        id: 'tourfinish'
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
