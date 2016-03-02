'use strict';

// Configuring the Articles module
angular.module('tags').run(['Menus',
	function(Menus)
	{
		Menus.addMenuItem('topbar', {
			title: 'Tags',
			state: 'tags.list',
			roles: ['admin', 'teacher', 'content-editor', 'ta']
		});
	}
]);
