angular.module('contents').service('PdfCreator', function(ytapi, youtubeEmbedUtils, $http, FileUploader, $window, $timeout, $sce)
    {
        var me = this;
        var $scope = null;

        this.start = function(scope)
        {
            $scope = scope;

            $scope.player = null;
            $scope.source.data = {};
            $scope.sourceData = {};

            function setupPdfUploader()
            {
                $scope.uploader = new FileUploader({
                    url: 'api/sources/pdf'
                });

                $scope.cancelUpload = function ()
                {
                    $scope.uploader.clearQueue();
                    //$scope.zipURL = $scope.user.profileImageURL;
                };

                $scope.uploader.onSuccessItem  = function (fileItem, response, status, headers)
                {
                    // Show success message
                    $scope.uploadSuccess = true;

                    $scope.source.path = response.fileName;
                    me.updatePdfPath();


                    /*var segments = response.segments;
                    var timestamps = response.timestamps;

                    segments.forEach(function(segment)
                    {
                        if(!me.checkSegmentExists($scope.segments, segment))
                        {
                            $scope.segments.push(segment);
                        }
                    });

                    $scope.source.data.timestamps = timestamps;*/

                    $scope.cancelUpload();
                };

                $scope.uploader.onAfterAddingFile = function (fileItem)
                {
                    if ($window.FileReader) {
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(fileItem._file);

                        fileReader.onload = function (fileReaderEvent) {
                            $timeout(function () {
                                //$scope.zipURL = fileReaderEvent.target.result;
                                //console.log($scope.zipURL);

                                $scope.uploader.uploadAll();
                            }, 0);
                        };
                    }
                };

                $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                    // Clear upload buttons
                    $scope.cancelUpload();

                    // Show error message
                    console.error(response.message);
                };

                $scope.uploadPdf = function(element)
                {
                    if(element.files.length == 1)
                    {
                        var file = element.files[0];
                        $scope.uploader.addToQueue(file);
                    }
                };
            }

            setupPdfUploader();

            /*$scope.$watch('source.path', function(url)
            {
                if(url !== undefined && url !== '' && url !== {})
                {
                    var videoid = youtubeEmbedUtils.getIdFromURL(url);
                    //var videoid = url.match(/^(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)(?:#.?)?/);
                    if(videoid !== null)
                    {
                        $scope.youtubeVidId = videoid;
                        $scope.youtubeUrl = url;

                        ytapi($scope.youtubeVidId).success(function(data)
                        {
                            var title = data.items[0].snippet.title;

                            if(!$scope.source.title)
                            {
                                $scope.source.title = title;
                            }
                        }).error(function(lala) {
                            console.log(lala);
                        });


                    } else {
                        console.log('The youtube url is not valid.');
                    }
                }
            }, true);*/

            /*$scope.$on('youtube.player.ready', function ($event, player) {
                console.log('player ready');
                player.playVideo();
                $scope.player = player;
                //$scope.scale = 0.1;
            });

            $scope.$watch('activeTypeReadableId', function()
            {
                if($scope.activeTypeReadableId === 'youtube')
                {
                    $scope.unit = 's';
                }
                else if($scope.activeTypeReadableId === 'book' || $scope.activeTypeReadableId === 'presentation')
                {
                    $scope.unit = '';
                }
            });*/
        };

        this.updatePdfPath = function()
        {
            me.parseDocumentSegmentSourceData('./modules/contents/uploads/pdf/' + $scope.source.path, function(pdfData)
            {
                $scope.sourceData.document = pdfData;
            });
        };

        this.parseDocumentSegmentSourceData = function(path, callback)
        {
            // If local file, display. Otherwise, use CORS Proxy for loading.
            var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('http://','') : path;

            $http.get(url, {responseType:'arraybuffer'}).
            //$http.get('http://www.corsproxy.com/' + source.path.replace('http://',''), {responseType:'arraybuffer'}).
            //success(function(data, status, headers, config) {
            success(function(data) {

                var file = new Blob([data], {type: 'application/pdf'});
                var fileURL = URL.createObjectURL(file);

                var result = $sce.trustAsResourceUrl(fileURL);

                callback(result);
            });
            //callback({video: vidData });
        };

        /*this.isLecture = function()
        {
            return $scope.uploadSuccess;
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
        };*/

        return (this);
    });
