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

    this.waitForPlayerReady = function()
    {
        $scope.$on('youtube.player.ready', function ($event, thePlayer) {
            console.log('player ready');
            player = thePlayer;
            player.playVideo();
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
