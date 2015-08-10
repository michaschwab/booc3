'use strict';

// Configuring the Articles module
angular.module('contents').run(['Menus',
	function(Menus)
	{
		//this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position, checkRights) {

		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Lectures', 'contents', 'dropdown', '/courses/547e663e14e4e78d17677b6b/lectures', true);
		//Menus.addSubMenuItem('topbar', 'concepts', 'List Concepts', 'concepts');
		//Menus.addSubMenuItem('topbar', 'concepts', 'New Concept', 'concepts/create');
        //Menus.addSubMenuItem('topbar', 'concepts', 'Bulk Edit Concepts', 'concepts/bulkEdit');
		Menus.addMenuItem('topbar', 'Events', 'courveevents', 'dropdown', 'courseevents/', true, null, null, function(user)
		{
			return true; //return RightsChecker.isAnyContentEditor();
		});
		Menus.addSubMenuItem('topbar', 'courveevents', 'List Events', 'courseevents');
		Menus.addSubMenuItem('topbar', 'courveevents', 'Create Event', 'courseevents/create');
		//Menus.addSubMenuItem('topbar', 'concepts', 'New Concept', 'concepts/create');
		//Menus.addSubMenuItem('topbar', 'concepts', 'Bulk Edit Concepts', 'concepts/bulkEdit');
	}
]).config(function ($httpProvider) {
	$httpProvider.interceptors.push('xmlHttpInterceptor');
});
