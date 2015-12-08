angular.module('learning').service('YoutubePlayer', function($http, $sce, $interval, $timeout)
{
    var me = this;
    var $scope;

    this.start = function(scope)
    {
        $scope = scope;
        console.log('hi');
        this.waitForPlayerReady();
    };

    this.waitForPlayerReady = function()
    {
        $scope.$on('youtube.player.ready', function ($event, player) {
            console.log('player ready');
            player.playVideo();
            $scope.player = player;
            //$scope.scale = 0.1;
        });
    };


});
