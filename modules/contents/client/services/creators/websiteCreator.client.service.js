angular.module('contents').service('WebsiteCreator', function($http, $sce)
{
    var me = this;
    var $scope = null;
    var childScope;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.websiteEmbed = false;
        $scope.websiteEmbedPossible = false;
        $scope.urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

        $scope.$watch('source.path', function(path)
        {
            if(path)
            {
                $scope.sourceData = $sce.trustAsResourceUrl(path);

                childScope = angular.element('.websiteCreateFormDiv').scope();

                $scope.websiteEmbedPossible = path.substr(0,5) === 'https';

                if(!$scope.websiteEmbedPossible)
                {
                    //todo somehow this has no effect
                    childScope.websiteEmbed = false;
                }
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

    this.beforeSave = function()
    {
        $scope.source.data = { embed: childScope.websiteEmbed };
    };

    this.getCurrentPosition = function()
    {
        return 0;
    };

    this.getEndPosition = function()
    {
        return 0;
    };

    this.stop = function()
    {

    };

    return (this);
});
