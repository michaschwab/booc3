angular.module('courses').service('MapTour', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure, Logger)
{
    var me = this;
    var $scope;
    var tour;
    var user = Authentication.user;

    this.init = function (scope)
    {
        $scope = scope;

        if(!user.tourChecked)
        {
            $timeout(me.initTour, 2000);
        }
    };

    this.initTour = function()
    {
        var dbUser = new Users($scope.user);
        dbUser.tourChecked = Date.now();
        dbUser.$update();

        console.log('starting tour..');
        makeTour();
        tour.start();
    };

    var makeTour = function()
    {
        var waitTime = 1700;
        var firstTlcId = $('.l1Circle:last').attr('id');
        var firstTlcData = d3.select('#' + firstTlcId).data()[0];
        var firstL2Id = $('.l2Circle:last').attr('id');
        var firstL2Data = d3.select('#' + firstL2Id).data()[0];

        var firstL3Id = $('.l3Circle:last').attr('id');
        var firstL2ChildrenData = d3.select('#' + firstL2Id).selectAll('.l3Circle').data();

        var skipData = findTlcThatSkipsOtherTlcs();
        var skippingChildrenData = d3.select('#concept-' + skipData.concept.concept._id).selectAll('.l2Circle').data();
        var skippingFirstL3 = skippingChildrenData[skippingChildrenData.length-1];
        var skippingFirstL3Id = 'concept-' + skippingFirstL3.concept._id;
        var skippingFirstL3Todo = ConceptStructure.getTodoListSorted(skippingFirstL3);
        var skippingFirstL3TodoL1 = skippingFirstL3Todo.filter(function(c)
        {
            return c.depth < 2;
        });

        function findTlcThatSkipsOtherTlcs()
        {
            for(var i = 0; i < $scope.active.topLevelConcepts.length; i++)
            {
                var tlc = $scope.active.topLevelConcepts[i];

                var todoIds = ConceptStructure.getTodoListSorted(tlc).map(function(todo)
                {
                    return todo.concept._id;
                });

                // Go through all top level concepts before the current one and check if it is required.
                for(var j = 0; j < i; j++)
                {
                    if(todoIds.indexOf($scope.active.topLevelConcepts[j].concept._id) == -1)
                    {
                        //console.log(tlc.concept.title + ' skips ' + $scope.active.topLevelConcepts[j].concept.title);
                        return {
                            concept: tlc,
                            skipped: $scope.active.topLevelConcepts[j]
                        };
                    }
                }

                i++;
            }
            return null;
        }

        tour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: true
            }
        });

        var nextButton = {
            text: 'Next',
            classes: 'shepherd-button-primary',
            action: function() {
                Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                return tour.next();
            }
        };

        var backButton = {
            text: 'Back',
            classes: 'shepherd-button-secondary pull-left',
            action: function() {
                Logger.log('TourBack', {currentStep: tour.getCurrentStep().id });
                return tour.back();
            }
        };

        var exitButton = {
            text: 'Exit',
            classes: 'shepherd-button-secondary',
            action: function() {
                Logger.log('TourExit', {currentStep: tour.getCurrentStep().id });
                MapArrows.setOptionsDefault();
                return tour.hide();
            }
        };

        tour.addStep('intro', {
            title: 'Welcome to the booc.io!',
            text: 'See the connections between concepts in your course, <br />and define a personalized learning plan through the course material. <br /><br />Would you like a quick tour?',
            //attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                    text: 'No',
                    classes: 'shepherd-button-secondary pull-left',
                    action: function() {
                        Logger.log('TourNo');
                        return tour.hide();
                    }
                },
                {
                    text: 'Yes',
                    classes: 'shepherd-button-primary',
                    action: function()
                    {
                        Logger.log('TourYes');
                        MapArrows.disableArrows();
                        $location.search('goal', '');
                        $location.search('mode', 'plan');

                        var isActive = $location.search()['active'];

                        if(!isActive)
                        {
                            return tour.next();
                        }
                        else
                        {
                            tour.hide();
                            $location.search('active', '');

                            $timeout(tour.next, waitTime);
                        }
                    }
                }
            ]
        });

        tour.addStep('conceptmap', {
            title: 'Concept Map',
            text: 'This is the concept map. <br />It contains all course concepts and their relationships.',
            //attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    tour.next();
                    /*$location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, 1000);*/
                }
            }]
        });

        tour.addStep('concepts1', {
            title: 'Concepts',
            text: 'Each concept is a circle. <br />Concepts are arranged into zoomable hierarchies.',
            attachTo: '#' + firstTlcId,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    tour.hide();
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, waitTime);
                }
            }]
        });

        /*var l2ChildrenTitles = '';
        firstL2ChildrenData.forEach(function(child) { l2ChildrenTitles += child.concept.title + ', '});
        l2ChildrenTitles = l2ChildrenTitles.substr(0, l2ChildrenTitles.length - 2);*/
        //var l2ChildrenTitles = firstL2ChildrenData[0].concept.title
        //var childrenCountMinusOne = firstL2ChildrenData.length-1;

        tour.addStep('concepts2', {
            title: 'Sub-Concepts',
            text: 'For example, <b style="color:'+firstL2Data.concept.color+'">' + firstL2Data.concept.title + '</b> is part of <b style="color:'+firstTlcData.concept.color+'">' + firstTlcData.concept.title + '</b>. <br /><b style="color:'+firstL2Data.concept.color+'">' + firstL2Data.concept.title + '</b> contains <b>' + firstL2ChildrenData.length + ' sub-concepts.',
            attachTo: '#' + firstL2Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    tour.hide();
                    $location.search('active', firstL3Id.substr('concept-'.length));
                    $timeout(tour.next, waitTime);
                }
            }]
        });

        tour.addStep('learning-material', {
            title: 'Learning Material',
            text: 'Concepts hold learning material, accessible with <br />a click or tap of the play button, or on the left panel.',
            attachTo: '#' + firstL3Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    tour.hide();
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $location.search('active', '');
                    MapArrows.setOption('showCurrentPathHierarchy', true);
                    $timeout(function() { $scope.leaveConcept(); tour.next(); }, waitTime);
                }
            }]
        });

        tour.addStep('arrangement', {
            title: 'Arrangement of Concepts',
            text: 'Concepts are arranged in a circle, around a clock face. <br />The order in which material is taught in the course runs around the outside, <br />starting from the top or 12 o’clock.',
            attachTo: '#' + firstTlcId,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    tour.hide();
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, waitTime);
                }
            }]
        });
        tour.addStep('arrangement2', {
            title: 'Arrangement of Concepts',
            text: 'This continues down the hierarchy. <br />We can follow the taught course by moving around the outside of the circles.',
            attachTo: '#' + firstL2Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    tour.hide();
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $location.search('active', '');
                    //todo show shortcut path to tlc that skips stuff.
                    $timeout(function() { $scope.leaveConcept(); tour.next(); }, waitTime);
                }
            }]
        });

        var beforeUnderstoodButton = {
            text: 'Next',
            classes: 'shepherd-button-primary',
            action: function()
            {
                tour.hide();
                $location.search('active', skippingFirstL3Id.substr('concept-'.length));
                $timeout(function()
                {
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $('.understood-button').css('border', '5px solid #00cccc');
                    tour.next();
                }, waitTime);
            }
        };

        if(skipData)
        {
            tour.addStep('arrangement3', {
                title: 'Arrangement of Concepts',
                text: 'However, some concepts don’t require you to learn every concept taught before. <br />For some concepts, we can ‘short-cut’ by moving inside the circle.',
                attachTo: '#' + firstTlcId,
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [backButton, exitButton, {
                    text: 'Next',
                    classes: 'shepherd-button-primary',
                    action: function() {
                        //$location.search('active', '');
                        //$scope.hoveringConceptIds = [skipData.concept.concept._id];
                        Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                        $scope.hoverConcept(skipData.concept);
                        //todo show shortcut path to tlc that skips stuff.
                        $timeout(tour.next, 200);
                    }
                }]
            });

            tour.addStep('arrangement4', {
                title: 'Arrangement of Concepts',
                text: 'In this way, we can show you learning plans to specific <br />material by short-cutting past what you don’t need to know, <br />or what you already know. <br /><br />For Example, <b style="color:'+skipData.concept.concept.color+'">' + skipData.concept.concept.title + '</b> skips <br /><b style="color:'+skipData.skipped.concept.color+'">' + skipData.skipped.concept.title + '</b>. Hover it with your mouse to see the learning plan.',
                attachTo: '#concept-' + skipData.concept.concept._id + ' left',
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [backButton, exitButton, beforeUnderstoodButton]
            });
        }
        else
        {
            tour.addStep('arrangement3', {
                title: 'Arrangement of Concepts',
                text: 'However, some concepts don’t require you to learn every concept taught before. <br />For some concepts, we can ‘short-cut’ by moving inside the circle. <br />Unfortunately, that is not the case for any top level concepts in this course.',
                attachTo: '#' + firstTlcId,
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [backButton, exitButton, beforeUnderstoodButton]
            });
        }

        tour.addStep('understood', {
            title: 'Learning Progress',
            text: 'To tell us what you already know, you can hit the <b>Understood</b> button <br />so you don‘t need to look at those concepts again.<br /><br />If you took a look at the learning material of a concept, we’ll mark it as ’seen’. <br />You can also mark concepts as unseen if you want to come back to it later.',
            attachTo: '.understood-button',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function() {
                    $('.understood-button').css('border', '');
                    $('.set-goal').css('border', '5px solid #00cccc');
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $timeout(tour.next, 200);
                }
            }]
        });

        tour.addStep('setgoal', {
            title: 'Learning Goals',
            text: 'You can also use the flag to set a goal concept, <br />and then explore the learning plan in more detail. <br /><br />Let‘s look at the learning plan for this concept, step by step.',
            attachTo: '.set-goal',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function()
                {
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    var newGoal = skippingFirstL3Id.substr('concept-'.length);
                    var currentGoal = $location.search()['goal'];
                    $('.set-goal').css('border', '');
                    tour.hide();

                    if(newGoal == currentGoal)
                    {
                        doAfterGoalIsSet();
                    }
                    else
                    {
                        $location.search('goal', newGoal);

                        // Wait so the user sees the Flag marking the Concept as Goal Concept
                        $timeout(doAfterGoalIsSet, waitTime);
                    }

                    var setActive = function(delay, activeId)
                    {
                        $timeout(function()
                        {
                            $location.search('active', activeId);
                        }, delay);
                    };

                    function doAfterGoalIsSet()
                    {
                        $location.search('active', '');

                        // Wait until zoomed out
                        $timeout(function()
                        {

                            //for(var i = 0; i < 9; i++)
                            for(var i = 0; i < skippingFirstL3TodoL1.length; i++)
                            {
                                //var newActive = skippingFirstL3Todo[i];
                                var newActive = skippingFirstL3TodoL1[i];

                                //$location.search('active', newActive.concept._id);
                                setActive(i * 2700, newActive.concept._id);
                            }

                            $timeout(function()
                            {
                                $location.search('active', '');
                                $location.search('goal', '');

                                $timeout(function()
                                {
                                    $location.search('mode', 'lecture');
                                    tour.next();
                                }, waitTime);
                            }, i * 2700);
                        }, 2500);
                    }
                }
            }]
        });

        tour.addStep('lectures', {
            title: 'Lectures',
            text: 'Oh, and if you just want to quickly access the lecture videos or slides <br />in linear order, then use this tab. You can download them from here, too.',
            attachTo: '.tab-lectures',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [backButton, exitButton, {
                text: 'Next',
                classes: 'shepherd-button-primary',
                action: function()
                {
                    Logger.log('TourNext', {currentStep: tour.getCurrentStep().id });
                    $location.search('mode', 'plan');
                    $timeout(tour.next, 200);
                }}]
        });

        tour.addStep('feedback', {
            title: 'Feedback',
            text: 'Please try it! <br />Tell us what you like, what you don’t like, or even what’s broken<br /> using the <span class="fa fa-envelope"></span> feedback button.<br /><br />You can relaunch this tour by clicking on the <span class="glyphicon glyphicon-question-sign"></span> question mark.<br /><br />Wishing you happy non-linear learning from the booc.io team!',
            attachTo: '.feedback-button',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Finish',
                classes: 'shepherd-button-primary',
                action: function() {
                    Logger.log('TourFinish');
                    MapArrows.setOptionsDefault();
                    return tour.hide();
                }
            }]
        });

    };

    return (this);
});
