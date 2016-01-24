'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Users',
      state: 'admin.users',
      roles: ['admin', 'teacher']
    });
  }
]);
