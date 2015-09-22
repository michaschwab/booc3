angular.module('courses').service('MapTour', function(Authentication, $timeout, $location, Users, MapArrows, ConceptStructure)
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
        //console.log($('.l1Circle:last').scope());
        var firstTlcId = $('.l1Circle:last').attr('id');
        var firstTlcData = d3.select('#' + firstTlcId).data()[0];
        var firstL2Id = $('.l2Circle:last').attr('id');
        var firstL2Data = d3.select('#' + firstL2Id).data()[0];

        var firstL3Id = $('.l3Circle:last').attr('id');
        var firstL2ChildrenData = d3.select('#' + firstL2Id).selectAll('.l3Circle').data();

        var skipData = findTlcThatSkipsOtherTlcs();
        var skippingChildrenData = d3.select('#concept-' + skipData.concept.concept._id).selectAll('.l3Circle').data();
        var skippingFirstL3 = skippingChildrenData[skippingChildrenData.length-1];
        var skippingFirstL3Id = 'concept-' + skippingFirstL3.concept._id;
        var skippingFirstL3Todo = ConceptStructure.getTodoListSorted(skippingFirstL3);
        var skippingFirstL3TodoL1L2 = skippingFirstL3Todo.filter(function(c)
        {
            return c.depth < 3;
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
            classes: 'shepherd-button-secondary',
            action: function() {
                return tour.next();
            }
        };

        var exitButton = {
            text: 'Exit',
            classes: 'shepherd-button-secondary',
            action: function() {
                return tour.hide();
            }
        };

        tour.addStep('intro', {
            title: 'Welcome to the booc.io!',
            text: 'See the connections between concepts in your course, <br />and define a personalized learning plan through the course material. <br /><br />Would you like a quick tour?',
            attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [
                {
                    text: 'Yes',
                    classes: 'shepherd-button-secondary',
                    action: function()
                    {
                        var isActive = $location.search('active');

                        if(!isActive)
                        {
                            return tour.next();
                        }
                        else
                        {
                            $location.search('active', '');
                            $timeout(tour.next, 1500);
                        }
                    }
                },
                {
                    text: 'No',
                    classes: 'shepherd-button-secondary',
                    action: function() {
                        return tour.hide();
                    }
                }
            ]
        });

        tour.addStep('conceptmap', {
            title: 'Concept Map',
            text: 'This is the concept map. <br />It contains all course concepts and their relationships.',
            attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    //todo turn off all lines.
                    MapArrows.disableArrows();
                    tour.next();
                    /*$location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, 1000);*/
                }
            }, exitButton]
        });

        tour.addStep('concepts1', {
            title: 'Concepts',
            text: 'Each concept is a circle. <br />Concepts are arranged into zoomable hierarchies.',
            attachTo: '#' + firstTlcId,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    $location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, 2000);
                }
            }, exitButton]
        });

        /*var l2ChildrenTitles = '';
        firstL2ChildrenData.forEach(function(child) { l2ChildrenTitles += child.concept.title + ', '});
        l2ChildrenTitles = l2ChildrenTitles.substr(0, l2ChildrenTitles.length - 2);*/
        //var l2ChildrenTitles = firstL2ChildrenData[0].concept.title
        var childrenCountMinusOne = firstL2ChildrenData.length-1;

        tour.addStep('concepts2', {
            title: 'Sub-Concepts',
            text: 'For example, <b>' + firstL2Data.concept.title + '</b> is part of <b>' + firstTlcData.concept.title + '</b>. <br /><b>' + firstL2Data.concept.title + '</b> contains <b>' + firstL2ChildrenData[firstL2ChildrenData.length-1].concept.title + '</b> and ' + childrenCountMinusOne + ' more sub-concepts.',
            attachTo: '#' + firstL2Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    $location.search('active', firstL3Id.substr('concept-'.length));
                    $timeout(tour.next, 2000);
                }
            }, exitButton]
        });

        tour.addStep('learning-material', {
            title: 'Learning Material',
            text: 'Concepts hold learning material, accessible with <br />a click or tap of the play button, or on the left panel.',
            attachTo: '#' + firstL3Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    $location.search('active', '');
                    MapArrows.setOption('showCurrentPathHierarchy', true);
                    $timeout(tour.next, 2000);
                }
            }, exitButton]
        });

        tour.addStep('arrangement', {
            title: 'Arrangement of Concepts',
            text: 'Concepts are arranged in a circle, around a clock face. <br />The order in which material is taught in the course runs around the outside, <br />starting from the top or 12 o’clock.',
            attachTo: '#' + firstTlcId,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    $location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, 2000);
                }
            }, exitButton]
        });
        tour.addStep('arrangement2', {
            title: 'Arrangement of Concepts',
            text: 'This continues down the hierarchy. <br />We can follow the taught course by moving around the outside of the circles.',
            attachTo: '#' + firstL2Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    $location.search('active', '');
                    //todo show shortcut path to tlc that skips stuff.
                    $timeout(tour.next, 2000);
                }
            }, exitButton]
        });

        var beforeUnderstoodButton = {
            text: 'Next',
            classes: 'shepherd-button-secondary',
            action: function()
            {
                $location.search('active', skippingFirstL3Id.substr('concept-'.length));
                $timeout(function()
                {
                    $('.understood-button').css('border', '5px solid #00cccc');
                    tour.next();
                }, 1500);
            }
        };

        if(skipData)
        {
            tour.addStep('arrangement3', {
                title: 'Arrangement of Concepts',
                text: 'However, some concepts don’t require you to learn every concept taught before. <br />For some concepts, we can ‘short-cut’ by moving inside the circle.',
                attachTo: '#' + firstTlcId,
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [{
                    text: 'Next',
                    classes: 'shepherd-button-secondary',
                    action: function() {
                        //$location.search('active', '');
                        $scope.hoveringConceptIds = [skipData.concept.concept._id];
                        //todo show shortcut path to tlc that skips stuff.
                        $timeout(tour.next, 200);
                    }
                }, exitButton]
            });

            tour.addStep('arrangement4', {
                title: 'Arrangement of Concepts',
                text: 'In this way, we can show you learning plans to specific <br />material by short-cutting past what you don’t need to know, <br />or what you already know. <br /><br />For Example, <b>' + skipData.concept.concept.title + '</b> skips <br /><b>' + skipData.skipped.concept.title + '</b>. Hover it with your mouse to see the learning plan.',
                attachTo: '#concept-' + skipData.concept.concept._id,
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [beforeUnderstoodButton, exitButton]
            });
        }
        else
        {
            tour.addStep('arrangement3', {
                title: 'Arrangement of Concepts',
                text: 'However, some concepts don’t require you to learn every concept taught before. <br />For some concepts, we can ‘short-cut’ by moving inside the circle. <br />Unfortunately, that is not the case for any top level concepts in this course.',
                attachTo: '#' + firstTlcId,
                classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
                buttons: [beforeUnderstoodButton, exitButton]
            });
        }

        tour.addStep('understood', {
            title: 'Learning Progress',
            text: 'To tell us what you already know, you can hit the ‘Understood’ button, <br />and your learning plans will now short cut past these concepts.',
            attachTo: '.understood-button',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    $('.understood-button').css('border', '');
                    $('.set-goal').css('border', '5px solid #00cccc');
                    $timeout(tour.next, 200);
                }
            }, exitButton]
        });

        tour.addStep('setgoal', {
            title: 'Learning Goals',
            text: 'You can also use the flag to set a goal concept, and then explore the learning plan in more detail. <br /><br />Let`s see what that looks like.',
            attachTo: '.set-goal',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {

                    var newGoal = skippingFirstL3Id.substr('concept-'.length);
                    var currentGoal = $location.search('goal');

                    if(newGoal == currentGoal)
                    {
                        doAfterGoalIsSet();
                    }
                    else
                    {
                        $location.search('goal', newGoal);

                        // Wait so the user sees the Flag marking the Concept as Goal Concept
                        $timeout(doAfterGoalIsSet, 2000);
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
                            for(var i = 0; i < 9; i++)
                            {
                                //var newActive = skippingFirstL3Todo[i];
                                var newActive = skippingFirstL3TodoL1L2[i];

                                //$location.search('active', newActive.concept._id);
                                setActive(i * 2200, newActive.concept._id);
                            }

                            $timeout(tour.next, i * 2200);
                        }, 3000);
                    }
                }
            }, exitButton]
        });

        tour.addStep('lectures', {
            title: 'Lectures',
            text: '..and so on. Oh, and if you just want to quickly access the lecture videos or <br />slides in linear order, then use this tab. You can download them from here, too.',
            attachTo: '.tab-lectures',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [nextButton, exitButton]
        });

        tour.addStep('feedback', {
            title: 'Feedback',
            text: 'Please try it! <br />Tell us what you like, what you don’t like, or even what’s broken (!)<br /> using the feedback tools in the top right [work in progress].<br /><br />Wishing you happy non-linear learning from the booc.io team!',
            attachTo: '.tab-lectures',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Finish',
                classes: 'shepherd-button-secondary',
                action: function() {
                    return tour.hide();
                }
            }]
        });

    };

    return (this);
});
