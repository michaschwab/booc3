'use strict';

// Courses controller
angular.module('tags').controller('TagsController',
    function($scope, Tag, $state, $stateParams, Sources, Sourcetypes)
    {
        $scope.find = function()
        {
            Sourcetypes.query(function(sourcetypes)
            {
                $scope.sourcetypeMap = LookupObject(sourcetypes);
            });

            Sources.query(createSourceByTagMap);

            $scope.tags = Tag.query();
        };

        var createSourceByTagMap = function(sources)
        {
            $scope.sources = sources;
            $scope.sourcesByTagMap = {};

            sources.forEach(function(source)
            {
                if(source.tags && source.tags.length)
                {
                    source.tags.forEach(function(tagId)
                    {
                        if(!$scope.sourcesByTagMap[tagId])
                            $scope.sourcesByTagMap[tagId] = [];

                        $scope.sourcesByTagMap[tagId].push(source);
                    });
                }
            });
        };

        $scope.editPrep = function()
        {
            if($stateParams.tagId)
            {
                $scope.tag = Tag.get({ tagId: $stateParams.tagId });
                $scope.tagId = $stateParams.tagId;

                Sourcetypes.query(function(sourcetypes)
                {
                    $scope.sourcetypeMap = LookupObject(sourcetypes);
                });

                $scope.sources = Sources.query(createSourceByTagMap);
            }
            else
            {
                $scope.tag = {};
            }
        };

        $scope.removeFromSource = function(source, tag)
        {
            source.tags.splice(source.tags.indexOf(tag._id), 1);



            source.$update(function()
            {
                console.log($scope.sources);
                createSourceByTagMap($scope.sources);
            });
        };

        $scope.$watch('tag.icon', function()
        {
            // This is to make sure pasting the <i class="em em-aquarius"></i> code from emoji-css works and is translated into just the css.
            var pattern = /<i class="([a-z0-9-_ ]+)"><\/i>/i;

            if($scope.tag && $scope.tag.icon)
            {
                var found = $scope.tag.icon.match(pattern);

                if(found && found.length)
                {
                    if(found[1])
                    {
                        $scope.tag.icon = found[1];
                    }
                }
            }
        });

        $scope.create = function()
        {
            var tag = new Tag($scope.tag);

            tag.$save(function(response)
            {
                $state.go('tags.list');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.error(errorResponse);
            });
        };

        $scope.update = function()
        {
            $scope.tag.$update(function()
            {
                $state.go('tags.list');
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                console.error($scope.error);
            });
        };
    });
