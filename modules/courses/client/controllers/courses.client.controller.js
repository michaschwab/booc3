'use strict';

// Courses controller
angular.module('courses').controller('CoursesController',
	function($http, $scope, $stateParams, $location, Authentication, Courses, Concepts, LearnedConcepts, $state, Logger, Courseruns)
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

			course.$update(function()
			{
				$scope.courseruns.forEach(function(courseRun)
				{
					if(courseRun._id)
					{
						if(!courseRun.deleted)
						{
							courseRun.$update();
						}
						else
						{
							courseRun.$remove();
						}
					}
					else if(!courseRun.deleted)
					{
						var run = new Courseruns(courseRun);
						run.$save();
					}
				});


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
					course.learnedConceptObjects = LearnedConcepts.query({course: course._id, user: $scope.authentication.user._id });
				});
			});
		};

		$scope.enterCourse  = function(course, event)
		{
			Logger.log('EnterCourse', { courseId: course._id }, event);
		};

		// Find existing Course
		$scope.editPrep = function()
		{
			var hasAccess;

			if($stateParams.courseId)
			{
				var courseId = $stateParams.courseId;

				hasAccess = Authentication.isCourseTeacher(courseId);
				if(!hasAccess)
				{
					console.error('no access: you are not a course teacher of this course');
					$state.go('home');
				}

				$scope.course = Courses.get({
					courseId: courseId
				});

				$scope.courseruns = Courseruns.query({course: courseId }, function()
				{
					$scope.courseruns.map(function(courseRun)
					{
						courseRun.deleted = false;
						courseRun['start_text'] = moment(courseRun.start).format('YYYY-MM-DD');
					});
				});
			}
			else
			{
				hasAccess = Authentication.isTeacher();
				if(!hasAccess)
				{
					console.error('no access: you are not teacher');
					$state.go('home');
				}

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

		$scope.runStartChange = function(courserun)
		{
			var startDate = moment(courserun.start_text, "YYYY-MM-DD");
			courserun.start = startDate;
		};

		$scope.addCourseRun = function(event)
		{
			var courseRun = {
				title: '',
				course: $scope.course._id,
				start: new Date(),
				'start_text': moment().format('YYYY-MM-DD'),
				deleted: false
			};
			$scope.courseruns.push(courseRun);

			event.preventDefault();
		};

		$scope.deleteCourseRun = function(courserun, event)
		{
			//$scope.courseruns.splice($scope.courseruns.indexOf(courserun), 1);
			courserun.deleted = true;
			event.preventDefault();
		};
	}
);
