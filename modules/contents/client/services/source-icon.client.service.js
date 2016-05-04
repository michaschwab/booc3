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

        if(!sourcetype)
        {
            return console.error('couldnt find source type for source type id ' + source.type, ' given by source ', source);
        }
        var icon = sourcetype.icon;

        if(sourcetype.player == 'website')
        {
            if(!source.data || !source.data.embed)
            {
                icon = 'fa fa-external-link';

                var extension = source.path.substr(source.path.lastIndexOf('.')+1).toLowerCase();

                var archives = ['zip', 'rar', 'gz'];
                var textFiles = ['txt'];
                var pdfFiles = ['pdf'];
                var files = archives.concat(textFiles, pdfFiles);

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
                if(pdfFiles.indexOf(extension) !== -1)
                {
                    // It's a pdf file
                    icon = 'fa fa-file-pdf-o';
                }
            }
        }

        return icon;
    };

    return (this);
});
