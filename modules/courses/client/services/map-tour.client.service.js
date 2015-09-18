angular.module('courses').service('MapTour', function($timeout)
{
    var me = this;
    var $scope;

    this.init = function (scope)
    {
        $scope = scope;

        var tour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: true
            }
        });

        tour.addStep('myStep', {
            title: 'Welcome to the Course Map!',
            text: 'Would you like to take a quick tour to see what\'s going on here?',
            attachTo: '.startIconGroup',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            /*attachment: 'middle center',
            targetAttachment: 'middle center',*/
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

        $timeout(function()
        {
            console.log('starting tour..');
            tour.start();
        }, 2000);
    };

    return (this);
});
