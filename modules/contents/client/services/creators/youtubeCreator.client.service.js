angular.module('contents').service('YoutubeCreator', function(ytapi, youtubeEmbedUtils, $http, FileUploader, $window, $timeout)
{
    var me = this;
    var $scope = null;

    this.start = function(scope)
    {
        $scope = scope;

        $scope.youtubeRegex = /^(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)(?:#.?)?/;

        $scope.youtubeVidId = 0;
        $scope.player = null;

        function setupZipUploader()
        {
            $scope.uploader = new FileUploader({
                url: 'api/sources/lectureZip'
            });

            $scope.cancelUpload = function ()
            {
                $scope.uploader.clearQueue();
                //$scope.zipURL = $scope.user.profileImageURL;
            };

            $scope.uploader.onSuccessItem  = function (fileItem, response, status, headers)
            {
                // Show success message
                $scope.success = true;

                // Populate user object
                //$scope.user = Authentication.user = response;
                console.log('yup');

                // Clear upload buttons
                $scope.cancelUpload();
            };

            $scope.uploader.onAfterAddingFile = function (fileItem)
            {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            $scope.zipURL = fileReaderEvent.target.result;
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

            $scope.uploadLectureZip = function(element)
            {
                if(element.files.length == 1)
                {
                    var file = element.files[0];
                    $scope.uploader.addToQueue(file);
                }
            };
        }

        setupZipUploader();

        $scope.$watch('source.path', function(url)
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
        }, true);

        $scope.$on('youtube.player.ready', function ($event, player) {
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
        });
    };

    this.getCurrentPosition = function()
    {
        return parseInt($scope.player.getCurrentTime());
    };

    this.stop = function()
    {

    };

    return (this);
})
.factory('ytapi', ['$http',
    function($http) {

        return function(ytId)
        {
            var key = 'AIzaSyApPbZ2aiheb-WkX2kgg_NI9CxSsU7vN0Y';
            var url = 'https://www.googleapis.com/youtube/v3/videos?key='+key+'&part=snippet,contentDetails,statistics,status&id='+ytId;

            return $http.get(url);
        };
    }
]);
