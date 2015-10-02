'use strict';

angular.module('core').controller('NotLoggedInController',
    function ($scope, Authentication)
    {
        $scope.authentication = Authentication;
    }
);
