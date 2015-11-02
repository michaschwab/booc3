angular.module('learning').service('LearnHelper', function($http, $sce, $interval, $timeout)
{
    var me = this;

    this.getSourcePosition = function(sourcetype, player)
    {
        if(sourcetype.title === 'Youtube')
        {
            return parseFloat(player.getCurrentTime());
        }
        else if(sourcetype.title === 'Presentation')
        {
            //return currentPosition;
            //todo
            console.log('todo');
        }
        else if(sourcetype.title === 'Lecture Video' || sourcetype.title === 'Lecture')
        {
            var vidPlayer = document.querySelector('#videoPlayer');
            return vidPlayer === null ? null : vidPlayer.currentTime;
        }
        else if(sourcetype.title === 'Wikipedia Article')
        {
            //todo
        }
        else if(sourcetype.category === 'lti')
        {

        }
        else
        {
            console.log('what sourcetype is this??');
            console.log(sourcetype);
        }
        return -1;
    };

    this.setSourcePosition = function(scope, sourcetype, player, position)
    {
        if(sourcetype.title === 'Youtube')
        {
            return parseFloat(player.getCurrentTime());
        }
        else if(sourcetype.title === 'Presentation')
        {
            //return currentPosition;
            //todo
            console.log('todo');
        }
        else if(sourcetype.title === 'Lecture Video')
        {
            document.querySelector('#videoPlayer').currentTime = position;
        }

        else if(sourcetype.title === 'Lecture')
        {
            var player = document.querySelector('#videoPlayer');
            if(player !== null)
            {
                player.currentTime = position;
            }
        }
        else if(sourcetype.title === 'LTI')
        {

        }
        else if(sourcetype.title === 'Wikipedia Article')
        {

        }
        else
        {
            console.log('what sourcetype is this??');
            console.log(sourcetype);
        }

        this.setPosition(scope, player, sourcetype);
    };

    this.pauseSource = function(sourcetype)
    {
        if(!sourcetype) return;

        if(sourcetype.title === 'Lecture')
        {
            var player = document.querySelector('#videoPlayer');
            if(player !== null)
            {
                player.pause();
            }
        }
    };

    this.playSource = function(sourcetype)
    {
        if(!sourcetype) return;

        if(sourcetype.title === 'Lecture')
        {
            var player = document.querySelector('#videoPlayer');
            if(player !== null)
            {
                player.play();
            }else
            {
                //console.log('player not found');
                $timeout(function() { me.playSource(sourcetype); }, 100);
            }
        }
    };

    this.getSourceEnd = function(source, player, totalPages)
    {
        if(source.type.title === 'youtube')
        {
            return parseFloat(player.getDuration());
        }
        else if(source.type.title === 'Presentation')
        {
            return totalPages;
        }
        else if(source.type.title === 'Lecture Video')
        {
            return document.querySelector('#videoPlayer').duration;
        }

        return -1;
    };

    var synchInterval;

    this.synchronizePosition = function(scope, player, sourcetype)
    {
        $interval.cancel(synchInterval);
        synchInterval = $interval(function() { me.setPosition(scope, player, sourcetype); }, 300);
    };

    this.setPosition = function(scope, player, sourcetype)
    {
        scope.currentPosition = me.getSourcePosition(sourcetype, player);
    };

    this.parseDocumentSegmentSourceData = function(path, callback)
    {
        // If local file, display. Otherwise, use CORS Proxy for loading.
        var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('http://','') : path;


        console.log(url);
        $http.get(url, {responseType:'arraybuffer'}).
            //$http.get('http://www.corsproxy.com/' + source.path.replace('http://',''), {responseType:'arraybuffer'}).
            //success(function(data, status, headers, config) {
            success(function(data) {

                var file = new Blob([data], {type: 'application/pdf'});
                var fileURL = URL.createObjectURL(file);

                var result = $sce.trustAsResourceUrl(fileURL);

                callback(result);
            });
    };

    this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
    {
        //console.log(sourcetype.category);
        if(sourcetype.category === 'Document')
        {
            this.parseDocumentSegmentSourceData(source.path, callback);
        }
        else if(sourcetype.category === 'video-document')
        {
            var start = segment === null ? 0 : segment.start;
            var vidData = $sce.trustAsResourceUrl(source.data.vidPath + '#t=' + start);

            callback({video: vidData });
        }
        else if(sourcetype.category === 'Video')
        {
            //$scope.segment.source.path = $sce.trustAsResourceUrl($scope.segment.source.path);
            callback($sce.trustAsResourceUrl(source.path + '#t=' + segment.start));
        }
        else if(sourcetype.category === 'website')
        {
            var url = source.path;
            if(url.substr(0,7) == 'http://')
            {
                url = 'https://' + url.substr(7);
            }
            callback({path: $sce.trustAsResourceUrl(url) });
        }
        else if(sourcetype.category === 'lti')
        {
            var path = source.path;
            var params = {
                lti_message_type: 'basic-lti-launch-request',
                lti_version: 'LTI-1p0',
                resource_link_id: 'coursircle-test-01'
            };
            /*
            for(var key in params)
            {
                path += '&' + key + '=' + params[key];
            }
            console.log(path);

            //var url = path.indexOf('http') !== -1 ? 'http://www.corsproxy.com/' + path.replace('https://','') : path;
            var url = 'http://whateverorigin.org/get?url=' + encodeURIComponent(path) + '&callback=JSON_CALLBACK';
*/

            //path = 'https://www.edu-apps.org/tools/place_kitten/index.html';
            callback({ path: $sce.trustAsResourceUrl(source.path) });
            /*
            $http.post(source.path).success(function(data)
            {
                //console.log(data);
                callback({ data: data });
            }).error(function(err)
            {
                console.log(err);
            });*/

        }
        else
        {
            console.log('source type not detected!');
        }
    };

    this.getSegmentSourcePure = function(segment, callback)
    {
        if(typeof segment.source === 'string')
        {
            SourceLoader.getById(segment.source, function(source)
            {
                callback(source);
            });
        }
        else if(typeof segment.source === 'object')
        {
            callback(segment.source);
        }
        else
        {
            console.log('invalid segment source type');
        }
    };

    this.manageKeyBindings = function($scope)
    {
        $('body').keydown(function (e)
        {
            if(e.which === 27) // Esc
            {
                $scope.minimizeGraph();
            }
            else if(e.which === 71) // G
            {
                $scope.expandGraph();
            }
        });
    };

    this.getSlideFromVidTime = function(time, timestamps)
    {
        time = parseInt(time);
        var slide = 0;
        var bestTime = 0;

        for(var i = 0; i < timestamps.length; i++)
        {
            if(time > timestamps[i].time && timestamps[i].time > bestTime)
            {
                bestTime = timestamps[i].time;
                slide = timestamps[i].slidepdf;
            }
        }

        return slide;
    };


    return (this);
});
