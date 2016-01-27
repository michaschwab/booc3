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
        $scope.xFrameProblem = false;
        $scope.isHttps = false;

        $scope.$watch('source.path', function(path)
        {
            if(path)
            {
                $scope.sourceData = $sce.trustAsResourceUrl(path);

                childScope = angular.element('.websiteCreateFormDiv').scope();

                $scope.websiteEmbedPossible = false;
                $scope.isHttps = path.substr(0,5) === 'https';

                if($scope.isHttps)
                {
                    $http.get('/api/websiteIsEmbeddable?url=' + path).then(function(response)
                    {
                        if(response && response.data && response.data === 'yes')
                        {
                            $scope.websiteEmbedPossible = true;
                        }
                        else
                        {
                            $scope.xFrameProblem = true;
                            childScope.websiteEmbed = false;
                        }
                    }, function(error)
                    {
                        console.error(error);
                        childScope.websiteEmbed = false;
                    });
                }
            }
        }, true);

        $scope.$watchCollection('segments', function()
        {
            if($scope.segments && $scope.segments.length == 1)
            {
                var segment = $scope.segments[0];
                $scope.activeSegment = segment;
                //console.log('doing stuff with my website segment..');

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
