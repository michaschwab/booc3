'use strict';

angular.module('courseevents').controller('CourseeventsController',
	function($scope, $stateParams, $location, Courseevents, Courses, Concepts, $window)
	{
		//todo need to handle errors, eg no concept selected.

		$scope.update = function()
		{
			if((typeof $scope.event.course).toLowerCase() == 'object') $scope.event.course = $scope.event.course._id;
			var event = $scope.event;

			//console.log(event);

			event.$update(function() {
				$location.path('courses/' + event.course + '/courseevents');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(event)
		{
			event.$remove(function()
			{
				$window.location.reload();
			});
		};

		// Create new Event
		$scope.create = function()
		{
			//console.log($scope.event);
			if((typeof $scope.event.course).toLowerCase() == 'object') $scope.event.course = $scope.event.course._id;
			var event = new Courseevents($scope.event);

			// Redirect after save
			event.$save(function(response)
			{
				var courseId = response._id;

				$location.path('courses/' + $scope.event.course + '/courseevents');

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.list = function()
		{
			var courseId = $stateParams.courseId;
			$scope.active = {};

			$scope.courses = Courses.query({}, function()
			{
				if(courseId)
				{
					var courses = $scope.courses.filter(function(c) { return c._id == courseId; });
					if(courses.length)
					{
						$scope.active.course = courses[0];
					}
				}
			});

			if(courseId)
			{
				$scope.courseevents = Courseevents.query({course: courseId }, function()
				{
					var concepts = Concepts.query({courses: courseId }, function()
					{
						$scope.courseevents.forEach(function(event)
						{
							// try to map concept to event
							var conceptId = event.concept;
							var concept = concepts.filter(function(c) { return c._id == conceptId; });
							if(concept.length)
							{
								event.concept = concept[0];
							}
						});
					});
				});
			}

			$scope.$watch('active.course', function()
			{
				if($scope.active.course)
				{
					courseId = $scope.active.course._id;

					$location.path('courses/' + courseId + '/courseevents');
				}
			});
		};

		$scope.findOne = function()
		{
			var setCourse = function(courseId)
			{
				$scope.event.course = $scope.courses.filter(function(c) { return c._id == courseId; })[0];

				// hack for bugged angular-select plugin, should work without this
				angular.element('#courseSelect').scope().$select.selected = $scope.event.course;
			};

			$scope.courses = Courses.query({}, function()
			{
				if($stateParams.courseeventId)
				{
					$scope.event = Courseevents.get({
						courseeventId: $stateParams.courseeventId
					}, function()
					{
						setCourse($scope.event.course);
					});
				}
				else
				{
					$scope.event =
					{
						name: '',
						when: 'before',
						description: '',
						concept: null,
						course: null,
						created: null
					};

					if($stateParams.courseId)
					{
						setCourse($stateParams.courseId);
					}
				}
			});

			$scope.selectConcept = function(concept)
			{
				$scope.event.concept = concept._id;
			};

			$scope.$watch('event.course', function()
			{

				if($scope.event)
				{
					var course = $scope.event.course;

					if(course)
					{
						var courseId = course._id;

						$scope.concepts = Concepts.query({ courses: courseId }, function()
						{
							if($scope.event.concept)
							{
								var conceptId = $scope.event.concept;
								var concept = $scope.concepts.filter(function(c) { return c._id == conceptId; })[0];

								if(concept)
								{
									// hack for bugged angular-select plugin, should work without this
									angular.element('#conceptSelect .ui-select-container').scope().$select.selected = concept;
								}
								else
								{
									// assigned concept is not in course.
									$scope.event.concept = '';
									angular.element('#conceptSelect .ui-select-container').scope().$select.selected = null;
								}
							}
						});
					}
				}
			});
		};
	}
);
