angular.module('contents').service('ExtensionSchoolCreator', function($sce)
    {
        var me = this;
        var $scope = null;

        this.start = function(scope)
        {
            $scope = scope;

            //https://matterhorn.dce.harvard.edu/engage/player/watch.html?id=800b7d16-6d94-4770-884b-513e2377cbd4

            $scope.extSchoolRegex = /^(?:https?:\/{2})?([^\s&]+)harvard\.edu\/engage\/player\/watch.html\?id=([^\s&]+)(?:#.?)?/;

            $scope.youtubeVidId = 0;
            $scope.player = null;
            $scope.source.data = {};

            $scope.pathUpdate = function()
            {
                //console.log($scope.source.path);
                if($scope.source.path)
                {
                    $scope.sourceData = $sce.trustAsResourceUrl($scope.source.path);
                }
            }
        };


        this.getCurrentPosition = function()
        {
            return parseInt($scope.player.getCurrentTime());
        };

        this.stop = function()
        {

        };

        this.checkSegmentExists = function(segments, segment)
        {
            var titles = segments.map(function(s) { return s.title; });

            if(titles.indexOf(segment.title) ===-1)
            {
                return false;
            }
            else
            {
                var titleMatchingSegments = segments.filter(function(s)
                {
                    return s.title == segment.title;
                });

                for(var i = 0; i < titleMatchingSegments.length; i++)
                {
                    // If even the start time matches, this is definitely the same.

                    if(titleMatchingSegments[i].start == segment.start)
                    {
                        return true;
                    }
                }

                return false;
            }
        };

        return (this);
    });
