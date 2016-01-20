angular.module('contents').service('LectureCreator', function($http)
{
    var me = this;
    var $scope = null;

    this.start = function(scope)
    {
        $scope = scope;
        $scope.source.data = {};

        $scope.xmlUrlRegex = /^(?:https?:\/{2})?(?:w{3}\.)?.*?\.xml$/;

        //$scope.$watch('source.path', me.updatePath);
        $scope.updatePath = function()
        {
            var path = $scope.source.path;

            if(path)
            {
                $http.get($scope.source.path).success(function (data)
                {
                    if(!data)
                    {
                        console.log('problem loading the xml');
                    }
                    else
                    {
                        var time, url;
                        var p = data.presentation;
                        var toc = p.hour.toc.entry;
                        //console.log(p);
                        //console.log(toc);
                        var vidUrl = p.hour.clipSequence.clip.rtmpLink;
                        var vidDuration = p.hour.clipSequence.clip.durationInSeconds;
                        var lecturePath = $scope.source.path.substr(0,$scope.source.path.lastIndexOf('/'));
                        lecturePath = lecturePath.substr(0,lecturePath.lastIndexOf('/')) + '/';

                        var slideFrames = p.hour.timestamps.slide;
                        var timestamps = [];

                        function addPdfPath(time)
                        {
                            return function(data)
                            {
                                var slideBodySrc = $(data).find("#slideBody")[0];

                                if (slideBodySrc !== undefined) {

                                    var slidePdf= slideBodySrc.src.replace(/http:\/\/[a-z.]+(:[0-9]+)?\//g, lecturePath + 'materials/');

                                    timestamps.push({
                                        time: time,
                                        slidepdf: slidePdf
                                    });
                                }
                            }
                        }

                        for(var i = 0; i < slideFrames.length; i++)
                        {
                            time = slideFrames[i].timeInSeconds;
                            url = lecturePath + slideFrames[i].url;

                            $http.get(url).success(addPdfPath(parseInt(time)));
                        }

                        $scope.source.data.timestamps = timestamps;


                        if($scope.source.data.vidPath === undefined || $scope.source.data.vidPath === '')
                        {
                            var newPath = $scope.source.path.substr(0,$scope.source.path.lastIndexOf('/'));
                            $scope.source.data.vidPath = newPath.substr(0,newPath.lastIndexOf('/')) + '/' + vidUrl;
                            $scope.player = document.getElementById('videoPlayer');
                        }
                        for(i = 0; i < toc.length; i++)
                        {
                            time = parseInt(toc[i].timeInSeconds);
                            var seg = {
                                title: toc[i].text,
                                start: time
                            };

                            if(!me.checkSegmentExists($scope.segments, seg))
                            {
                                $scope.segments.push(seg);

                                if(i > 0)
                                {
                                    $scope.segments[i-1].end = time - 1;
                                }
                            }
                            else
                            {
                                console.log('not adding segment');
                            }
                        }
                        $scope.segments[$scope.segments.length-1].end = parseInt(vidDuration);
                    }

                }).error(function(err)
                {
                    console.log(err);
                });
            }
        };
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
