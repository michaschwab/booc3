angular.module('contents').service('WikiCreator', function($http, $sce)
{
    var me = this;
    var $scope = null;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.wikiRegex = /^(?:https?:\/{2})?(?:(w{3}|en)\.)?wikipedia.org\/(w|wiki)\/([^\s&]+)?/;

        $scope.$watch('source.path', function(path)
        {
            if(path)
            {
                $scope.sourceData = $sce.trustAsResourceUrl(path);

                path.match($scope.wikiRegex);
                var title = RegExp.$3;

                var url = 'http://en.wikipedia.org/w/api.php?action=query&titles='+title+'&redirects&format=json&callback=JSON_CALLBACK';

                $http.jsonp(url).success(function(response)
                {
                    //console.log(response);
                    var info = response.query.normalized[0];
                    if(info && !$scope.source.title)
                    {
                        $scope.source.title = info.to;
                    }
                });

                //http://en.wikipedia.org/w/api.php?action=query&titles=Newtons_laws&redirects&format=json
            }
        }, true);

        $scope.$watchCollection('segments', function()
        {
            if($scope.segments && $scope.segments.length == 1)
            {
                var segment = $scope.segments[0];
                $scope.activeSegment = segment;
                console.log('doing stuff with my wiki segment..');

                /*segment.conceptObjects = segment.conceptObjects.concat($scope.allConcepts.filter(function(c)
                {
                    return segment.concepts.indexOf(c._id) !== -1;
                }));*/

            }
            else
            {
                console.log('dont know what to do with ', $scope.segments.length , 'wiki segments');
            }
        });

    };

    this.stop = function()
    {

    };

    return (this);
});
