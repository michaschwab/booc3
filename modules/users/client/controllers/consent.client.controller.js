'use strict';

angular.module('users').controller('ConsentController',
    function($scope, $stateParams, $http, $location, Authentication, Users, $window, $state)
    {
        $scope.authentication = Authentication;
        $scope.user = $scope.authentication.user;

        if (!$scope.authentication.user) $location.path('/signin');

        var dbUser = new Users($scope.user);
        dbUser.lastTrackingConsentCheck = new Date();
        dbUser.$update();

        $scope.consent = function()
        {
            dbUser.trackingConsent = new Date();
            dbUser.$update(function()
            {
                $scope.authentication.user.trackingConsent = $scope.user.trackingConsent;
                $state.go('home');
            });
        };

        $scope.notConsent = function()
        {
            dbUser.trackingConsent = null;
            dbUser.$update(function()
            {
                $window.location.href = 'http://projects.iq.harvard.edu/gov2001/book/lecture-notes-advanced-quantitative-political-methodology';
            });
        };
    }
);
