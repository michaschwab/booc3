'use strict';

//Setting up route
angular.module('comments').config(['$stateProvider',
    function($stateProvider) {
        // Segments state routing
        $stateProvider.
        state('conceptComments', {
            url: '/courses/:courseId/concepts/:conceptId/comments',
            templateUrl: 'modules/comments/views/conceptComments.client.view.html'
        });
    }
]);
