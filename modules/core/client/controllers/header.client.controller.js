'use strict';

angular.module('core').controller('HeaderController',
  function ($scope, $state, Authentication, Menus, MapTour, $modal) {
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
