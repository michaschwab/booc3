angular.module('learning').service('YoutubePlayer', function($http, $sce, $interval, $timeout)
{
    var me = this;
    var $scope;

    var player;
    var currentTime = 0;
    var currentState = '';
    var lastUserInteraction = 0;
    var lastSystemChange = 0;

    this.start = function(scope)
    {
        $scope = scope;
        //console.log('hi');
        this.waitForPlayerReady(function()
        {
            // Youtube seems to only provide time in a 500ms window, so it doesn't work to check more often.
            $interval(me.checkStateTime, 500);
        });

        $scope.playerVars = {autoplay: 0};

        return this;
    };

    var lastCurrentTime = 0;
    var lastState = '';

    this.checkStateTime = function()
    {
        currentTime = !player ? -1 : player.getCurrentTime();

        if(lastCurrentTime == currentTime)
            currentState = 'paused';
        else
            currentState = 'playing';

        if(lastState != currentState)
        {
            var now = Date.now();
            //todo these 2s are just assuming the video loads this quickly, so its dependant on the internet connection.
            // there should be a better way to detect user interaction.
            if(now - lastSystemChange < 2000)
            {
                // if this change is detected very shortly after the system ordered a change, it's probably not a user interaction.
            }
            else
            {
                //console.log('before', lastState, 'now', currentState, 'time since last system change', now - lastSystemChange);
                lastUserInteraction = Date.now();
            }

            lastState = currentState;
        }

        lastCurrentTime = currentTime;
    };

    this.getLastUserInteractionTime = function()
    {
        return lastUserInteraction;
    };

    this.stop = function()
    {
        //console.log('stopping');
        player = null;
    };

    this.getPosition = function()
    {
        //return !player ? -1 : player.getCurrentTime();
        return currentTime;
    };

    this.setPosition = function(pos, pause)
    {
        //console.error('setting pos to ', pos, ' and pausing? :', pause);

        lastSystemChange = Date.now();

        if(player && player.f)
        {
            try {
                player.seekTo(pos);

                // TODO This makes it look like the player is not ready because it freezes on the loading screen.
                // TODO Gotta show a different image so it doesn't look broken.

                if(currentState != 'playing' || pause)
                {
                    $timeout(function()
                    {
                        lastSystemChange = Date.now();
                        player.pauseVideo();
                    }, 200);
                }
                //player.pauseVideo();
                //$timeout(me.pausePlay, 200);
                //if(currentState == 'playing')
                    //player.pauseVideo();
            } catch (e) {
                console.error('Something wrong with the youtube player', e);
            }
        }
        else
        {
            console.log('player not ready to set position.');
        }
    };

    var resizeTimeout;
    this.manageSize = function()
    {
        $timeout.cancel(resizeTimeout);

        resizeTimeout = $timeout(function()
        {
            me.setSize($scope.contentWidth - 10, $scope.contentHeight - 45);
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
            $timeout(function() { me.setSize(goalWidth, goalHeight); }, 50);
        }
    };

    this.waitForPlayerReady = function(cb)
    {
        $scope.$on('youtube.player.ready', function ($event, thePlayer) {
            console.log('player ready');
            player = thePlayer;
            //player.playVideo();
            $scope.player = player;
            cb();
            //$scope.scale = 0.1;
        });
    };

    this.play = function()
    {
        lastSystemChange = Date.now();
        if(player)
        {
            console.log('wtf');
            player.playVideo();
        }
    };

    this.pausePlay = function()
    {
        lastSystemChange = Date.now();
        if(player && player.f && (currentState == 'playing' ||  currentState == ''))
        {
            try {
                player.pauseVideo();
                //console.log('stopped');
            } catch (e)
            {
                console.error('Something wrong with the youtube player', e, player);
            }
        }
    };

    this.stopPlay = function()
    {
        lastSystemChange = Date.now();
        if(player && player.f)
        {
            try {
                player.stopVideo();
                //console.log('stopped');
            } catch (e)
            {
                console.error('Something wrong with the youtube player', e, player);
            }
        }
    };


    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        var start = segment === null ? 0 : segment.start;
        //var vidData = $sce.trustAsResourceUrl(source.path + '#t=' + start);
        var vidData = source.path + '#t=' + start;
        //console.log(source.path + '#t=' + start);
        //console.log(vidData);
        //console.log(vidData);

        callback({video: vidData });
    };
});
