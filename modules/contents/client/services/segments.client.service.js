'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('Segments', ['$socketResource',
    function($resource) {
        return $resource('/api/segments/:segmentId', { segmentId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
