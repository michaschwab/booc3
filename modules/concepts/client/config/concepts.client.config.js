'use strict';

// Configuring the Articles module
angular.module('concepts').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Concepts', 'concepts', 'dropdown', '/concepts(/create)?', false, ['admin']);
		//Menus.addSubMenuItem('topbar', 'concepts', 'List Concepts', 'concepts');
		//Menus.addSubMenuItem('topbar', 'concepts', 'New Concept', 'concepts/create');
        Menus.addSubMenuItem('topbar', 'concepts', 'Bulk Edit Concepts', 'concepts/bulkEdit');
	}
]);
