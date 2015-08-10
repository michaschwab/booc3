'use strict';

// Conceptdependencies controller
angular.module('conceptdependencies').controller('ConceptdependenciesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Conceptdependencies',
	function($scope, $stateParams, $location, Authentication, Conceptdependencies) {
		$scope.authentication = Authentication;

		// Create new Conceptdependency
		$scope.create = function() {
			// Create new Conceptdependency object
			var conceptdependency = new Conceptdependencies ({
				name: this.name
			});

			// Redirect after save
			conceptdependency.$save(function(response) {
				$location.path('conceptdependencies/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Conceptdependency
		$scope.remove = function(conceptdependency) {
			if ( conceptdependency ) { 
				conceptdependency.$remove();

				for (var i in $scope.conceptdependencies) {
					if ($scope.conceptdependencies [i] === conceptdependency) {
						$scope.conceptdependencies.splice(i, 1);
					}
				}
			} else {
				$scope.conceptdependency.$remove(function() {
					$location.path('conceptdependencies');
				});
			}
		};

		// Update existing Conceptdependency
		$scope.update = function() {
			var conceptdependency = $scope.conceptdependency;

			conceptdependency.$update(function() {
				$location.path('conceptdependencies/' + conceptdependency._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Conceptdependencies
		$scope.find = function() {
			$scope.conceptdependencies = Conceptdependencies.query();
		};

		// Find existing Conceptdependency
		$scope.findOne = function() {
			$scope.conceptdependency = Conceptdependencies.get({ 
				conceptdependencyId: $stateParams.conceptdependencyId
			});
		};
	}
]);