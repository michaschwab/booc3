'use strict';

// Configuring the Articles module
angular.module('courses').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Courses', 'courses', 'dropdown', '/courses(/create)?');
		Menus.addSubMenuItem('topbar', 'courses', 'List Courses', 'courses');
		Menus.addSubMenuItem('topbar', 'courses', 'New Course', 'courses/create');
	}
]);