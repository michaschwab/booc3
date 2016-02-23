'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('Segmentgroup', ['$socketResource',
    function($resource) {
        return $resource('/api/segmentgroups/:segmentgroupId', { segmentgroupId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
