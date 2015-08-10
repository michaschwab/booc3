'use strict';

// Concepts controller
angular.module('concepts').controller('ConceptsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Concepts',
	function($scope, $stateParams, $location, Authentication, Concepts) {
		$scope.authentication = Authentication;

		// Create new Concept
		$scope.create = function() {
			// Create new Concept object
			var concept = new Concepts ({
				name: this.name
			});

			// Redirect after save
			concept.$save(function(response) {
				$location.path('concepts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Concept
		$scope.remove = function(concept) {
			if ( concept ) { 
				concept.$remove();

				for (var i in $scope.concepts) {
					if ($scope.concepts [i] === concept) {
						$scope.concepts.splice(i, 1);
					}
				}
			} else {
				$scope.concept.$remove(function() {
					$location.path('concepts');
				});
			}
		};

		// Update existing Concept
		$scope.update = function() {
			var concept = $scope.concept;

			concept.$update(function() {
				$location.path('concepts/' + concept._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Concepts
		$scope.find = function() {
			$scope.concepts = Concepts.query();
		};

		// Find existing Concept
		$scope.findOne = function() {
			$scope.concept = Concepts.get({ 
				conceptId: $stateParams.conceptId
			});
		};
	}
]);