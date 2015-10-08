'use strict';

// Segments controller
angular.module('learning').controller('LearnController',
    function($scope, $stateParams, $location, $timeout, Concepts, Segments, Sources, Sourcetypes, $interval, LearnHelper, $window, ConceptStructure, Courses)
    {
        var me = this;
        $scope = angular.element('.course-view').scope();

        $scope.launch = function()
        {
            //$scope.activeMode = $stateParams.lectureId === undefined ? 'hierarchy': 'lecture';
            //console.log($scope.activeMode);
            $scope.courseId = $stateParams.courseId;

            //var searchParams = $location.search();

            $scope.sourceData = {};
            $scope.conceptObjectDirectory = {};
            $scope.lastSourceId = '';
            //ConceptStructure.init($scope, $stateParams.courseId);

            //$scope.setActiveLearnMaterial();
            //console.log($scope.active.segment);
            //console.log($scope.active.source);

        };

        /*$scope.$watch('activeConcept', function()
        {
            //$scope.setActiveLearnMaterial();
        });

        $scope.$watch('active.segment', function()
        {
            $scope.setActiveLearnMaterial();
        });

        $scope.$watch('active.source', function()
        {
            $scope.setActiveLearnMaterial();
        });*/

        function checkPlayPause()
        {
            if(!$scope.learnMode)
            {
                LearnHelper.pauseSource($scope.active.sourcetype);
            }
            else
            {
                LearnHelper.playSource($scope.active.sourcetype);
            }
        }

        /*$scope.$watch('learnMode', checkPlayPause);
        $scope.$watch('active.sourcetype', checkPlayPause);
*/
        $scope.setActiveLearnMaterial = function()
        {
            if(!$scope.active.source) return;

            if($scope.active.source._id !== $scope.lastSourceId)
            {
                $scope.lastSourceId = $scope.active.source._id;

                LearnHelper.parseSegmentSourceData($scope.active.source, $scope.active.sourcetype, $scope.active.segment, function(data)
                {
                    //console.log(data);
                    data.sourceId = $scope.active.source._id;
                    $scope.sourceData = angular.extend($scope.sourceData, data);

                    LearnHelper.synchronizePosition($scope, $scope.player, $scope.active.sourcetype);
                });
            }
            else
            {
                //todo: just update position.
                //if($scope.currentPosition < $scope.active.segment.start || $scope.currentPosition > $scope.active.segment.end)
                {
                    LearnHelper.setSourcePosition($scope, $scope.active.sourcetype, $scope.player, $scope.active.segment.start);
                }
            }

            /*
            if($scope.activeMode === 'hierarchy')
            {
                console.log('what do i do?');
            }
            else if($scope.activeMode === 'lecture')
            {
                $scope.active.source = $scope.sourceMap[$scope.lectureId];
                $scope.activeLecture = $scope.active.source;
                var currentConcepts = [];

                $scope.segments.filter(function(segment)
                {
                    return segment.source === $scope.active.source._id;
                }).forEach(function(segment)
                {
                    currentConcepts = currentConcepts.concat(segment.concepts);
                });
                console.log(currentConcepts);

                $scope.concepts
                    .filter(function(concept){
                        return currentConcepts.indexOf(concept._id) !== -1;
                    })
                    .sort(function(a,b){return d3.ascending(a.order, b.order);})
                    .forEach(function(concept, i)
                    {
                        $scope.neighborConcepts.push(concept);
                    });

                $scope.conceptId = $scope.neighborConcepts[0]._id;
                $scope.activeConcept = $scope.conceptObjectDirectory[$scope.conceptId];
                $scope.segments.filter(function(segment) {
                    return segment.concepts.indexOf($scope.conceptId) !== -1 && segment.source === $scope.active.source._id;
                }).forEach(function(activeSegment)
                {
                    $scope.segmentId = activeSegment._id;
                });
            }

            $scope.possibleSegments = [];
            $scope.segments.filter(function(segment) { return segment.concepts.indexOf($scope.conceptId) !== -1 }).forEach(function(possibleSegment)
            {
                $scope.possibleSegments.push(possibleSegment);
            });

            console.log($scope.activeConcept);
            //$scope.activeHierarchy
            /*$scope.conceptObjectDirectory.filter(function(concept) { return concept.concept._id === $scope.conceptId }).forEach(function(activeConcept)
            {
                $scope.activeConcept = activeConcept;
            });* /



            if($scope.segmentId === undefined)
            {
                if($scope.possibleSegments.length < 1)
                {
                    var e = new Error('Could not find any segments for this concept.');
                    console.log(e.stack);
                }
                else
                {
                    $scope.active.segment = $scope.possibleSegments[0];
                    $scope.segmentId = $scope.active.segment._id;
                }
            }
            else
            {
                $scope.possibleSegments.filter(function(segment) { return segment._id === $scope.segmentId }).forEach(function(activeSegment)
                {
                    $scope.active.segment = activeSegment;
                });
            }

            $scope.sources.filter(function(source) { return source._id === $scope.active.segment.source }).forEach(function(activeSource)
            {
                $scope.active.source = active.source;
            });

            $scope.sourcetypes.filter(function(sourcetype) { return sourcetype._id === $scope.active.source.type }).forEach(function(activeSourcetype)
            {
                $scope.active.sourcetype = activeSourcetype;
            });

            $scope.ensureSourceAtCorrectPosition();
            $scope.setupNext();*/
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

                    interval1 = $interval(synchronizeSlide, 1000);
                    interval2 = $interval(checkWithinSegment, 1000);
                }
            }

        };
        //$scope.$watch('active.sourcetype.category', setupMaterial);

        var lastSlidePdf = '';

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
        }

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

        $scope.$on('$locationChangeSuccess', function(event)
        {
            setupMaterial();
            $scope.setActiveLearnMaterial();
            checkPlayPause();
        });

        $scope.pdfWidth = $scope.contentWidth*2/3;
        $scope.wikiWidth = $scope.contentWidth - 30;

        this.setVideoWidth = function(goalWidth)
        {
            d3.select('#videoPlayer').transition()
                .style('width', goalWidth + 'px')
                .each('end', function()
                {
                    $scope.videoWidth = goalWidth;
                    $scope.safeApply();
                });
        };

        this.setPdfWidth = function(goalWidth)
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
        };

        this.setWikiWidth = function(goalWidth)
        {
            d3.select('#wikiframe').transition()
                .style('width', goalWidth + 'px')
                .each('end', function()
                {
                    $scope.wikiWidth = goalWidth;
                    $scope.safeApply();
                });
        };


        var resizeTimeout;

        $scope.$watch('contentWidth', function()
        {
            $timeout.cancel(resizeTimeout);

            resizeTimeout = $timeout(function()
            {
                me.setVideoWidth($scope.contentWidth/3-30);

                me.setPdfWidth($scope.contentWidth*2/3 - 30);

                me.setWikiWidth($scope.contentWidth - 30);
            }, 400);
        });

        var w = angular.element($window);
        $scope.windowHeight = $window.innerHeight;
        $scope.windowWidth = $window.innerWidth;
    });
