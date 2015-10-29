'use strict';

// Setting up route
angular.module('actions').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('actions', {
        abstract: true,
        url: '/actions',
        template: '<ui-view/>',
        data: {
          roles: ['admin', 'courseadmin']
        }
      })
      .state('actions.list', {
        url: '',
        templateUrl: 'modules/actions/views/list.client.view.html'
      });
  }
]);
