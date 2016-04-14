angular.module('contents').service('SourceIcon', function()
{
    var $scope;

    this.init = function(scope)
    {
        $scope = scope;
    };

    this.get = function(source)
    {
        if(!source)
        {
            return;
        }

        var sourcetype = $scope.sourcetypeMap[source.type];
        var icon = sourcetype.icon;

        if(sourcetype.player == 'website')
        {
            if(!source.data || !source.data.embed)
            {
                icon = 'fa fa-external-link';
            }
        }

        return icon;
    };

    return (this);
});
