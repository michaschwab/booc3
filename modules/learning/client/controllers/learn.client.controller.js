'use strict';

// Segments controller
angular.module('learning').controller('LearnController',
    function($scope, $stateParams, $location, $timeout, Concepts, Segments, Sources, Sourcetypes, $interval, LearnHelper, $window, ConceptStructure, Courses, YoutubePlayer, LectureSlidePlayer, LecturePlayer, WebsitePlayer)
    {
        var me = this;
        $scope = angular.element('.course-view').scope();

        this.update = function()
        {
            setupMaterial();
            $scope.setActiveLearnMaterial();
            checkPlayPause();
        };

        $scope.$on('dataReady', me.update);

        var players = [];
        var lastSourceType = '';

        this.updateCurrentPlayers = function()
        {
            if($scope.active.sourcetype != lastSourceType)
            {
                lastSourceType = $scope.active.sourcetype;

                me.stop();

                if($scope.active.sourcetype.title === 'Lecture')
                {
                    players.push(LecturePlayer.start($scope));
                }
                else if($scope.active.sourcetype.title === 'YouTube')
                {
                    players.push(YoutubePlayer.start($scope));
                }
                else if($scope.active.sourcetype.title == 'Website')
                {
                    players.push(WebsitePlayer.start($scope));
                }
            }

            me.manageSize();

        };

        this.play = function()
        {
            players.forEach(function(player)
            {
                player.play();
            });
        };

        this.stop = function()
        {
            players.forEach(function(player)
            {
                player.stop();
            });
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
            players.forEach(function(player)
            {
                if(player.parseSegmentSourceData)
                    player.parseSegmentSourceData(source, sourcetype, segment, callback);
            });
        };

        $scope.setActiveLearnMaterial = function()
        {
            if(!$scope.active.source) return;

            me.updateCurrentPlayers();

            if($scope.active.source._id !== $scope.lastSourceId)
            {
                $scope.lastSourceId = $scope.active.source._id;

                me.parseSegmentSourceData($scope.active.source, $scope.active.sourcetype, $scope.active.segment, function(data)
                {
                    //console.log(data);
                    data.sourceId = $scope.active.source._id;
                    $scope.sourceData = angular.extend($scope.sourceData, data);

                    //LearnHelper.synchronizePosition($scope, $scope.player, $scope.active.sourcetype);
                });
            }
            else
            {
                //todo: just update position.
                //if($scope.currentPosition < $scope.active.segment.start || $scope.currentPosition > $scope.active.segment.end)
                {
                    //LearnHelper.setSourcePosition($scope, $scope.active.sourcetype, $scope.player, $scope.active.segment.start);
                }
            }
        };

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

                    /*LearnHelper.parseSegmentSourceData($scope.active.source, $scope.active.sourcetype, $scope.active.segment, function(data)
                    {
                        data.sourceId = $scope.active.source._id;
                        $scope.sourceData = angular.extend($scope.sourceData, data);

                        //LearnHelper.synchronizePosition($scope, $scope.active.source, $scope.player);
                    });*/

                    //$scope.active.source = activeSource;
                }
            });
        };

        var interval1, interval2;

        var setupMaterial = function()
        {
            if($scope.active.sourcetype)
            {
                var category = $scope.active.sourcetype.category;

                $scope.$on('$destroy', function()
                {
                    $interval.cancel(interval1);
                    $interval.cancel(interval2);
                });
                $interval.cancel(interval1);
                $interval.cancel(interval2);

                if(category === 'video-document')
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
        //$scope.$watch('active.sourcetype.category', setupMaterial);

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
            players.forEach(function(player)
            {
                if(player.manageSize)
                    player.manageSize();
            });
        };

        $scope.$watch('contentWidth', function()
        {
            me.manageSize();
        });

        var w = angular.element($window);
        $scope.windowHeight = $window.innerHeight;
        $scope.windowWidth = $window.innerWidth;
    });
