'use strict';

// Courses controller
angular.module('courses').controller('CoursesController',
	function($http, $scope, $stateParams, $location, Authentication, Courses, Concepts, LearnedConcepts, $state)
	{
		$scope.authentication = Authentication;

		$scope.courseRoles =
		{
			'content-editor': { display: 'Content Editor', description: 'A Content Editor can add, change and remove all of a course\'s materials.' },
			'ta': { display: 'Teaching Assistant', description: 'A Teaching Assistant can add, change and remove all of a course\'s materials and concepts.' },
			'teacher': { display: 'Teacher', description: 'A Teacher can add, change and remove all of a course\'s materials and concepts, and even edit or remove the course.' }
		};

		// Create new Course
		$scope.create = function()
		{

			var course = new Courses($scope.course);

			// Redirect after save
			course.$save(function(response)
			{
				var courseId = response._id;

				// Now also create a first concept so the map will work
				var concept = new Concepts(
				{
					"children" : [],
					//"color" : "#338833",
					"color" : "#CB654F",
					"courses" : [courseId],
					"dependencies" : [],
					"order" : 0,
					"parents" : [],
					"providing" : [],
					"segments" : [],
					"title" : "First Concept"
				});

				concept.$save(function(r)
				{
					$state.go('courses.view', {
						courseId: courseId,
						mode: 'admin'
					});
				});

				// Clear form fields
				$scope.name = '';

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Course
		$scope.remove = function(course) {

			var theCourse = course ? course : $scope.course;
			var courseId = theCourse._id;

			// create backup first
			$http.post('api/backups/' + courseId).then(function(response)
			{
				//success
				var fileName = response.data;
				var url = '/api/backups/' + courseId + '/' + fileName;

				if ( course ) {
					course.$remove();

					//this is only necessary because courses dont run on socketresource (yet). could do that.
					for (var i in $scope.courses) {
						if ($scope.courses [i] === course) {
							$scope.courses.splice(i, 1);
						}
					}
				} else {
					$scope.course.$remove(function() {
						$state.go('courses.list');
					});
				}

			}, function(err)
			{
				console.error(err);
			});
		};

		// Update existing Course
		$scope.update = function() {
			var course = $scope.course;

			course.$update(function() {

				$state.go('courses.view', {
					courseId: course._id,
					mode: 'admin'
				});
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Courses
		$scope.find = function()
		{
			$scope.courses = Courses.query(function()
			{
				$scope.courses.forEach(function(course)
				{
					course.conceptObjects = Concepts.query({courses: course._id });
					course.learnedConceptObjects = LearnedConcepts.query({course: course._id });
				});
			});
		};

		// Find existing Course
		$scope.findOne = function() {

			if($stateParams.courseId)
			{
				$scope.course = Courses.get({
					courseId: $stateParams.courseId
				});
			}
			else
			{
				$scope.course =
				{
					title: '',
					short: '',
					description: '',
					concepts: [],
					segments: []
				};
			}

		};
	}
);
