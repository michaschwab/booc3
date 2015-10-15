'use strict';

angular.module('actions').controller('ActionsController',
    function($scope, $stateParams, $location, Authentication, Actions, $interval, $injector, ModelToServiceMap, Users)
    {
        var setTime = function() { $scope.now = new Date(); };
        setTime();
        $interval(setTime, 1000);

        Actions.query({}, function(actions)
        {
            $scope.actions = actions;
            $scope.$watchCollection('actions.downloadedUpdates', function()
            {
                setAction();
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
            for(var i = 0; i < $scope.actions.length; i++)
            {
                if($scope.actions[i].undone)
                {
                    $scope.positionFirstNotUndone = i;
                }
                else
                    break;
            }
        };

        $scope.undo = function(action)
        {
            if(!action) action = $scope.action;

            if(action.type == 'delete')
            {
                // Bring back
                var data = action.data;

                for(var dataType in data)
                {
                    if(data.hasOwnProperty(dataType) && data[dataType].length > 0)
                    {
                        // dataType is eg LearnedConcept, Conceptdependency, or Concept.
                        data[dataType].forEach(function(entry)
                        {
                            var Service = $injector.get(ModelToServiceMap.map(dataType));
                            var document = new Service(entry);

                            document.$save();
                        });
                    }
                }

                action.undone = true;
                action.undoneDate = Date.now();
                action.$update();
            }
            else if(action.type == 'edit')
            {
                // TODO Undo editing.
                // TODO Replace action.data with the current data, so the data is not lost and it can be redone.
            }
            else if(action.type == 'create')
            {
                // TODO Undo creating.
            }
            setPositionFirstNotUndone();
        };

        $scope.redo = function(action)
        {
            if(!action) action = $scope.action;

            if(action.type == 'delete')
            {
                // Delete again.
                // TODO: that most of the data will automatically be deleted by just deleting 1 of the documents,
                // e.g. this will try to manually delete conceptdependencies that are already automatically being deleted because of the deletion of the concept.
                var data = action.data;

                for(var dataType in data)
                {
                    if(data.hasOwnProperty(dataType) && data[dataType].length > 0)
                    {
                        // dataType is eg LearnedConcept, Conceptdependency, or Concept.
                        data[dataType].forEach(function(entry)
                        {
                            var Service = $injector.get(ModelToServiceMap.map(dataType));
                            var document = new Service(entry);

                            document.$remove();
                        });
                    }
                }

                action.undone = false;
                //$scope.action.undoneDate = Date.now();
                action.$update();
            }
            else if(action.type == 'edit')
            {
                // TODO Redo editing.
                // TODO Replace action.data with the previous data, so it can be undone.
            }
            else if(action.type == 'create')
            {
                // TODO Redo creating.
            }
            setPositionFirstNotUndone();
        };

        function setAction()
        {
            $scope.actions.map(function(action)
            {
                action.date = new Date(action.time);
            });

            $scope.actions = $scope.actions.sort(function(a, b)
            {
                return b.date.getTime() - a.date.getTime();
            });

            if($scope.actions.length)
            {
                var action = $scope.actions[0];

                $scope.action = action;
                if(typeof action.date != 'object') action.date = new Date(action.time);
            }
        }
    });
