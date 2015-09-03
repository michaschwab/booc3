'use strict';

describe('Courses E2E Tests:', function () {
    describe('Map', function ()
    {

        /*it('Should not show when not logged in', function ()
        {
            browser.params.logout();
            browser.get('http://localhost:3000/courses/547e663e14e4e78d17677b6b');

            expect(element(by.id('vis')).isDisplayed()).toBe(false);
        });*/

        it('Should launch when logged in', function ()
        {
            browser.params.login.admin();
            browser.get('http://localhost:3000/courses/547e663e14e4e78d17677b6b');

            expect(element(by.id('vis')).isDisplayed()).toBe(true);

            // Make sure there are some concepts of all levels
            expect(element.all(by.css('.lxCircle')).count()).toBeGreaterThan(0);
            expect(element.all(by.css('.l1Circle')).count()).toBeGreaterThan(0);
            expect(element.all(by.css('.l2Circle')).count()).toBeGreaterThan(0);
            expect(element.all(by.css('.l3Circle')).count()).toBeGreaterThan(0);

            // Make sure there are some learning plans
            expect(element.all(by.css('.allPathHierarchy')).count()).toBeGreaterThan(0);


            //expect(element.all(by.repeater('course in courses')).count()).toBeGreaterThan(0);

            browser.params.logout();
        });


    });
});
