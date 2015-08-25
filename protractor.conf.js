'use strict';

// Protractor configuration
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['modules/*/tests/e2e/*.js'],
  params: {
      adminlogin:
      {
          user: 'admin',
          password: 'adminadmin',
          firstName: 'admin',
          lastName: 'admin',
          email: 'admin@admin.admin',
          displayName: 'admin admin'
      },
      login:
      {
          admin: function()
          {
              var params = browser.params;

              browser.get('http://localhost:3000/authentication/signin');

              element( by.model('credentials.username') ).sendKeys( params.adminlogin.user );
              element( by.model('credentials.password') ).sendKeys( params.adminlogin.password );
              element( by.partialButtonText('Sign in')).click();

              return browser.driver.wait(function()
              {
                  return element(by.binding('authentication.user.displayName') ).isPresent();
              }, 4000);
          }
      },
      logout: function()
      {
          element(by.binding('authentication.user.displayName') ).isPresent().then(function(present)
          {
              if(present)
              {
                  var userDropdown = element(by.binding('authentication.user.displayName')).element(by.xpath('..'));

                  userDropdown.click();

                  element( by.css('.signout-link')).click();

                  return browser.driver.wait(function() {

                      return element(by.css('.sign-in-link') ).isPresent();
                  }, 4000);
              }
          });


      }
  }

};
