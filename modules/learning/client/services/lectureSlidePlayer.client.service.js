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
        interval1 = $interval(me.synchronizeSlide, 1000);

        $scope.pdfWidth = $scope.contentWidth*2/3;
        lastSlidePdf = '';

        PdfPlayer.start($scope);

        return this;
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


    this.synchronizeSlide = function()
    {
        var time = YoutubePlayer.getPosition();

        if(time !== -1)
        {
            var slidePdf = me.getSlideFromVidTime(time, $scope.active.source.data.timestamps);

            if(!slidePdf || slidePdf.substr(slidePdf.length - 3).toLowerCase() !== 'pdf')
            {
                slidePdf = '/modules/learning/img/noSlide.pdf';
            }

            if(lastSlidePdf !== slidePdf)
            {
                lastSlidePdf = slidePdf;

                //this.parseDocumentSegmentSourceData = function(path, callback)
                me.parseDocumentSegmentSourceData(slidePdf, function(pdfData)
                {
                    $scope.sourceData.document = pdfData;
                });
            }
        }
    };

    this.parseDocumentSegmentSourceData = function(path, callback)
    {
        PdfPlayer.parseDocumentSegmentSourceData(path, callback);
    };

    this.getSlideFromVidTime = function(time, timestamps)
    {

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
    };




});
