angular.module('contents').service('WebsiteCreator', function($http, $sce)
{
    var me = this;
    var $scope = null;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

        $scope.$watch('source.path', function(path)
        {
            console.log('aaaa');
            if(path)
            {
                $scope.sourceData = $sce.trustAsResourceUrl(path);
                /*console.log(path);
                $http.get(path).success(function(response)
                {
                    console.log(response);
                }).error(function(error)
                {
                    console.log(error);
                });*/

            }
        }, true);

        $scope.$watchCollection('segments', function()
        {
            if($scope.segments && $scope.segments.length == 1)
            {
                var segment = $scope.segments[0];
                $scope.activeSegment = segment;
                console.log('doing stuff with my website segment..');

                segment.conceptObjects = segment.conceptObjects.concat($scope.allConcepts.filter(function(c)
                {
                    return segment.concepts.indexOf(c._id) !== -1 && segment.conceptObjects.indexOf(c) === -1;
                }));

            }
            else if($scope.segments.length === 0)
            {
                $scope.segments.push({concepts: [], conceptObjects:[]});
            }
            else
            {
                console.log('dont know what to do with ', $scope.segments.length , 'website segments');
            }
        });

    };

    this.getCurrentPosition = function()
    {
        return 0;
    };

    this.stop = function()
    {

    };

    return (this);
});
