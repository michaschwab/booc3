angular.module('learning').service('LecturePlayer', function(YoutubePlayer, LectureSlidePlayer, $timeout)
{
    var me = this;
    var $scope;

    var slideWidthPercent = 62;

    this.start = function(scope)
    {
        $scope = scope;
        $scope.dragXstart = 0;
        $scope.synchingPdfVideo = true;

        YoutubePlayer.start($scope);
        LectureSlidePlayer.start($scope);
        //console.log('lectureplayer start');

        $scope.onSetProgress = function(progress, $event)
        {
            // Checking if this functionality is already provided by the learn controller
            if($scope.setPositionPercent)
            {
                $scope.setPositionPercent(progress);
            }
        };

        $scope.toggleSynchronization = function()
        {
            $scope.synchingPdfVideo = !$scope.synchingPdfVideo;
        };

        $timeout(me.setupDragResizer, 2000);

        return this;
    };

    this.setupDragResizer = function()
    {
        $('.slides-video-divider').mousedown(function(e)
        {
            e.preventDefault();

            $scope.dragXstart = e.pageX;
        });

        var onDrag = function(e)
        {
            e.preventDefault();

            var relX = e.pageX - $scope.dragXstart;


            var relPercent = relX / $scope.contentWidth;
            slideWidthPercent += relPercent * 100;
        };

        $(document).mousemove(function(e)
        {
            if($scope.dragXstart !== 0)
            {
                onDrag(e);

                $scope.dragXstart = e.pageX;
                me.manageSizeExecute(true);
            }
        })
        .mouseup(function(e)
        {
            if($scope.dragXstart !== 0)
            {
                onDrag(e);

                $scope.dragXstart = 0;
                me.manageSizeExecute();
            }
        });
    };

    var resizeTimeout;

    this.manageSize = function()
    {
        $timeout.cancel(resizeTimeout);

        resizeTimeout = $timeout(me.manageSizeExecute, 200);
    };

    this.manageSizeExecute = function(quick)
    {
        //console.log('managing size', $scope.contentWidth * slideWidthPercent / 100 - 15);
        YoutubePlayer.setSize($scope.contentWidth * (1-slideWidthPercent/100) - 15);

        //if(quick)
        {
            LectureSlidePlayer.setSizeQuick($scope.contentWidth * slideWidthPercent / 100 - 15);
        }
        /*else
        {
            // There seems to be some problem with the setSize method of the pdfPlayer.
            LectureSlidePlayer.setSize($scope.contentWidth * slideWidthPercent / 100 - 15);
        }*/
    };

    this.setSize = function()
    {

    };

    this.getPosition = function()
    {
        return YoutubePlayer.getPosition();
    };

    this.setPosition = function(pos)
    {
        return YoutubePlayer.setPosition(pos);
    };

    this.play = function()
    {

    };

    this.stopPlay = function()
    {
        return YoutubePlayer.stopPlay();
    };

    this.pausePlay = function()
    {
        return YoutubePlayer.pausePlay();
    };

    this.stop = function()
    {
        LectureSlidePlayer.stop();
        YoutubePlayer.stop();
    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        YoutubePlayer.parseSegmentSourceData(source, sourcetype, segment, callback);
    };

});
