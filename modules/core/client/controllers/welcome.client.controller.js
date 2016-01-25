'use strict';

angular.module('core').controller('WelcomeController',
    function ($scope, $state, Authentication, Logger) {
        // Expose view variables
        $scope.$state = $state;
        $scope.authentication = Authentication;

    }
);
