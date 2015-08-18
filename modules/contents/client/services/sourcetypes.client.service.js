'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('contents').factory('Sourcetypes', ['$resource',
    function($resource) {
        return $resource('/api/sourcetypes/:sourcetypeId', { sourcetypeId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
