'use strict';

angular.module('users').controller('UserEditController',
    function($scope, $http, $location, Authentication, Users, $window, $stateParams, Courses) {
        $scope.authentication = Authentication;

        // If user is signed in then redirect back home
        //if ($scope.authentication.user) $location.path('/');

        $scope.userId = $stateParams.userId;

        $scope.roles =
        {
            'user': { display: 'User', description: 'Users can view public courses and their materials, and use other public features.' },
            'teacher': { display: 'Teacher', description: 'Teachers can create courses, and edit them and their materials, and remove the ones they created. Teachers can also manage the content editors of their classes, or give them the right to remove the course. ' },
            'admin': { display: 'Administrator', description: 'Admins can create, edit and remove all courses and manage users and their rights.' }
        };
        $scope.courseRoles =
        {
            'content-editor': { display: 'Content Editor', description: 'A Content Editor can add, change and remove all of a course\'s materials.' },
            'ta': { display: 'Teaching Assistant', description: 'A Teaching Assistant can add, change and remove all of a course\'s materials and concepts.' },
            'teacher': { display: 'Teacher', description: 'A Teacher can add, change and remove all of a course\'s materials and concepts, and even edit or remove the course.' }
        };
        $scope.newCourseRole = 'content-editor';

        var initialized = false;
        $scope.$watch('user.roles', function()
        {
            if($scope.user && $scope.user.roles && !initialized)
            {
                initialized = true;
                init();
            }
        });

        var init = function()
        {
            for(var role in $scope.roles)
            {
                if($scope.roles.hasOwnProperty(role))
                {
                    $scope.roles[role].active = $scope.user.roles.indexOf(role) != -1;
                }
            }

            $scope.courseadmins = [];

            $scope.user.roles.forEach(function(role)
            {
                var parts = role.split(';');
                if(parts[0] == 'courseadmin')
                {
                    // this is a course-specific role, no global role.
                    var courseAdmin = {
                        type: parts[1],
                        course: parts[2]
                    };

                    $scope.courseadmins.push(courseAdmin);
                }
            });
        };

        $scope.courses = Courses.query({}, function()
        {
            $scope.courseDirectory = {};
            $scope.courses.forEach(function(c) { $scope.courseDirectory[c._id] = c; });
        });

        $scope.addCourseRole = function(e)
        {
            var newRole = {
                course: $scope.course._id,
                type: $scope.newCourseRole
            };

            $scope.courseadmins.push(newRole);

            e.preventDefault();

            return false;
        };

        $scope.removeCourseRole = function(admin)
        {
            var makeIdWithoutId = function(a) { return a.course + '-' + a.type; };
            var index = $scope.courseadmins.map(makeIdWithoutId).indexOf(makeIdWithoutId(admin));

            $scope.courseadmins.splice(index, 1);
        };

        $scope.submit = function()
        {
            var getRoles = function()
            {
                var newRoles = [];

                // get global roles
                Object.keys($scope.roles).forEach(function(role)
                {
                    if($scope.roles[role].active)
                    {
                        newRoles.push(role);
                    }
                });

                // get course-specific roles
                $scope.courseadmins.forEach(function(courseadmin)
                {
                    var roleName = 'courseadmin;' + courseadmin.type + ';' + courseadmin.course;
                    newRoles.push(roleName);
                });

                return newRoles;
            };

            $scope.user.roles = getRoles();

            $scope.user.$update(function()
            {
                $location.path('/admin/users');
            });
        };

        $scope.toggleRole = function(role)
        {
            $scope.roles[role].active = !$scope.roles[role].active;
        };
    }
);
