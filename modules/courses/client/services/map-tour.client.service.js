angular.module('courses').service('MapTour', function(Authentication, $timeout, $location, Users, MapArrows)
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
            text: 'This is the concept map. It contains all course concepts and their relationships.',
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
            text: 'Each concept is a circle. Concepts are arranged into zoomable hierarchies.',
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
            text: 'For example, <b>' + firstL2Data.concept.title + '</b> is part of <b>' + firstTlcData.concept.title + '</b>. <br /><b>' + firstL2Data.concept.title + '</b> contains <b>' + firstL2ChildrenData[0].concept.title + '</b> and ' + childrenCountMinusOne + ' more sub-concepts.',
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
            text: 'Concepts hold learning material, accessible with a click or tap of the play button, or on the left panel.',
            attachTo: '#' + firstL3Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [nextButton, exitButton]
        });
    };

    return (this);
});
