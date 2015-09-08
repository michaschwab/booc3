'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('concepts').factory('LearnedConcepts', ['$resource',
    function($resource) {
        return $resource('/api/learnedconcepts/:learnedconceptId', { learnedconceptId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
