'use strict';

angular.module('conceptdependencies').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Dependencies', 'conceptdependencies', 'dropdown', '/conceptdependencies(/create)?', false, ['admin']);
        Menus.addSubMenuItem('topbar', 'conceptdependencies', 'Bulk Edit Dependencies', 'conceptdependencies/bulkEdit');
    }
]);
