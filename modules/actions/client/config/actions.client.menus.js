'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Action History',
      state: 'actions.list',
      roles: ['admin', 'teacher']
    });
  }
]);
