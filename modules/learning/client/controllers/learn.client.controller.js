'use strict';

// Segments controller
angular.module('learning').controller('LearnController',
    function($scope, $stateParams, $location, $timeout, Concepts, Segments, Sources, Sourcetypes, $interval, LearnHelper, $window, ConceptStructure, Courses, YoutubePlayer, LectureSlidePlayer, LecturePlayer, WebsitePlayer, PdfPlayer, WikiPlayer, LtiPlayer, ExtensionSchoolPlayer)
    {
        var me = this;
        $scope = angular.element('.course-view').scope();
        var lastUpdate;

        var updateTimeout;
        var lastPlayer = '';

        this.update = function()
        {
            $timeout.cancel(updateTimeout);

            var doUpdate = function()
            {
                $scope.waitLoadingPlayer = false;
                lastUpdate = Date.now();
                setupMaterial();
                $scope.setActiveLearnMaterial();
                checkPlayPause();
            };
            if($stateParams.learn === 'yes')
            {
                doUpdate();
            }
            else
            {
                // Don't show player if it's not the same one as the last one, eg if it has to be loaded.
                // Also dont load if no source type is defined yet.
                $scope.waitLoadingPlayer = !$scope.active.sourcetype || lastPlayer != $scope.active.sourcetype.player;

                lastPlayer = $scope.active.sourcetype ? $scope.active.sourcetype.player : '';
                $timeout(doUpdate, 800);
            }
        };

        $scope.$on('dataReady', me.update);

        var player = null;
        var lastSourceType = '';

        this.updateCurrentPlayers = function()
        {
            if($scope.active.sourcetype != lastSourceType)
            {
                lastSourceType = $scope.active.sourcetype;

                me.stop();

                if($scope.active.sourcetype.title === 'Lecture')
                {
                    player = LecturePlayer.start($scope);
                }
                else if($scope.active.sourcetype.title === 'YouTube')
                {
                    player = YoutubePlayer.start($scope);
                }
                else if($scope.active.sourcetype.title == 'Website')
                {
                    player = WebsitePlayer.start($scope);
                }
                else if($scope.active.sourcetype.title == 'Wikipedia Article')
                {
                    player = WikiPlayer.start($scope);
                }
                else if($scope.active.sourcetype.title == 'PDF')
                {
                    player = PdfPlayer.start($scope);
                }
                else if($scope.active.sourcetype.title == 'LTI')
                {
                    player = LtiPlayer.start($scope);
                }
                else if($scope.active.sourcetype.title == 'Harvard Extension School')
                {
                    player = ExtensionSchoolPlayer.start($scope);
                }
            }

            me.manageSize();

        };

        this.play = function()
        {
            if(player && player.stop)
                player.play();
        };

        this.stop = function()
        {
            if(player && player.stop)
                player.stop();
        };

        $scope.launch = function()
        {
            //$scope.activeMode = $stateParams.lectureId === undefined ? 'hierarchy': 'lecture';
            //console.log($scope.activeMode);
            $scope.courseId = $stateParams.courseId;

            //var searchParams = $location.search();

            $scope.sourceData = {};
            $scope.conceptObjectDirectory = {};
            $scope.lastSourceId = '';

        };

        function checkPlayPause()
        {
            if(!$scope.learnMode)
            {
                ///LearnHelper.pauseSource($scope.active.sourcetype);
            }
            else
            {
                //LearnHelper.playSource($scope.active.sourcetype);
            }
        }

        /*$scope.$watch('learnMode', checkPlayPause);
        $scope.$watch('active.sourcetype', checkPlayPause);
*/

        this.parseSegmentSourceData = function(source, sourcetype, segment, callback)
        {
            if(player.parseSegmentSourceData)
                player.parseSegmentSourceData(source, sourcetype, segment, callback);
        };

        this.stopPlay = function()
        {
            if(player && player.stopPlay)
                player.stopPlay();
        };

        this.updatePosition = function()
        {
            if(player.getPosition)
            {
                var newPosition = $scope.active.segment ? $scope.active.segment.start : 0;
                //var position = player.getPosition();

                // Activating the next line would only make the content jump to the beginning of a Segment if the current position is not already within it.
                // if(position < $scope.active.segment.start || position > $scope.active.segment.end)
                {
                    player.setPosition(newPosition);
                }
            }
        };

        $scope.setActiveLearnMaterial = function()
        {
            if(!$scope.active.source) return;

            me.updateCurrentPlayers();
            me.stopPlay();

            if($scope.active.source._id !== $scope.lastSourceId)
            {
                $scope.lastSourceId = $scope.active.source._id;
                $scope.sourceData = {};

                me.parseSegmentSourceData($scope.active.source, $scope.active.sourcetype, $scope.active.segment, function(data)
                {
                    //console.log(data);
                    data.sourceId = $scope.active.source._id;
                    $scope.sourceData = angular.extend($scope.sourceData, data);

                    me.manageSize();

                    $timeout(me.manageSize, 1000);
                    $timeout(me.manageSize, 2000);
                    $timeout(me.manageSize, 5000);

                    //LearnHelper.synchronizePosition($scope, $scope.player, $scope.active.sourcetype);
                });
            }
            else
            {
                // Just update position.
                me.updatePosition();
            }
        };
/*
        $scope.ensureSourceAtCorrectPosition = function()
        {
            // First, check whether still in the correct source.

            $scope.sources.filter(function(source) { return source._id === $scope.active.segment.source }).forEach(function(activeSource)
            {
                if($scope.sourceData.sourceId === activeSource._id)
                {
                    // Check whether the position is correct.
                    var pos = $scope.currentPosition;

                    if(pos < $scope.active.segment.start || pos > $scope.active.segment.end)
                    {
                        console.log('gotta change source position!');

                        LearnHelper.setSourcePosition($scope, $scope.active.sourcetype, document.querySelector('#videoPlayer'), $scope.active.segment.start);
                        //document.querySelector('#videoPlayer').currentTime = $scope.active.segment.start;
                    }
                }
                else if($scope.sourceData.sourceId !== undefined)
                {
                    // Get the correct source.
                    console.log($scope.sourceData.sourceId, activeSource._id, activeSource);
                    console.log('gotta get the correct source - not coded yet.');

                    /!*LearnHelper.parseSegmentSourceData($scope.active.source, $scope.active.sourcetype, $scope.active.segment, function(data)
                    {
                        data.sourceId = $scope.active.source._id;
                        $scope.sourceData = angular.extend($scope.sourceData, data);

                        //LearnHelper.synchronizePosition($scope, $scope.active.source, $scope.player);
                    });*!/

                    //$scope.active.source = activeSource;
                }
            });
        };*/

        var interval1, interval2;

        var setupMaterial = function()
        {
            if($scope.active.sourcetype)
            {
                $scope.$on('$destroy', function()
                {
                    $interval.cancel(interval1);
                    $interval.cancel(interval2);
                });
                $interval.cancel(interval1);
                $interval.cancel(interval2);

                var player = $scope.active.sourcetype.player;

                if(player === 'video')
                {
                    $scope.$on('$destroy', function()
                    {
                        var vidPlayer = document.getElementById('videoPlayer');
                        if(vidPlayer)
                        {
                            vidPlayer.src = '';
                            document.querySelector('#videoPlayer source').src = '';
                        }
                    });

                    //interval1 = $interval(synchronizeSlide, 1000);
                    interval2 = $interval(checkWithinSegment, 1000);
                }
            }

        };

        var lastSlidePdf = '';
/*
        function synchronizeSlide()
        {
            if($scope.player === undefined || $scope.player === null)
            {
                $scope.player = document.getElementById('videoPlayer');
            }

            var slidePdf = LearnHelper.getSlideFromVidTime($scope.currentPosition, $scope.active.source.data.timestamps);
            if(!slidePdf || slidePdf.substr(slidePdf.length - 3).toLowerCase() !== 'pdf')
            {
                slidePdf = '/modules/learning/img/noSlide.pdf';
            }

            if(lastSlidePdf !== slidePdf)
            {
                lastSlidePdf = slidePdf;

                //this.parseDocumentSegmentSourceData = function(path, callback)
                LearnHelper.parseDocumentSegmentSourceData(slidePdf, function(pdfData)
                {
                    $scope.sourceData.document = pdfData;
                });
            }

            //$scope.currentPosition = LearnHelper.getSourcePosition($scope.active.sourcetype, $scope.player);
        }*/

        function checkWithinSegment()
        {
            if(!$scope.learnMode) return;

            $scope.currentPosition = player.getPosition();

            if(lastUpdate > Date.now() - 5000)
            {
                // if something was updated within the last few seconds, you don't want the concept to be auto updated.
                return;
            }

            var pos = $scope.currentPosition;

            if(pos < $scope.active.segment.start || pos > $scope.active.segment.end)
            {
                //console.log('Left segment', $scope.active.segment, ' at position ', pos);
                //console.log('Let\'s see in which segment we are now..');

                $scope.segments.filter(function(segment) {
                    return segment.source === $scope.active.source._id // has to be the same source
                        && segment.start <= pos && segment.end >= pos;
                }).forEach(function(newSegment)
                {
                    //console.log('new segment found!');
                    //console.log(newSegment);

                    var conceptId = newSegment.concepts[0];

                    $scope.segmentId = newSegment;
                    $scope.conceptId = conceptId;

                    //$location.search('concept', conceptId);
                    $location.search('active', conceptId);
                    $location.search('segment', newSegment._id);
                });
            }
        }

        $scope.$on('$locationChangeSuccess', me.update);
        $scope.$on('$locationChangeSuccess', me.update);

        /*$scope.pdfWidth = $scope.contentWidth*2/3;
        $scope.wikiWidth = $scope.contentWidth - 30;*/

        /*var tries = 0;
        this.setVideoWidth = function(goalWidth)
        {
            var vidPlayer = d3.select('#videoPlayer');
            if(!vidPlayer.empty())
            {
                vidPlayer.transition()
                    .style('width', goalWidth + 'px')
                    .each('end', function()
                    {
                        $scope.videoWidth = goalWidth;
                        $scope.safeApply();
                    });
            } else if(tries < 5)
            {
                tries++;
                $timeout(function() { me.setVideoWidth(goalWidth); }, 50);
            }
        };*/

        /*this.setPdfWidth = function(goalWidth)
        {
            var start = $scope.pdfWidth;
            var distance = start - goalWidth;
            var viewer = $('#viewer');
            viewer.animate({ width: goalWidth }, {progress: function(promise, remaining)
            {
                //$scope.courseScope.panelWidth = start - remaining * distance;
                $scope.pdfWidth = start - remaining * distance;

                $scope.safeApply();
            }});
        };*/


        this.manageSize = function()
        {
            if(player && player.manageSize)
                player.manageSize();
        };

        $scope.$watch('contentWidth', function()
        {
            me.manageSize();
        });

        var w = angular.element($window);
        $scope.windowHeight = $window.innerHeight;
        $scope.windowWidth = $window.innerWidth;
    });
