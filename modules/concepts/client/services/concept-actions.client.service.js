'use strict';

angular.module('concepts').service('ConceptActions',
    function(SeenConcepts, Authentication, LearnedConcepts, ConceptStructure, SeenDataManager, Logger)
    {
        var $scope;

        this.init = function(scope)
        {
            $scope = scope;

            $scope.understood = function(concept)
            {
                if(concept.children && concept.children.length)
                {
                    concept.children.forEach(function(child)
                    {
                        $scope.understood(child);
                    });
                }
                else
                {
                    var userId = Authentication.user._id;

                    var learned = new LearnedConcepts();
                    learned.course = $scope.courseId;
                    learned.concept = concept.concept._id;
                    learned.user = userId;

                    learned.$save(function(learnedconcept)
                    {
                        $scope.learned.push(learnedconcept);
                    });
                }
            };

            $scope.notUnderstood = function(concept)
            {
                var conceptIds = ConceptStructure.getConceptChildrenFlat(concept)
                    .map(function(d) { return d.concept._id; });

                $scope.learned.filter(function(l)
                {
                    return conceptIds.indexOf(l.concept) !== -1;
                }).forEach(function(learned, i)
                {
                    learned.$remove(function()
                    {
                        $scope.learned.splice($scope.learned.indexOf(learned), 1);
                    });

                });
            };


            $scope.conceptClick = function(concept, event)
            {
                var conceptData = { conceptId: concept.concept._id, conceptTitle: concept.concept.title, conceptDepth: concept.depth };
                Logger.log('PanelConceptClick', conceptData, event);
            };

            $scope.lectureConceptClick = function(concept, event)
            {
                var conceptData = { conceptId: concept._id, conceptTitle: concept.title };
                Logger.log('PanelLectureConceptClick', conceptData, event);
            };

            $scope.conceptCircleClick = function(concept, event)
            {
                var conceptData = { conceptId: concept.concept._id, conceptTitle: concept.concept.title, conceptDepth: concept.depth };
                Logger.log('PanelConceptCircleClick', conceptData, event);
            };

            $scope.segmentClick = function(segment, concept, event)
            {
                var conceptData = { conceptId: concept.concept._id, conceptTitle: concept.concept.title, conceptDepth: concept.depth };
                var segmentData = { segmentId: segment._id, segmentTitle: segment.title };
                Logger.log('PanelSegmentClick', { segment: segmentData, concept: conceptData }, event);
            };

            $scope.lectureSegmentClick = function(segment, concept, event)
            {
                var conceptData = { conceptId: concept.concept._id, conceptTitle: concept.concept.title, conceptDepth: concept.depth };
                var segmentData = { segmentId: segment._id, segmentTitle: segment.title };
                Logger.log('PanelLectureSegmentClick', { segment: segmentData, concept: conceptData }, event);
            };

            $scope.lectureClick = function(lecture, event)
            {
                var lectureData = { lectureId: lecture.lecture._id, lectureTitle: lecture.lecture.title };
                Logger.log('PanelLectureClick', lectureData, event);
            };
        };

        return (this);
    });
