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

                var extension = source.path.substr(source.path.lastIndexOf('.')+1);

                var archives = ['zip', 'rar', 'gz'];
                var textFiles = ['txt'];
                var files = archives.concat(textFiles);

                if(files.indexOf(extension) !== -1)
                {
                    // It's a file
                    icon = 'fa fa-file-o';
                }

                if(archives.indexOf(extension) !== -1)
                {
                    // It's an archive
                    icon = 'fa fa-file-archive-o';
                }
                if(textFiles.indexOf(extension) !== -1)
                {
                    // It's a text file
                    icon = 'fa fa-file-text-o';
                }
            }
        }

        return icon;
    };

    return (this);
});
