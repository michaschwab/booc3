'use strict';

var hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

describe('Courses E2E Tests:', function () {
    describe('Learning Buttons', function ()
    {
        it('Should let you learn concepts', function(done)
        {
            var activeConceptId = '54c179d0bea45f77edabd379';
            var mapUrl = 'http://localhost:3000/courses/547e663e14e4e78d17677b6b?active=' + activeConceptId;
            browser.get(mapUrl);

            browser.driver.sleep(2);

            //expect(element(by.css('.notseen-button'))).toBe(1);

            expect(hasClass(element(by.css('.notseen-button')), 'btn-primary')).toBeTruthy();
            expect(hasClass(element(by.css('.seen-button')), 'btn-primary')).toBeFalsy();

            element(by.css('.seen-button')).click();

            expect(hasClass(element(by.css('.notseen-button')), 'btn-primary')).toBeFalsy();
            expect(hasClass(element(by.css('.seen-button')), 'btn-primary')).toBeTruthy();

            lement(by.css('.notseen-button')).click();

            expect(hasClass(element(by.css('.notseen-button')), 'btn-primary')).toBeTruthy();
            expect(hasClass(element(by.css('.seen-button')), 'btn-primary')).toBeFalsy();

            done();

            //notseen-button btn-primary seen-button understood-button
        });
    });
});
