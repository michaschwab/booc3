'use strict';

describe('Users E2E Tests:', function ()
{
    describe('Signin Validation', function ()
    {
        var params = browser.params;

        /*it('should display a proper home page after logging in', function()
        {
            browser.params.logout();

            //expect(element.all(by.cssContainingText('div.alert', 'Not authenticated. Please log in.')).count()).toBe(1);
            expect(element(by.cssContainingText('div.alert', 'Not authenticated. Please log in.')).isPresent()).toBe(true);

            browser.params.login.admin();
            browser.driver.sleep(1);

            //expect(element.all(by.css('.jumbotron')).count()).toBe(1);
            expect(element.all(by.cssContainingText('div.alert', 'Not authenticated. Please log in.')).count()).toBe(0);
            //expect(element(by.cssContainingText('div.alert', 'Not authenticated. Please log in.')).isPresent()).toBe(false);
        });*/


        /*it('Should report missing credentials', function () {
            browser.get('http://localhost:3000/authentication/signin');
            element(by.css('button[type=submit]')).click();
            element(by.binding('error')).getText().then(function (errorText) {
                expect(errorText).toBe('Missing credentials');
            });
        });

        it('should login successfully', function() {
            browser.get('http://localhost:3000/authentication/signin');
            element( by.model('credentials.username') ).sendKeys( params.adminlogin.user );
            element( by.model('credentials.password') ).sendKeys( params.adminlogin.password );
            element( by.partialButtonText('Sign in')).click();
            //expect( element(by.binding('authentication.user.displayName') ).getText() ).toEqual( params.adminlogin.displayName );
        });*/

        /*it('should sign up successfully', function() {
            browser.get('http://localhost:3000/authentication/signup');

            element( by.model('credentials.firstName') ).sendKeys( params.adminlogin.firstName );
            element( by.model('credentials.lastName') ).sendKeys( params.adminlogin.lastName );
            element( by.model('credentials.email') ).sendKeys( params.adminlogin.email );
            element( by.model('credentials.username') ).sendKeys( params.adminlogin.user );
            element( by.model('credentials.password') ).sendKeys( params.adminlogin.password );
            element( by.partialButtonText('Sign up')).click();
            expect( element(by.binding('authentication.user.displayName') ).getText() ).toEqual( params.adminlogin.displayName );
        });*/
    });
});
