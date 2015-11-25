'use strict';

angular.module('core').controller('HeaderController',
    function ($scope, $state, Authentication, Menus, MapTour, $modal, $location) {
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

        var updateTourPossible = function()
        {
            var location = $location.url(); // eg /courses/547e663e14e4e78d17677b6b?learn=yes&active=54c179d0bea45f77edabd379
            var search = $location.search();
            $scope.tourPossible = location.indexOf('courses/') !== -1 && location.length > 20 && (!search.learn || search.learn == 'no');
        };
        updateTourPossible();

        $scope.$on('$locationChangeSuccess', function () {
            updateTourPossible();
        });

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            $scope.isCollapsed = false;
        });

        $scope.launchTour = function()
        {
            MapTour.initTour();
        };

        $scope.openFeedbackModal = function()
        {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modules/core/views/feedbackModal.client.view.html',
                controller: 'FeedbackModalController',
                resolve: {
                    /*dependency: function() { return d.dep; },
                    from: function() { return d.from; },
                    to: function() { return d.to }*/
                }
            });
        };
    }
);
