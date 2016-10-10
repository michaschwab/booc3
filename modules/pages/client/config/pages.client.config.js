'use strict';

// Configuring the Articles module
angular.module('pages').run(['Menus',
	function(Menus) {
		Menus.addMenuItem('topbar', {
			title: 'Paper',
			state: 'paper',
			type: 'item'/*,
			roles: ['admin', 'teacher']*/
		});

		/*Menus.addMenuItem('topbar', {
			title: 'Courses',
			state: 'courses.list',
			type: 'item',
			roles: ['admin', 'teacher']
		});*/

		/*Menus.addSubMenuItem('topbar', 'courses', {
			title: 'List Courses',
			state: 'courses.list'
		});

		Menus.addSubMenuItem('topbar', 'courses', {
			title: 'Create Course',
			state: 'courses.create'
		});*/

		//Menus.addSubMenuItem('topbar', 'courses', 'List Courses', 'courses');
		//Menus.addSubMenuItem('topbar', 'courses', 'New Course', 'courses/create');
	}
]);
