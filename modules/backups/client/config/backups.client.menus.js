'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Backups',
      state: 'backups.manage',
      roles: ['admin', 'teacher', 'content-editor', 'ta']
    });
  }
]);
