angular.module('courses').service('MapTour', function($timeout, $location)
{
    var me = this;
    var $scope;
    var tour;

    this.init = function (scope)
    {
        $scope = scope;

        $timeout(function()
        {
            console.log('starting tour..');
            makeTour();
            tour.start();
        }, 2000);
    };

    var makeTour = function()
    {
        var firstTlcId = $('.l1Circle:last').attr('id');
        var firstL2Id = $('.l2Circle:last').attr('id');

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

        tour.addStep('welcome', {
            title: 'Welcome to the Course Map!',
            text: 'Would you like to take a quick tour to see what\'s going on here?',
            attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [
                {
                    text: 'Yes',
                    classes: 'shepherd-button-secondary',
                    action: function() {
                        return tour.next();
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

        tour.addStep('concepts', {
            title: 'Concepts',
            text: 'These Circles of different colors and sizes are the <b>Concepts</b> taught in this Course.',
            attachTo: '#' + firstTlcId,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [{
                text: 'Next',
                classes: 'shepherd-button-secondary',
                action: function() {
                    //$('#' + firstTlcId).trigger('click');
                    $location.search('active', firstTlcId.substr('concept-'.length));
                    $timeout(tour.next, 1000);
                }
            }, exitButton]
        });

        tour.addStep('subconcepts', {
            title: 'Sub-Concepts',
            text: 'This is a sub-concept.',
            attachTo: '#' + firstL2Id,
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [nextButton, exitButton]
        });
    };

    return (this);
});
