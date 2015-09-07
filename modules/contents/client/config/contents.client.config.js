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
		/*Menus.addMenuItem('topbar', 'Contents', 'contents', 'dropdown', '/', true, null, null, function(user)
		{
			return RightsChecker.isAnyContentEditor();
		});*/

		Menus.addMenuItem('topbar', {
			title: 'Contents',
			state: 'contents',
			type: 'dropdown',
			roles: ['admin', 'teacher']
		});

		Menus.addSubMenuItem('topbar', 'contents', {
			title: 'Manage Contents',
			state: 'contents.manage'
		});

		Menus.addSubMenuItem('topbar', 'contents', {
			title: 'Create Contents',
			state: 'contents.create'
		});

		/*Menus.addMenuItem('topbar', 'Contents', 'contents', 'dropdown', '/', true, null, null, function(user)
		{
			return true;
		});
		Menus.addSubMenuItem('topbar', 'contents', 'List Contents', 'contents/list');
		Menus.addSubMenuItem('topbar', 'contents', 'Add Content', 'contents/add');*/
		//Menus.addSubMenuItem('topbar', 'concepts', 'New Concept', 'concepts/create');
		//Menus.addSubMenuItem('topbar', 'concepts', 'Bulk Edit Concepts', 'concepts/bulkEdit');
	}
]);
