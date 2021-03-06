
'use strict';

//Courses service used to communicate Tag REST endpoints
angular.module('courses').factory('Tag', ['$socketResource',
    function($resource) {
        return $resource('/api/tags/:tagId', { tagId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
