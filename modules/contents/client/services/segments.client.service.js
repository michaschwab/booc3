'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('Segments', ['$resource',
    function($resource) {
        return $resource('/api/segments/:segmentId', { segmentId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
