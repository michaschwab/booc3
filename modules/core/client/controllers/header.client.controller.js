'use strict';

angular.module('core').controller('HeaderController',
    function ($scope, $state, Authentication, Menus, MapTour, $modal, $location, Logger, $timeout) {
        // Expose view variables
        $scope.$state = $state;
        $scope.authentication = Authentication;

        // Get the topbar menu
        $scope.menu = Menus.getMenu('topbar');

        // Toggle the menu items
        $scope.isCollapsed = false;
        $scope.toggleCollapsibleMenu = function () {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        var location = $location.url();// eg /courses/547e663e14e4e78d17677b6b?learn=yes&active=54c179d0bea45f77edabd379
        var search = $location.search();
        var body = d3.select('body');

        var updateTourPossible = function()
        {
            $scope.tourPossible = location.indexOf('courses/') !== -1 && location.length > 20 && (!search.learn || search.learn == 'no');
        };
        updateTourPossible();

        var updateScrollPossible = function()
        {
            //var noScroll = location.indexOf('courses/') !== -1 && location.length > 20 && (!search.learn || search.learn == 'no');
            var noScroll = location.indexOf('courses/') !== -1 && location.length > 20 && location.indexOf('contents/') === -1;
            body.classed('noScroll', noScroll);
        };
        updateScrollPossible();

        $scope.$on('$locationChangeSuccess', function ()
        {
            location = $location.url();// eg /courses/547e663e14e4e78d17677b6b?learn=yes&active=54c179d0bea45f77edabd379
            search = $location.search();

            updateTourPossible();
            updateScrollPossible();
        });

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        $scope.launchTour = function(event)
        {
            Logger.log('HeaderTourClick', null, event);
            MapTour.initTour();
        };

        $scope.headerLogoClick = function(event)
        {
            Logger.log('HeaderLogoClick', null, event);
        };

        $scope.headerSignoutClick = function(event)
        {
            Logger.log('HeaderSignoutClick', null, event);
        };

        $scope.openFeedbackModal = function(event)
        {
            Logger.log('HeaderFeedbackClick', null, event);

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modules/core/views/feedbackModal.client.view.html',
                controller: 'FeedbackModalController',
                windowClass: 'feedback-modal-window',
                resolve: {
                    /*dependency: function() { return d.dep; },
                    from: function() { return d.from; },
                    to: function() { return d.to }*/
                }
            });
            $timeout(function()
            {
                $('.feedbackContent').focus();
            }, 200);
        };
    }
);
