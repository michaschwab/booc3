'use strict';

(function() {
	// Conceptdependencies Controller Spec
	describe('Conceptdependencies Controller Tests', function() {
		// Initialize global variables
		var ConceptdependenciesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Conceptdependencies controller.
			ConceptdependenciesController = $controller('ConceptdependenciesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Conceptdependency object fetched from XHR', inject(function(Conceptdependencies) {
			// Create sample Conceptdependency using the Conceptdependencies service
			var sampleConceptdependency = new Conceptdependencies({
				name: 'New Conceptdependency'
			});

			// Create a sample Conceptdependencies array that includes the new Conceptdependency
			var sampleConceptdependencies = [sampleConceptdependency];

			// Set GET response
			$httpBackend.expectGET('conceptdependencies').respond(sampleConceptdependencies);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.conceptdependencies).toEqualData(sampleConceptdependencies);
		}));

		it('$scope.findOne() should create an array with one Conceptdependency object fetched from XHR using a conceptdependencyId URL parameter', inject(function(Conceptdependencies) {
			// Define a sample Conceptdependency object
			var sampleConceptdependency = new Conceptdependencies({
				name: 'New Conceptdependency'
			});

			// Set the URL parameter
			$stateParams.conceptdependencyId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/conceptdependencies\/([0-9a-fA-F]{24})$/).respond(sampleConceptdependency);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.conceptdependency).toEqualData(sampleConceptdependency);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Conceptdependencies) {
			// Create a sample Conceptdependency object
			var sampleConceptdependencyPostData = new Conceptdependencies({
				name: 'New Conceptdependency'
			});

			// Create a sample Conceptdependency response
			var sampleConceptdependencyResponse = new Conceptdependencies({
				_id: '525cf20451979dea2c000001',
				name: 'New Conceptdependency'
			});

			// Fixture mock form input values
			scope.name = 'New Conceptdependency';

			// Set POST response
			$httpBackend.expectPOST('conceptdependencies', sampleConceptdependencyPostData).respond(sampleConceptdependencyResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Conceptdependency was created
			expect($location.path()).toBe('/conceptdependencies/' + sampleConceptdependencyResponse._id);
		}));

		it('$scope.update() should update a valid Conceptdependency', inject(function(Conceptdependencies) {
			// Define a sample Conceptdependency put data
			var sampleConceptdependencyPutData = new Conceptdependencies({
				_id: '525cf20451979dea2c000001',
				name: 'New Conceptdependency'
			});

			// Mock Conceptdependency in scope
			scope.conceptdependency = sampleConceptdependencyPutData;

			// Set PUT response
			$httpBackend.expectPUT(/conceptdependencies\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/conceptdependencies/' + sampleConceptdependencyPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid conceptdependencyId and remove the Conceptdependency from the scope', inject(function(Conceptdependencies) {
			// Create new Conceptdependency object
			var sampleConceptdependency = new Conceptdependencies({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Conceptdependencies array and include the Conceptdependency
			scope.conceptdependencies = [sampleConceptdependency];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/conceptdependencies\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleConceptdependency);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.conceptdependencies.length).toBe(0);
		}));
	});
}());