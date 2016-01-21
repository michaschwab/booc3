angular.module('courses').service('SeenDataManager', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure, SeenConcepts)
{
    var me = this;
    var $scope;
    var tour;
    var user = Authentication.user;
    var automarked = [];
    var seenListeners = [];

    this.addSeenListener = function(listener)
    {
        seenListeners.push(listener);
    };

    this.init = function(scope, onUpdate)
    {
        $scope = scope;

        //$scope.seenMapByConcept = {};
        $scope.isSeen = this.isSeen;

        $scope.seeConcept = function(conceptId)
        {
            if(!conceptId) conceptId = $scope.activeConcept.concept._id;
            var concept = $scope.directories.concepts[conceptId];

            if(concept.children && concept.children.length)
            {
                concept.children.forEach(function(child)
                {
                    $scope.seeConcept(child.concept._id);
                });
            }
            else
            {
                if (!$scope.seenMapByConcept[conceptId])
                {
                    var data = {};
                    data.concept = conceptId ? conceptId : $scope.activeConcept.concept._id;
                    data.course = $scope.course._id;

                    var seen = new SeenConcepts(data);
                    seen.$save({restrictToUserIds: [user._id]});
                }
            }
            me.updateSeenMap();
        };

        $scope.unseeConcept = function(conceptId)
        {
            me.updateSeenMap();

            if(!conceptId) conceptId = $scope.activeConcept.concept._id;
            var concept = $scope.directories.concepts[conceptId];

            if(concept.children && concept.children.length)
            {
                concept.children.forEach(function(child)
                {
                    $scope.unseeConcept(child.concept._id);
                });
            }
            else
            {
                if ($scope.seenMapByConcept[conceptId])
                {
                    var seen = $scope.seenMapByConcept[conceptId];
                    seen.$remove();
                    automarked.push(conceptId);
                }
                else {
                    console.log('cant unsee concept ' + conceptId + ' because it doesnt seem to be marked as seen.');
                }
            }
            me.updateSeenMap();
        };

        $scope.$watchCollection('seen.downloadedUpdates', function()
        {
            me.updateSeenMap();
            if(onUpdate)
            {
                onUpdate();
            }
        });
    };

    this.checkSeen = function()
    {
        if($scope.learnMode
            && $scope.activeConcept
            && $scope.seenMapByConcept
            && !$scope.seenMapByConcept[$scope.activeConcept.concept._id]
            && (!$scope.activeConcept.children || !$scope.activeConcept.children.length)
            && automarked.indexOf($scope.activeConcept.concept._id) === -1 /* to prevent it from auto marking as seen many times, even after manually marking as unseen */)
        {
            //console.log('gotta mark concept ', $scope.activeConcept.concept._id,  ' as seen');
            automarked.push($scope.activeConcept.concept._id);

            $scope.seeConcept();
        }
        else
        {
            //console.log($scope.learnMode, $scope.activeConcept, $scope.seenMapByConcept);
        }
    };

    this.updateSeenMap = function()
    {
        $scope.seenMap = {};
        $scope.seenMapByConcept = {};

        if($scope.seen)
        {
            $scope.seen.forEach(function(seenConcept)
            {
                $scope.seenMap[seenConcept._id] = seenConcept;
                $scope.seenMapByConcept[seenConcept.concept] = seenConcept;
            });
        }

        //ActiveDataManager.updateAttributes();

        seenListeners.forEach(function(listener)
        {
            listener();
        });
    };

    this.isSeen = function(d)
    {
        if(d.children && d.children.length)
        {
            var isSeen = true;

            for(var i = 0; i < d.children.length; i++)
            {
                if(!this.isSeen(d.children[i]))
                {
                    isSeen = false;
                }
            }

            return isSeen;
        }
        else
        {
            if(Object.keys($scope.seenMapByConcept).length === 0) return false;

            return $scope.seenMapByConcept[d.concept._id] !== undefined && $scope.seenMapByConcept[d.concept._id] !== null;
        }
    };
});
