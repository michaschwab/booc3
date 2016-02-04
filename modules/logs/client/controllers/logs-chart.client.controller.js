'use strict';

angular.module('logs').controller('LogsChartController',
    function($scope, $stateParams, $location, Authentication, Log, $interval, Users, $state, LogActions, RandomString)
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

            var actions = LogActions.getArray();

            var addData = function(data, label)
            {
                var id = RandomString.get();

                $scope.data[id] = getAccumulative(data);
                $scope.options.series.push({
                    axis: "y",
                    dataset: id,
                    key: "y",
                    label: label,
                    color: "#" + RandomString.getHex(6),
                    type: ['line', 'dot'],
                    id: id
                });
            };

            $scope.options = {
                series: [],
                axes: {x: {key: "x", type: "date"}}
            };

            addData($scope.logs, "Total Logs");

            function actionLogs(action)
            {
                return $scope.logs.filter(function(log) { return log.action == action});
            }

            actions.forEach(function(action)
            {
                addData(actionLogs(action), action);
            });
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
