'use strict';

// Protractor configuration
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['modules/*/tests/e2e/*.js'],
  params: {
    adminlogin: {
      user: 'admin',
      password: 'adminadmin',
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@admin.admin',
      displayName: 'admin admin'
    }
  }
};
