angular.module('courses').service('SeenDataManager', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure, ActiveDataManager)
{
    var me = this;
    var $scope;
    var tour;
    var user = Authentication.user;

    this.init = function(scope)
    {
        $scope = scope;

        //$scope.seenMapByConcept = {};
        $scope.isSeen = this.isSeen;

        $scope.$watchCollection('seen.downloadedUpdates', function()
        {
            me.updateSeenMap();
        });
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

        //ActiveDataManager.updatePlan();
        ActiveDataManager.updateAttributes();
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
            return ($scope.seenMapByConcept && $scope.seenMapByConcept[d.concept._id]);
        }
    };
});
