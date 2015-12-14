angular.module('learning').service('YoutubePlayer', function($http, $sce, $interval, $timeout)
{
    var me = this;
    var $scope;

    var player;

    this.start = function(scope)
    {
        $scope = scope;
        //console.log('hi');
        this.waitForPlayerReady();

        return this;
    };

    this.getPosition = function()
    {
        return !player ? -1 : player.getCurrentTime();
    };

    this.setPosition = function(pos)
    {
        return player.seekTo(pos);
    };

    var resizeTimeout;
    this.manageSize = function()
    {
        $timeout.cancel(resizeTimeout);

        resizeTimeout = $timeout(function()
        {
            me.setSize($scope.contentWidth - 30);
        }, 200);
    };

    var tries = 0;
    this.setSize = function(goalWidth, goalHeight)
    {
        var vidPlayer = d3.select('#videoPlayer');
        if(!vidPlayer.empty())
        {
            if(!goalHeight) goalHeight = goalWidth * 0.6;
            vidPlayer.transition()
                .style('width', goalWidth + 'px')
                .style('height', goalHeight + 'px')
                .each('end', function()
                {
                    $scope.videoWidth = goalWidth;
                    $scope.safeApply();
                });
        } else if(tries < 5)
        {
            tries++;
            $timeout(function() { me.setSize(goalWidth); }, 50);
        }
    };

    this.waitForPlayerReady = function()
    {
        $scope.$on('youtube.player.ready', function ($event, thePlayer) {
            console.log('player ready');
            player = thePlayer;
            //player.playVideo();
            $scope.player = player;
            //$scope.scale = 0.1;
        });
    };

    this.play = function()
    {
        if(player)
        {
            player.playVideo();
        }
    };


    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        var start = segment === null ? 0 : segment.start;
        //var vidData = $sce.trustAsResourceUrl(source.path + '#t=' + start);
        var vidData = source.path + '#t=' + start;
        //console.log(source.path + '#t=' + start);
        //console.log(vidData);
        console.log(vidData);

        callback({video: vidData });
    };
});
