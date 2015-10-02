'use strict';

describe('Courses E2E Tests:', function () {
    describe('Signin Validation', function ()
    {
        it('Should report missing credentials', function ()
        {
            browser.params.logout();
            browser.get('http://localhost:3000/');
            expect(element.all(by.repeater('course in courses')).count()).toEqual(0);
            //browser.driver.wait(function() {}, 10000);
        });

        it('Should should list some courses once logged in', function ()
        {
            browser.params.login.admin();
            browser.get('http://localhost:3000/');

            expect(element.all(by.repeater('course in courses')).count()).toBeGreaterThan(0);

            //browser.params.logout();
        });


    });
});
