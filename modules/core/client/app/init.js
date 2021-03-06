'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
  function ($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  }
]).config([
  '$provide', function($provide) {
    return $provide.decorator('$rootScope', [
      '$delegate', function($delegate) {
        $delegate.safeApply = function(fn) {
          var phase = $delegate.$$phase;
          if (phase === "$apply" || phase === "$digest") {
            if (fn && typeof fn === 'function') {
              fn();
            }
          } else {
            $delegate.$apply(fn);
          }
        };
        return $delegate;
      }
    ]);
  }
]).config( [
  '$compileProvider',
  function( $compileProvider )
  {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, $state, Authentication, $location, $window, Logger) {
  // Check authentication before changing state

  $rootScope.$watch(function(){ return $location.search(); }, function(){
    $rootScope.absUrl = $location.absUrl();
  }, true);

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

    $rootScope.absUrl = $location.absUrl();

    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        $state.go('authentication.signin', {}, {
          notify: false
        }).then(function () {
          $rootScope.$broadcast('$stateChangeSuccess', 'authentication.signin', {}, toState, toParams);
        });
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.absUrl = $location.absUrl();
    $state.previous = {
      state: fromState,
      params: fromParams,
      href: $state.href(fromState, fromParams)
    };

    if($window.ga)
      $window.ga('send', 'pageview', { page: $location.url() });
  });

  Logger.log('WindowLoad');

  $window.onbeforeunload = function(evt)
  {
    Logger.log('WindowUnload', null, evt);
  };
});

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') {
    window.location.hash = '#!';
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
