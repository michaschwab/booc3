'use strict';

//Setting up route
angular.module('learning').config(['$stateProvider',
    function($stateProvider) {
        // Segments state routing
        $stateProvider.
            state('learnConcept', {
                url: '/courses/:courseId/concepts/:conceptId',
                templateUrl: 'modules/learning/views/learn.client.view.html',
                reloadOnSearch: false
            }).
            state('learnLecture', {
                url: '/courses/:courseId/lectures/:lectureId',
                templateUrl: 'modules/learning/views/learn.client.view.html'
            });
    }
]);
