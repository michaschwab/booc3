'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = [
    'ngResource',
    //'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'angularFileUpload',


    'RecursionHelper',

    'xml',
    'ui.select',
    'n3-line-chart',
    'ngSocketResource',
    'ngSanitize',
    'ngPDFViewer',
    'ngDialog',
      'ngTagsInput',
    'ui.moment-duration',
    'ui.sortable',
    'youtube-embed'
  ];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
