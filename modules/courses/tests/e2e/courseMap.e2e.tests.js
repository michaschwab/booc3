'use strict';

var hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};

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

            //browser.params.logout();
        });

        it('Should activate a concept when clicked', function (done)
        {
            //browser.params.login.admin();
            var mapUrl = 'http://localhost:3000/courses/547e663e14e4e78d17677b6b';
            browser.get(mapUrl);

            // Making sure no concept is active right now.
            expect(element.all(by.css('.lxCircle.active')).count()).toBe(0);

            element.all(by.css('.lxCircle')).then(function(concepts)
            {
                var index = Math.round(Math.random() * (concepts.length - 1));
                var theConcept = concepts[index];

                theConcept.getAttribute('id').then(function(theConceptElId)
                {
                    var conceptId = theConceptElId.substr('concept-'.length);

                    theConcept.click().then(function()
                    {
                        browser.driver.sleep(1);

                        // Making sure the clicked concept has the 'active' CSS class.
                        expect(hasClass(theConcept, 'active')).toBeTruthy();

                        // Making sure the clicked concept is the only active concept.
                        expect(element.all(by.css('.lxCircle.active')).count()).toBe(1);

                        browser.getCurrentUrl().then(function(url)
                        {
                            // Making sure the URL was updated.
                            expect(url.substr(mapUrl.length)).toBe('?active=' + conceptId);

                            done();
                        });
                    });
                });
            });
        });

        it('Should show learning content in both panel and map', function (done)
        {
            //browser.params.login.admin();
            var activeConceptId = '54c179d0bea45f77edabd379';
            var mapUrl = 'http://localhost:3000/courses/547e663e14e4e78d17677b6b?active=' + activeConceptId;
            browser.get(mapUrl);

            // Making sure a concept is active right now.
            expect(element.all(by.css('.lxCircle.active')).count()).toBe(1);


            expect(element.all(by.css('.lxCircle.active .icon.play')).count()).toBe(1);

            expect(element.all(by.css('.sidepanel .concept-' + activeConceptId + ' .segment')).count()).toBe(3);
            //expect(element(by.css('.lxCircle.active .icon.play').isPresent())).toBe(true);
            //expect(element(by.css('.lxCircle.active .icon.play'))).toHaveAttr('opacity','0.3');

            done();
        });

        it('Should let you set concepts as goal', function(done)
        {
            var mapUrl = 'http://localhost:3000/courses/547e663e14e4e78d17677b6b';
            browser.get(mapUrl);

            // Making sure no concept is active right now.
            expect(element.all(by.css('.lxCircle.active')).count()).toBe(0);

            element.all(by.css('.lxCircle')).then(function(concepts)
            {
                var index = Math.round(Math.random() * (concepts.length - 1));
                var theConcept = concepts[index];

                theConcept.getAttribute('id').then(function(theConceptElId)
                {
                    var conceptId = theConceptElId.substr('concept-'.length);

                    theConcept.click().then(function()
                    {
                        browser.driver.sleep(1);

                        element(by.css('.set-goal')).click().then(function()
                        {
                            browser.getCurrentUrl().then(function(url)
                            {
                                // Making sure the URL was updated.
                                expect(url.substr(mapUrl.length)).toBe('?goal=' + conceptId + '&active=' + conceptId);

                                done();
                            });
                        });

                        // Making sure the clicked concept has the 'active' CSS class.
                        /*expect(hasClass(theConcept, 'active')).toBeTruthy();

                        // Making sure the clicked concept is the only active concept.
                        expect(element.all(by.css('.lxCircle.active')).count()).toBe(1);*/


                    });
                });
            });
        });
    });
});
