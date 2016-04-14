angular.module('contents').service('WebsiteCreator', function($http, $sce, $timeout)
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

        var pathUpdateCount = 0;

        var pathUpdate = function()
        {
            var path = $scope.source.path;

            if(path)
            {
                childScope = angular.element('.websiteCreateFormDiv').scope();
                if(!childScope)
                {
                    // DOM not ready.
                    return $timeout(pathUpdate, 100);
                }

                pathUpdateCount++;

                $scope.sourceData = $sce.trustAsResourceUrl(path);

                $scope.websiteEmbedPossible = false;
                $scope.isHttps = path.substr(0,5) === 'https';

                //TODO if not https, check if https available.
                if(!$scope.isHttps)
                {
                    $http.get('/api/websiteHasHttpsVersion?url=' + path).then(function(response)
                    {
                        if (response && response.data && response.data === 'yes')
                        {
                            $scope.source.path = path.replace('http:', 'https:');
                            $scope.isHttps = true;
                        }
                    });
                }

                if($scope.isHttps)
                {
                    $http.get('/api/websiteIsEmbeddable?url=' + path).then(function(response)
                    {
                        if(response && response.data && response.data === 'yes')
                        {
                            $scope.websiteEmbedPossible = true;

                            if(pathUpdateCount != 1 || !$scope.source.created) // Only set if the path has actually changed, and not just loaded from the db.
                                childScope.websiteEmbed = true;
                            else
                                childScope.websiteEmbed = $scope.source.data.embed;
                        }
                        else
                        {
                            $scope.xFrameProblem = true;
                            childScope.websiteEmbed = false;
                            $scope.websiteEmbedPossible = false;
                        }
                    }, function(error)
                    {
                        console.error(error);
                        childScope.websiteEmbed = false;
                    });
                }
            }
        };
        $scope.$watch('source.path', pathUpdate, true);

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
        if(childScope && childScope.websiteEmbed !== undefined)
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
