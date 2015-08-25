'use strict';

describe('Courses E2E Tests:', function () {
    describe('Signin Validation', function () {
        it('Should report missing credentials', function () {
            browser.get('http://localhost:3000/courses');
            expect(element.all(by.repeater('course in courses')).count()).toEqual(0);
        });


    });
});
