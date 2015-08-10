'use strict';

(function() {
	// Concepts Controller Spec
	describe('Concepts Controller Tests', function() {
		// Initialize global variables
		var ConceptsController,
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

			// Initialize the Concepts controller.
			ConceptsController = $controller('ConceptsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Concept object fetched from XHR', inject(function(Concepts) {
			// Create sample Concept using the Concepts service
			var sampleConcept = new Concepts({
				name: 'New Concept'
			});

			// Create a sample Concepts array that includes the new Concept
			var sampleConcepts = [sampleConcept];

			// Set GET response
			$httpBackend.expectGET('concepts').respond(sampleConcepts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.concepts).toEqualData(sampleConcepts);
		}));

		it('$scope.findOne() should create an array with one Concept object fetched from XHR using a conceptId URL parameter', inject(function(Concepts) {
			// Define a sample Concept object
			var sampleConcept = new Concepts({
				name: 'New Concept'
			});

			// Set the URL parameter
			$stateParams.conceptId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/concepts\/([0-9a-fA-F]{24})$/).respond(sampleConcept);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.concept).toEqualData(sampleConcept);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Concepts) {
			// Create a sample Concept object
			var sampleConceptPostData = new Concepts({
				name: 'New Concept'
			});

			// Create a sample Concept response
			var sampleConceptResponse = new Concepts({
				_id: '525cf20451979dea2c000001',
				name: 'New Concept'
			});

			// Fixture mock form input values
			scope.name = 'New Concept';

			// Set POST response
			$httpBackend.expectPOST('concepts', sampleConceptPostData).respond(sampleConceptResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Concept was created
			expect($location.path()).toBe('/concepts/' + sampleConceptResponse._id);
		}));

		it('$scope.update() should update a valid Concept', inject(function(Concepts) {
			// Define a sample Concept put data
			var sampleConceptPutData = new Concepts({
				_id: '525cf20451979dea2c000001',
				name: 'New Concept'
			});

			// Mock Concept in scope
			scope.concept = sampleConceptPutData;

			// Set PUT response
			$httpBackend.expectPUT(/concepts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/concepts/' + sampleConceptPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid conceptId and remove the Concept from the scope', inject(function(Concepts) {
			// Create new Concept object
			var sampleConcept = new Concepts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Concepts array and include the Concept
			scope.concepts = [sampleConcept];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/concepts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleConcept);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.concepts.length).toBe(0);
		}));
	});
}());