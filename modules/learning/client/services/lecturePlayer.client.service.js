angular.module('learning').service('LecturePlayer', function(YoutubePlayer, LectureSlidePlayer, $timeout)
{
    var me = this;
    var $scope;

    this.start = function(scope)
    {
        $scope = scope;

        YoutubePlayer.start($scope);
        LectureSlidePlayer.start($scope);

        return this;
    };

    var resizeTimeout;

    this.manageSize = function()
    {
        $timeout.cancel(resizeTimeout);

        resizeTimeout = $timeout(function()
        {
            console.log('resizing learning content', $scope.contentWidth);
            YoutubePlayer.setSize($scope.contentWidth/3 - 15);
            LectureSlidePlayer.setSize($scope.contentWidth*2/3 - 15);

        }, 400);
    };

    this.setSize = function()
    {

    };

    this.play = function()
    {

    };

    this.stop = function()
    {

    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        YoutubePlayer.parseSegmentSourceData(source, sourcetype, segment, callback);
    };

});
