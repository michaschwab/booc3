'use strict';

//Concepts service used to communicate Concepts REST endpoints
angular.module('concepts').factory('Concepts', ['$socketResource',
	function($resource) {
		return $resource('concepts/:conceptId', { conceptId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]).factory('LearnedConcepts', ['$resource',
    function($resource) {
        return $resource('learnedconcepts/:learnedconceptId', { learnedconceptId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
