'use strict';

// Configuring the Articles module
angular.module('contents').run(['Menus',
	function(Menus)
	{
		Menus.addMenuItem('topbar', {
			title: 'Course Events',
			state: 'courseevents',
			type: 'dropdown',
			roles: ['admin', 'teacher']
		});

		Menus.addSubMenuItem('topbar', 'courseevents', {
			title: 'Manage Events',
			state: 'courseevents.manage'
		});

		Menus.addSubMenuItem('topbar', 'courseevents', {
			title: 'Create Event',
			state: 'courseevents.create'
		});

	}
]).config(function ($httpProvider) {
	$httpProvider.interceptors.push('xmlHttpInterceptor');
});
