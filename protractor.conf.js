'use strict';

var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var path = require('path');

var i = 0;

// Protractor configuration
exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['modules/*/tests/e2e/*.js'],
    framework: 'jasmine2',
    multiCapabilities: [{
        'browserName': 'chrome',
        'chromeOptions' : {
            args: ['--lang=en',
                '--window-size=1400,900']
        }
    }/*, {
        'browserName': 'chrome',
        'chromeOptions' : {
            args: ['--lang=en',
                '--window-size=1280,860']
        }
    }*//*, {
        'browserName': 'chrome',
        'chromeOptions' : {
            args: ['--lang=en',
                '--window-size=2048,1536']
        }
    }, {
        'browserName': 'firefox'
    }*/],
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
          var userDropdown = element(by.binding('authentication.user.displayName')).element(by.xpath('..'));

          userDropdown.isDisplayed().then(function(present)
          {
              if(present)
              {
                  userDropdown.click();

                  element( by.css('.signout-link')).click();

                  return browser.driver.wait(function() {

                      return element(by.css('.sign-in-link') ).isPresent();
                  }, 4000);
              }
          });
      }
  },
    onPrepare: function() {
        jasmine.getEnv().defaultTimeoutInterval = 20000;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

        jasmine.getEnv().addReporter(
            new HtmlScreenshotReporter({
                dest: 'test-screenshots/',
                filename: 'my-report.html',
                pathBuilder: function(currentSpec, suites, browserCapabilities, windowSize) {
                    // will return chrome/your-spec-name.png
                    //console.log(browserCapabilities);
                    return browserCapabilities.get('browserName') + '-' + windowSize.width + '/' + currentSpec.fullName;
                }
            })
        );
    }

};
