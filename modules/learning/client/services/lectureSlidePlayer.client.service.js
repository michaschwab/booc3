angular.module('learning').service('LectureSlidePlayer', function(YoutubePlayer, $interval, $timeout, $http, $sce, PdfPlayer)
{
    var me = this;
    var $scope;

    var player;
    var interval1;
    var lastSlidePdf;

    this.start = function(scope)
    {
        $scope = scope;
        interval1 = $interval(me.synchronize, 1000);

        $scope.pdfWidth = $scope.contentWidth*2/3;
        updateSize();
        lastSlidePdf = '';

        PdfPlayer.start($scope);

        $scope.$watch('contentWidth', updateSize);
        $scope.$watch('contentHeight', updateSize);

        return this;
    };

    var updateSize = function()
    {
        //$scope.pdfWidth = $scope.contentWidth*2/3;
        $scope.pdfHeight = $scope.contentHeight;
    };

    this.play = function()
    {

    };

    this.stop = function()
    {
        $interval.cancel(interval1);
    };

    this.setSize = function(goalWidth, goalHeight)
    {
        PdfPlayer.setSize(goalWidth, goalHeight);
    };

    this.setSizeQuick = function(goalWidth, goalHeight)
    {
        PdfPlayer.setSizeQuick(goalWidth, goalHeight);
    };

    this.synchronize = function()
    {
        // First, check if the user last did a change on the slides, or on the video.
        // If the user eg switched slides recently, then the video should be updated, and not the pdf viewer.

        var videoInteraction = YoutubePlayer.getLastUserInteractionTime();
        var slideInteraction = $scope.lastUserChosenPdfPage;
        //console.log(videoInteraction > slideInteraction, videoInteraction, slideInteraction);

        if(videoInteraction > slideInteraction)
        {
            me.synchronizeSlide();
        }
        else
        {
            me.synchronizeVideo();
        }
    };

    this.synchronizeVideo = function()
    {
        // TODO: Possibly: Get slide number, move video to correct position.


        // Then, make sure the pdf html object is reloaded to switch pages
        /*var slidePdf = $scope.sourceData.pdfPath;
        $scope.sourceData.pdfPath = '';
        $timeout(function()
        {
            $scope.sourceData.pdfPath = slidePdf;
        }, 1000);*/
    };

    var lastSlideNumber = -1;
    this.synchronizeSlide = function()
    {
        var time = YoutubePlayer.getPosition();

        if(time !== -1)
        {
            var slidePdf = me.getSlidePdfFromVidTime(time, $scope.active.source);

            if(!slidePdf || slidePdf.substr(slidePdf.length - 3).toLowerCase() !== 'pdf')
            {
                slidePdf = '/modules/learning/img/noSlide.pdf';
            }
            var slideNumber = me.getSlideNumberFromVidTime(time, $scope.active.source);

            if(lastSlidePdf !== slidePdf)
            {
                lastSlidePdf = slidePdf;

                //this.parseDocumentSegmentSourceData = function(path, callback)
                me.parseDocumentSegmentSourceData(slidePdf, function(pdfData)
                {
                    $scope.sourceData.document = pdfData;
                    $scope.sourceData.pdfPath = slidePdf;
                    $scope.sourceData.slideNumber = slideNumber;
                    $scope.pdfSwitchToPage(slideNumber);
                });
            }
            else
            {
                //console.log(lastSlideNumber,slideNumber);
                if(lastSlideNumber != slideNumber)
                {
                    $scope.pdfSwitchToPage(slideNumber);
                    $scope.sourceData.slideNumber = slideNumber;

                    // Resetting the pdf path, so the document is re-loaded because otherwise it doesnt change pages.
                    /*$scope.sourceData.pdfPath = '';
                    $timeout(function()
                    {
                        $scope.sourceData.pdfPath = slidePdf;
                    }, 1000);*/
                }
            }
            lastSlideNumber = slideNumber;
        }
    };

    this.parseDocumentSegmentSourceData = function(path, callback)
    {
        PdfPlayer.parseDocumentSegmentSourceData(path, callback);
    };

    this.getSlidePdfFromVidTime = function(time, source)
    {
        var data = source.data;

        if(data.slideTimestamps)
        {
            // In case the slides are in one single pdf
            return './modules/contents/uploads/slides/' + source._id + '_merged.pdf';
        }
        else
        {
            // In case the slides are in one pdf each

            var timestamps = data.timestamps;
            time = parseInt(time);
            var slide = timestamps[0].slidepdf;
            var bestTime = 0;

            //console.log(time, timestamps);
            for(var i = 0; i < timestamps.length; i++)
            {
                if(time > timestamps[i].time && timestamps[i].time > bestTime)
                {
                    bestTime = timestamps[i].time;
                    slide = timestamps[i].slidepdf;
                }
            }
            //console.log(slide);

            return './modules/contents/uploads/slides/' + slide;
        }
    };

    this.getSlideNumberFromVidTime = function(time, source)
    {
        var data = source.data;

        if(data.slideTimestamps)
        {
            // In case the slides are in one single pdf
            var timestamps = data.slideTimestamps;
            time = parseInt(time);
            var slideNumber = 0;
            var bestTime = 0;

            //console.log(time, timestamps);
            for(var i = 0; i < timestamps.length; i++)
            {
                if(time > timestamps[i].time && timestamps[i].time > bestTime)
                {
                    bestTime = timestamps[i].time;
                    slideNumber = timestamps[i].slideNumber;
                }
            }

            return slideNumber;
            //console.log(slideNumber);
        }
        else
        {
            // In case the slides are in one pdf each
            return 1;
        }
    };




});
