'use strict';

// Setting up route
angular.module('logs').config(['$stateProvider',
  function ($stateProvider) {
    // Articles state routing
    $stateProvider
      .state('logs', {
        abstract: true,
        url: '/logs',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      })
      .state('logs.list', {
        url: '?user&action',
        templateUrl: 'modules/logs/views/list.client.view.html',
        reloadOnSearch: false
      })
    .state('logs.chart', {
        url: '/chart',
        templateUrl: 'modules/logs/views/chart.client.view.html',
        reloadOnSearch: false
    });

  }
]);
