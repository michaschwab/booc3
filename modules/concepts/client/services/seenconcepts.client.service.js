'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('concepts').factory('SeenConcepts', ['$socketResource',
    function($resource) {
        return $resource('/api/seenconcepts/:seenconceptId', { seenconceptId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
