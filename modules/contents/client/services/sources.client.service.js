'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('Sources', ['$socketResource',
    function($resource) {
        return $resource('/api/sources/:sourceId', { sourceId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
